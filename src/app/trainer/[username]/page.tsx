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
import { getTrainerSchedule } from "@/app/profile/actions/booking-actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import { Button } from "@/components/ui";

// Define interfaces for the data structure
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
const DEFAULT_BANNER_IMAGE = "/default-banner.jpg"; // Replace with actual default banner
const DEFAULT_PROFILE_IMAGE = "/default-profile.jpg"; // Replace with actual default profile image

interface TrainerProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: TrainerProfilePageProps): Promise<Metadata> {
  const username = (await params).username;
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
      images: profileImageUrl ? [profileImageUrl] : [], // Use trainer's profile pic
    },
    twitter: {
      title: pageTitle,
      description: description,
      images: profileImageUrl ? [profileImageUrl] : [],
    },
    // DYNAMIC JSON-LD STRUCTURED DATA
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
  const { username } = await params;
  const userWithProfile: UserWithProfile | null =
    await getTrainerProfileByUsername(username);

  if (!userWithProfile || !userWithProfile.profile) {
    notFound(); // Or return a custom "Profile not found" component
  }

  const schedule = await getTrainerSchedule(userWithProfile.id);

  const { profile, name } = userWithProfile;

  // Helper to render HTML content safely
  const renderHTML = (htmlString: string | null | undefined) => {
    if (!htmlString) return null;
    return <p dangerouslySetInnerHTML={{ __html: htmlString }} />;
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section id="hero-section" className="relative bg-neutral-900 text-white -mt-[82px]">
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
          <Button asChild size="lg">
            <a href="#booking-section">Book a Session</a>
          </Button>
          
          {profile.location && (
            <p className="text-gray-300 mt-6 text-sm flex items-center justify-center">
              <MapPinIcon className="w-4 h-4 mr-1.5" />
              {profile.location}
            </p>
          )}
        </div>
      </section>

      <div className="bg-neutral-50 dark:bg-black">
        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-0 py-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Main content) */}
          <div className="lg:col-span-2 space-y-8">
            {/* About, Philosophy, Methodology Section */}
            {(profile.aboutMe || profile.philosophy || profile.methodology) && (
              <Card>
                <CardContent className="pt-6">
                 <div className="prose lg:prose-xl dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300">
                    {profile.aboutMe && (
                      <>
                        <h2 className="text-2xl font-semibold mb-3">
                          About Me
                        </h2>
                        {renderHTML(profile.aboutMe)}
                      </>
                    )}
                    {profile.philosophy && (
                      <>
                        <h2 className="text-2xl font-semibold mt-8 mb-3">
                          My Philosophy
                        </h2>
                        {renderHTML(profile.philosophy)}
                      </>
                    )}
                    {profile.methodology && (
                      <>
                        <h2 className="text-2xl font-semibold mt-8 mb-3">
                          My Methodology
                        </h2>
                        {renderHTML(profile.methodology)}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits Section */}
            {profile.benefits && profile.benefits.length > 0 && (
              <Card>
                 <CardHeader><CardTitle>Why Train With Me?</CardTitle></CardHeader>
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

            {/* Services Section */}
            {profile.services && profile.services.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Services Offered</CardTitle></CardHeader>
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

            {/* Transformation Photos Section */}
            {profile.transformationPhotos && profile.transformationPhotos.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Client Transformations</CardTitle></CardHeader>
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

            {/* Testimonials Section */}
            {profile.testimonials && profile.testimonials.length > 0 && (
              <Card>
                <CardHeader><CardTitle>What Clients Say</CardTitle></CardHeader>
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

          {/* Right Column (Booking) */}
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
                  <CardHeader><CardTitle className="text-center">Find Me Online</CardTitle></CardHeader>
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