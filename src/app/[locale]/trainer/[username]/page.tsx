
// src/app/trainer/[username]/page.tsx
import PublicLayout from "@/components/layouts/PublicLayout";
import { getTrainerProfileByUsername } from "@/lib/api/trainers";
import { notFound } from "next/navigation";
import {
  BannerImage,
  ProfileImage,
  TransformationImage,
} from "@/components/ui/ImageComponents";
import { MapPinIcon } from "@heroicons/react/24/outline";
import PublicCalendar from "@/components/trainer/PublicCalendar";
import { Metadata } from "next";
import { transformImagePath } from "@/lib/utils";
import { getTrainerSchedule } from "../../profile/actions/booking-actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import { Button } from "@/components/ui";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server"; 
import { prisma } from "@/lib/prisma"; 
import ShareOrUnlinkButton from "@/components/trainer/ShareOrUnlinkButton";

// ... (interfaces remain the same) ...
interface Benefit {
  id: string;
  title: string;
  description: string | null;
}

interface Service {
  id: string;
  title: string;
  description: string | null;
}

interface TransformationPhoto {
  id: string;
  imagePath: string;
  caption: string | null;
}

interface Testimonial {
  id:string;
  testimonialText: string | null;
  clientName: string;
}

interface ExternalLink {
  id: string;
  label: string;
  linkUrl: string;
}

interface TrainerProfile {
  id: string;
  userId: string;
  aboutMe: string | null;
  philosophy: string | null;
  methodology: string | null;
  certifications: string | null;
  location: string | null;
  phone: string | null;
  bannerImagePath: string | null;
  profilePhotoPath: string | null;
  benefits: Benefit[];
  services: Service[];
  transformationPhotos: TransformationPhoto[];
  testimonials: Testimonial[];
  externalLinks: ExternalLink[];
}

interface UserWithProfile {
  id: string;
  name: string | null;
  email: string;
  profile: TrainerProfile | null;
}

// Placeholder for default images
const DEFAULT_BANNER_IMAGE = "/default-banner.jpg";
const DEFAULT_PROFILE_IMAGE = "/default-profile.jpg";

interface TrainerProfilePageProps {
  params: Promise<{ username: string, locale: string }>;
}

export async function generateMetadata({
  params,
}: TrainerProfilePageProps): Promise<Metadata> {
  const {username} = await params;
  const user = await getTrainerProfileByUsername(username);

  if (!user || !user.profile) {
    return {
      title: "Profile Not Found",
    };
  }

  const { name, profile } = user;
  const pageTitle = `${name} | Personal Trainer in ${profile.location || "Your Area"}`;
  const description =
    profile.philosophy?.substring(0, 155) ||
    `Learn more about ${name}, a certified personal trainer specializing in helping clients achieve their fitness goals.`;
  const profileImageUrl = transformImagePath(profile.profilePhotoPath);

  return {
    title: pageTitle,
    description: description,
    alternates: {
      canonical: `/trainer/${username}`,
    },
    openGraph: {
      title: pageTitle,
      description: description,
      url: `/trainer/${username}`,
      images: profileImageUrl ? [profileImageUrl] : [],
    },
    twitter: {
      title: pageTitle,
      description: description,
      images: profileImageUrl ? [profileImageUrl] : [],
    },
    other: {
      'script[type="application/ld+json"]': JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        name: name,
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/trainer/${username}`,
        image: profileImageUrl,
        jobTitle: "Personal Trainer",
        description: description,
        address: profile.location
          ? {
              "@type": "PostalAddress",
              addressLocality: profile.location,
            }
          : undefined,
      }),
    },
  };
}

export default async function TrainerProfilePage({
  params,
}: TrainerProfilePageProps) {
    const { locale, username } = await params;
  const t = await getTranslations({locale: locale, namespace: 'TrainerProfilePage'});

  const userWithProfile: UserWithProfile | null =
    await getTrainerProfileByUsername(username);

  if (!userWithProfile || !userWithProfile.profile) {
    notFound();
  }

  // --- START: MODIFIED LOGIC TO CHECK LINK STATUS ---
  const supabase = await createClient();
  const { data: { user: sessionUser } } = await supabase.auth.getUser();
  
  let showActionButtons = false;
  let isAlreadyLinked = false;

  if (sessionUser) {
    // Corrected Prisma Query
    const clientRecord = await prisma.client.findUnique({
      where: { userId: sessionUser.id },
      select: { 
        trainerId: true,
        user: { // Follow the relation to the User model
          select: {
            role: true // Select the role from the related User
          }
        }
      }
    });
  
    // Check if the logged-in user is a client.
    if (clientRecord && clientRecord.user?.role === 'client') {
      showActionButtons = true;
      // Check if the client's linked trainerId matches the ID of the trainer profile being viewed.
      if (clientRecord.trainerId === userWithProfile.id) {
        isAlreadyLinked = true;
      }
    }
  }
  // --- END: MODIFIED LOGIC ---

  const schedule = await getTrainerSchedule(userWithProfile.id);

  const { profile, name } = userWithProfile;

  const renderHTML = (htmlString: string | null | undefined) => {
    if (!htmlString) return null;
    return <p dangerouslySetInnerHTML={{ __html: htmlString }} />;
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section id="hero-section" className="relative bg-neutral-900 text-white">
        <BannerImage
          src={profile.bannerImagePath || DEFAULT_BANNER_IMAGE}
          alt={`${name}'s banner`}
          layout="fill"
          objectFit="cover"
          quality={85}
          className="absolute inset-0"
          defaultSrc={DEFAULT_BANNER_IMAGE}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-50 text-center">
          <div className="mb-6">
            <ProfileImage
              src={profile.profilePhotoPath || DEFAULT_PROFILE_IMAGE}
              alt={`${name}'s profile photo`}
              width={180}
              height={180}
              className="w-44 h-44 rounded-full object-cover mx-auto border-4 border-white/10 shadow-lg"
              defaultSrc={DEFAULT_PROFILE_IMAGE}
            />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 text-white">
            {name}
          </h1>
          {profile.certifications && (
            <p className="text-lg sm:text-xl text-gray-200 mb-6 max-w-2xl mx-auto">
              {profile.certifications}
            </p>
          )}

          <div className="flex justify-center items-center gap-4">
            <Button asChild size="lg">
              <a href="#booking-section">{t('bookSession')}</a>
            </Button>
            {showActionButtons && name && (
              <ShareOrUnlinkButton 
                trainerUsername={username} 
                trainerName={name} 
                isAlreadyLinked={isAlreadyLinked} 
              />
            )}
          </div>
          
          {profile.location && (
            <p className="text-gray-300 mt-6 text-sm flex items-center justify-center">
              <MapPinIcon className="w-4 h-4 mr-1.5" />
              {profile.location}
            </p>
          )}
        </div>
      </section>

      {/* ... (rest of the component remains the same) ... */}
      <div className="bg-neutral-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-0 py-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {(profile.aboutMe || profile.philosophy || profile.methodology) && (
              <Card>
                <CardContent className="pt-6">
                 <div className="prose lg:prose-xl dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300">
                    {profile.aboutMe && (
                      <>
                        <h2 className="text-2xl font-semibold mb-3">
                          {t('aboutMe')}
                        </h2>
                        {renderHTML(profile.aboutMe)}
                      </>
                    )}
                    {profile.philosophy && (
                      <>
                        <h2 className="text-2xl font-semibold mt-8 mb-3">
                          {t('myPhilosophy')}
                        </h2>
                        {renderHTML(profile.philosophy)}
                      </>
                    )}
                    {profile.methodology && (
                      <>
                        <h2 className="text-2xl font-semibold mt-8 mb-3">
                          {t('myMethodology')}
                        </h2>
                        {renderHTML(profile.methodology)}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {profile.benefits && profile.benefits.length > 0 && (
              <Card>
                 <CardHeader><CardTitle>{t('whyTrainWithMe')}</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {profile.benefits.map((benefit: Benefit) => (
                        <div
                          key={benefit.id}
                          className="bg-neutral-100 dark:bg-neutral-900 p-6 rounded-lg text-center"
                        >
                          <h3 className="text-xl font-semibold mb-2">
                            {benefit.title}
                          </h3>
                          <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                            {benefit.description}
                          </p>
                        </div>
                      ))}
                    </div>
                </CardContent>
              </Card>
            )}

            {profile.services && profile.services.length > 0 && (
              <Card>
                <CardHeader><CardTitle>{t('servicesOffered')}</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-6">
                      {profile.services.map((service: Service) => (
                        <div key={service.id} className="bg-neutral-100 dark:bg-neutral-900 p-6 rounded-lg">
                          <h3 className="text-xl font-semibold mb-2">
                            {service.title}
                          </h3>
                          <div
                            className="text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap prose dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: service.description || "",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                </CardContent>
              </Card>
            )}

            {profile.transformationPhotos && profile.transformationPhotos.length > 0 && (
              <Card>
                <CardHeader><CardTitle>{t('clientTransformations')}</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {profile.transformationPhotos.map(
                      (photo: TransformationPhoto) => (
                        <div
                          key={photo.id}
                          className="group relative rounded-lg overflow-hidden shadow-lg"
                        >
                          {photo.imagePath && (
                            <TransformationImage
                              src={photo.imagePath}
                              alt={photo.caption || "Transformation photo"}
                              width={400}
                              height={300}
                              className="w-full h-auto object-cover"
                            />
                          )}
                          {photo.caption && (
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/50 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                              {photo.caption}
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {profile.testimonials && profile.testimonials.length > 0 && (
              <Card>
                <CardHeader><CardTitle>{t('whatClientsSay')}</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-6">
                      {profile.testimonials.map((testimonial: Testimonial) => (
                        <blockquote
                          key={testimonial.id}
                          className="p-6 bg-neutral-100 dark:bg-neutral-900 rounded-lg"
                        >
                          <p className="text-gray-600 dark:text-gray-200 italic mb-4">
                            “{testimonial.testimonialText}”
                          </p>
                          <footer className="text-right font-semibold text-gray-700 dark:text-gray-100">
                            - {testimonial.clientName}
                          </footer>
                        </blockquote>
                      ))}
                    </div>
                </CardContent>
              </Card>
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              <Card id="booking-section">
                <PublicCalendar
                  trainerId={userWithProfile.id}
                  initialSchedule={schedule}
                />
              </Card>
              
              {profile.externalLinks && profile.externalLinks.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-center">{t('findMeOnline')}</CardTitle></CardHeader>
                  <CardContent>
                      <div className="flex flex-wrap justify-center gap-3">
                        {profile.externalLinks.map((link: ExternalLink) => (
                          <Button asChild key={link.id} variant="secondary">
                            <a
                              href={link.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {link.label}
                            </a>
                          </Button>
                        ))}
                      </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}