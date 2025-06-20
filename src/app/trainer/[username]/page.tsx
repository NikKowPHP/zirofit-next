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
import ContactForm from "@/components/trainer/ContactForm";
import { Metadata } from "next";
import { transformImagePath } from "@/lib/utils";

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
  id: string;
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
const DEFAULT_BANNER_IMAGE = "/next.svg"; // Replace with actual default banner
const DEFAULT_PROFILE_IMAGE = "/next.svg"; // Replace with actual default profile image

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

  const { profile, name, email: trainerActualEmail } = userWithProfile;
  const trainerName = name || ""; // Ensure name is a string
  const trainerEmail = trainerActualEmail || ""; // Ensure email is a string

  // Helper to render HTML content safely
  const renderHTML = (htmlString: string | null | undefined) => {
    if (!htmlString) return null;
    // In a real app, ensure this HTML is sanitized if it comes from user input.
    // For Prisma data that was purified on input, this is okay.
    return <div dangerouslySetInnerHTML={{ __html: htmlString }} />;
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section id="hero-section" className="relative bg-gray-800 text-white">
        <BannerImage
          src={profile.bannerImagePath || DEFAULT_BANNER_IMAGE}
          alt={`${name}'s banner`}
          layout="fill"
          objectFit="cover"
          quality={85}
          className="absolute inset-0 opacity-40"
          defaultSrc={DEFAULT_BANNER_IMAGE}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
          <div className="mb-8">
            <ProfileImage
              src={profile.profilePhotoPath || DEFAULT_PROFILE_IMAGE}
              alt={`${name}'s profile photo`}
              width={160}
              height={160}
              className="w-40 h-40 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
              defaultSrc={DEFAULT_PROFILE_IMAGE}
            />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3">
            {name}
          </h1>
          {profile.certifications && (
            <p className="text-lg sm:text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
              {profile.certifications}
            </p>
          )}
          {/* Contact Button - placeholder for now */}
          {/* <Button size="lg" onClick={() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })}>
            Get In Touch
          </Button> */}
          <a
            href="#contact-section"
            className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-8 rounded-lg text-lg font-semibold transition-colors shadow-md"
          >
            Book a Session
          </a>
          {profile.location && (
            <p className="text-gray-400 mt-6 text-sm flex items-center justify-center">
              <MapPinIcon className="w-4 h-4 mr-1.5" />
              {profile.location}
            </p>
          )}
        </div>
      </section>

      {/* About, Philosophy, Methodology Section */}
      {(profile.aboutMe || profile.philosophy || profile.methodology) && (
        <section
          id="about-section"
          className="py-16 md:py-24 bg-white dark:bg-gray-900 dark:text-gray-200"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose lg:prose-xl dark:prose-invert">
            {profile.aboutMe && (
              <>
                <h2 className="text-3xl font-semibold mt-8 mb-3">About Me</h2>
                {renderHTML(profile.aboutMe)}
              </>
            )}
            {profile.philosophy && (
              <>
                <h2 className="text-3xl font-semibold mt-8 mb-3">
                  My Philosophy
                </h2>
                <div className="prose lg:prose-xl dark:prose-invert">
                  {renderHTML(profile.philosophy)}
                </div>
              </>
            )}
            {profile.methodology && (
              <>
                <h2 className="text-3xl font-semibold mt-8 mb-3">
                  My Methodology
                </h2>
                <div className="prose lg:prose-xl dark:prose-invert">
                  {renderHTML(profile.methodology)}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Benefits Section */}
      {profile.benefits && profile.benefits.length > 0 && (
        <section
          id="benefits-section"
          className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
              Why Train With Me?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {profile.benefits.map((benefit: Benefit) => (
                <div
                  key={benefit.id}
                  className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md text-center"
                >
                  {/* Add icon rendering here if you have an icon component */}
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      {profile.services && profile.services.length > 0 && (
        <section
          id="services-section"
          className="py-16 md:py-24 bg-white dark:bg-gray-900"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
              Services Offered
            </h2>
            <div className="space-y-8">
              {profile.services.map((service: Service) => (
                <div
                  key={service.id}
                  className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow"
                >
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Transformation Photos Section */}
      {profile.transformationPhotos &&
        profile.transformationPhotos.length > 0 && (
          <section
            id="transformations-section"
            className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800"
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
                Client Transformations
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {profile.transformationPhotos.map(
                  (photo: TransformationPhoto) => (
                    <div
                      key={photo.id}
                      className="rounded-lg overflow-hidden shadow-lg"
                    >
                      {photo.imagePath && ( //
                        <TransformationImage
                          src={photo.imagePath}
                          alt={photo.caption || "Transformation photo"}
                          width={400}
                          height={300}
                          className="w-full h-auto object-cover"
                        />
                      )}

                      {photo.caption && (
                        <p className="p-3 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 text-center">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>
          </section>
        )}

      {/* Testimonials Section */}
      {profile.testimonials && profile.testimonials.length > 0 && (
        <section
          id="testimonials-section"
          className="py-16 md:py-24 bg-white dark:bg-gray-900"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
              What Clients Say
            </h2>
            <div className="space-y-8">
              {profile.testimonials.map((testimonial: Testimonial) => (
                <blockquote
                  key={testimonial.id}
                  className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow"
                >
                  <p className="text-gray-600 dark:text-gray-200 italic mb-4">
                    &ldquo;{testimonial.testimonialText}&rdquo;
                  </p>
                  <footer className="text-right font-semibold text-gray-700 dark:text-gray-100">
                    - {testimonial.clientName}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* External Links Section */}
      {profile.externalLinks && profile.externalLinks.length > 0 && (
        <section
          id="links-section"
          className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">
              Find Me Online
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {profile.externalLinks.map((link: ExternalLink) => (
                <a
                  key={link.id}
                  href={link.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Form Section - MODIFIED */}
      <section
        id="contact-section"
        className="py-16 md:py-24 bg-white dark:bg-gray-900"
      >
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
            Get In Touch
          </h2>
          <ContactForm trainerEmail={trainerEmail} trainerName={trainerName} />
        </div>
      </section>
    </PublicLayout>
  );
}
