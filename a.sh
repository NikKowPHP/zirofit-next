#!/bin/bash

# 1.1. Refactor TrainerSearch.tsx with frosted glass effect, new inputs, and tabs.
cat <<'EOF' > 'src/components/home/TrainerSearch.tsx'
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BuildingStorefrontIcon, VideoCameraIcon } from "@heroicons/react/24/outline";

export default function TrainerSearch() {
  const [activeTab, setActiveTab] = useState<"in-person" | "online">("in-person");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();
    if (query) searchParams.set("q", query);
    if (activeTab === "in-person" && location) {
      searchParams.set("location", location);
    }
    searchParams.set("type", activeTab);
    router.push(`/trainers?${searchParams.toString()}`);
  };

  const TabButton = ({ label, tabId, icon: Icon }: { label: string; tabId: "in-person" | "online"; icon: React.ElementType; }) => (
    <button
      type="button"
      onClick={() => setActiveTab(tabId)}
      className={`flex items-center px-6 py-3 text-lg font-medium rounded-t-lg transition-colors ${
        activeTab === tabId
          ? "bg-white/20 dark:bg-black/20 backdrop-blur-lg text-white"
          : "bg-transparent text-white/60 hover:bg-white/10"
      }`}
    >
      <Icon className="w-6 h-6 mr-2" />
      {label}
    </button>
  );

  return (
    <div className="w-full max-w-4xl mx-auto text-white">
      <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-4 tracking-tight">Find a Trainer, Book a Session</h1>
      <h2 className="text-xl md:text-2xl text-center text-white/90 mb-10">
        Search from thousands of certified trainers to achieve your fitness goals.
      </h2>
      <div className="flex">
        <TabButton label="In-Person" tabId="in-person" icon={BuildingStorefrontIcon} />
        <TabButton label="Online" tabId="online" icon={VideoCameraIcon} />
      </div>
      <div className="bg-white/20 dark:bg-black/20 p-6 sm:p-8 rounded-b-lg rounded-tr-lg shadow-2xl backdrop-blur-lg">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className={activeTab === "in-person" ? "md:col-span-1" : "md:col-span-2"}>
            <label htmlFor="search-query" className="block text-sm font-medium text-white/80 mb-1">
              Specialty or Trainer Name
            </label>
            <Input id="search-query" type="text" placeholder="e.g., 'Yoga', 'Strength Training'" value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} className="bg-white/20 dark:bg-black/20 text-white placeholder-white/70" />
          </div>
          {activeTab === "in-person" && (
            <div className="md:col-span-1">
              <label htmlFor="search-location" className="block text-sm font-medium text-white/80 mb-1">
                Location
              </label>
              <Input id="search-location" type="text" placeholder="City or ZIP code" value={location} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)} className="bg-white/20 dark:bg-black/20 text-white placeholder-white/70" />
            </div>
          )}
          <div className="md:col-span-1">
            <Button type="submit" className="w-full" size="lg">Search</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
EOF

# 1.2. Refactor homepage content and "For Trainers" section
cat <<'EOF' > 'src/app/page.tsx'
import PublicLayout from "../components/layouts/PublicLayout";
import TrainerSearch from "@/components/home/TrainerSearch";
import type { Metadata } from "next";
        
export const metadata: Metadata = {
  title: "Find Your Perfect Personal Trainer | ZIRO.FIT",
  description: "Search and book certified personal trainers for online or in-person sessions. Achieve your fitness goals with the right expert from ZIRO.FIT.",
  alternates: {
    canonical: "/",
  },
};
        
export default function Home() {
  return (
    <PublicLayout>
      <div className="relative flex items-center justify-center min-h-[calc(100vh-128px)] p-4 sm:p-8">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-background.jpg')" }} // NOTE: Add a suitable hero image to the /public directory
        >
          <div className="absolute inset-0 bg-black/60"></div> {/* Overlay */}
        </div>
        
        <div className="relative z-10 w-full">
          <TrainerSearch />
        </div>
      </div>
        
      <section className="py-24 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">For Trainers</h2>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Attract more clients, showcase your results, and grow your fitness business with our all-in-one toolkit.
          </p>
          <div className="mt-10">
            <a
              href="/auth/register"
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-8 rounded-md text-base font-semibold transition-colors shadow-lg"
            >
              Create Your Free Profile
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
EOF

# 2.1. Refactor trainers/page.tsx with two-column layout and cleaner pagination
cat <<'EOF' > 'src/app/trainers/page.tsx'
// src/app/trainers/page.tsx
import PublicLayout from "@/components/layouts/PublicLayout";
import { getPublishedTrainers } from "@/lib/api/trainers";
import Link from "next/link";
import TrainerResultCard from "@/components/trainers/TrainerResultCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find a Personal Trainer",
  description:
    "Browse our directory of certified and experienced personal trainers. Find the right fitness coach near you or online to help you achieve your health and fitness goals.",
  alternates: {
    canonical: "/trainers",
  },
};

interface Trainer {
  id: string;
  name: string;
  username: string | null;
  profile: {
    location: string | null;
    certifications: string | null;
    profilePhotoPath: string | null;
  } | null;
}


export default async function TrainersPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const data = await getPublishedTrainers(currentPage);

  if (data.error) {
    return (
      <PublicLayout>
        <div className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold mb-6 text-center">
              Find a Trainer
            </h1>
            <p className="text-red-500 text-center">{data.error}</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const { trainers, totalPages } = data;

  return (
    <PublicLayout>
      <div className="py-12 bg-neutral-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
            Meet Our Trainers
          </h1>

          {trainers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {trainers.map((trainer: Trainer) => (
                    <TrainerResultCard key={trainer.id} trainer={trainer} />
                  ))}
                </div>
                <div className="lg:col-span-1">
                  <div className="sticky top-24 h-96 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl flex items-center justify-center border border-neutral-200 dark:border-neutral-700">
                    <p className="text-neutral-500">Map View Coming Soon</p>
                  </div>
                </div>
              </div>

              {/* Basic Pagination (Example) */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center space-x-2">
                  {currentPage > 1 && (
                    <Link
                      href={`/trainers?page=${currentPage - 1}`}
                      className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                    >
                      Previous
                    </Link>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Link
                        key={page}
                        href={`/trainers?page=${page}`}
                        className={`px-4 py-2 border rounded-md text-sm font-medium ${
                          page === currentPage
                            ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black border-neutral-800 dark:border-neutral-200"
                            : "bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                        }`}
                      >
                        {page}
                      </Link>
                    ),
                  )}
                  {currentPage < totalPages && (
                    <Link
                      href={`/trainers?page=${currentPage + 1}`}
                      className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                    >
                      Next
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center italic">
              No trainers found at the moment. Check back soon!
            </p>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
EOF

# 2.2. Redesign TrainerResultCard.tsx
cat <<'EOF' > 'src/components/trainers/TrainerResultCard.tsx'
import Link from 'next/link';
import Image from 'next/image';

interface TrainerCardProps {
  trainer: {
    id: string;
    name: string;
    username: string | null;
    profile: {
      location: string | null;
      certifications: string | null;
      profilePhotoPath: string | null;
    } | null;
  };
}

export default function TrainerResultCard({ trainer }: TrainerCardProps) {
  if (!trainer.profile) return null;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col md:flex-row items-center gap-6">
      <div className="flex-shrink-0">
        <Image
          src={trainer.profile.profilePhotoPath || '/default-profile.jpg'}
          alt={trainer.name}
          width={100}
          height={100}
          className="rounded-full object-cover w-24 h-24"
        />
      </div>
      <div className="flex-grow text-center md:text-left">
        <Link href={`/trainer/${trainer.username}`}>
          <h2 className="text-xl font-bold text-indigo-600 hover:underline">{trainer.name}</h2>
        </Link>
        <p className="font-semibold text-neutral-700 dark:text-neutral-300">{trainer.profile.certifications}</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{trainer.profile.location}</p>
      </div>
      <div className="flex-shrink-0 md:ml-auto">
         <Link href={`/trainer/${trainer.username}`} className="inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 focus:ring-indigo-500 px-4 py-2 text-sm w-full md:w-auto">
            View Profile
         </Link>
      </div>
    </div>
  );
}
EOF

# 2.3. Overhaul public trainer profile page
cat <<'EOF' > 'src/app/trainer/[username]/page.tsx'
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
import { getTrainerSchedule } from "@/app/profile/actions";

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
    // In a real app, ensure this HTML is sanitized if it comes from user input.
    // For Prisma data that was purified on input, this is okay.
    return <div dangerouslySetInnerHTML={{ __html: htmlString }} />;
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
          className="absolute inset-0 opacity-30"
          defaultSrc={DEFAULT_BANNER_IMAGE}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-40 text-center">
          <div className="mb-8">
            <ProfileImage
              src={profile.profilePhotoPath || DEFAULT_PROFILE_IMAGE}
              alt={`${name}'s profile photo`}
              width={180}
              height={180}
              className="w-44 h-44 rounded-full object-cover mx-auto border-4 border-white/10 shadow-lg"
              defaultSrc={DEFAULT_PROFILE_IMAGE}
            />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3">
            {name}
          </h1>
          {profile.certifications && (
            <p className="text-lg sm:text-xl text-gray-200 mb-6 max-w-2xl mx-auto">
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

      <div className="bg-neutral-50 dark:bg-black">
        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column (Main content) */}
          <div className="lg:col-span-2 space-y-12">
            {/* About, Philosophy, Methodology Section */}
            {(profile.aboutMe || profile.philosophy || profile.methodology) && (
              <section
                id="about-section"
                className="p-8 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
              >
                <div className="prose lg:prose-xl dark:prose-invert max-w-none">
                  {profile.aboutMe && (
                    <>
                      <h2 className="text-3xl font-semibold mt-8 mb-3">
                        About Me
                      </h2>
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
                className="p-8 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
              >
                <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
                  Why Train With Me?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {profile.benefits.map((benefit: Benefit) => (
                    <div
                      key={benefit.id}
                      className="bg-neutral-100 dark:bg-neutral-800/50 p-6 rounded-lg text-center"
                    >
                      {/* Add icon rendering here if you have an icon component */}
                      <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                        {benefit.title}
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                        {benefit.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Services Section */}
            {profile.services && profile.services.length > 0 && (
              <section
                id="services-section"
                className="p-8 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
              >
                <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
                  Services Offered
                </h2>
                <div className="space-y-8">
                  {profile.services.map((service: Service) => (
                    <div
                      key={service.id}
                      className="bg-neutral-100 dark:bg-neutral-800/50 p-6 rounded-lg"
                    >
                      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
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
              </section>
            )}

            {/* Transformation Photos Section */}
            {profile.transformationPhotos &&
              profile.transformationPhotos.length > 0 && (
                <section
                  id="transformations-section"
                  className="p-8 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
                >
                  <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
                    Client Transformations
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {profile.transformationPhotos.map(
                      (photo: TransformationPhoto) => (
                        <div
                          key={photo.id}
                          className="group relative rounded-lg overflow-hidden shadow-lg"
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
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/50 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                              {photo.caption}
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </section>
              )}

            {/* Testimonials Section */}
            {profile.testimonials && profile.testimonials.length > 0 && (
              <section
                id="testimonials-section"
                className="p-8 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
              >
                <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
                  What Clients Say
                </h2>
                <div className="space-y-8">
                  {profile.testimonials.map((testimonial: Testimonial) => (
                    <blockquote
                      key={testimonial.id}
                      className="p-6 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg"
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
              </section>
            )}
          </div>

          {/* Right Column (Booking) */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Booking Calendar Section */}
              <section
                id="contact-section"
                className="p-8 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
              >
                <PublicCalendar
                  trainerId={userWithProfile.id}
                  initialSchedule={schedule}
                />
              </section>

              {/* External Links Section */}
              {profile.externalLinks && profile.externalLinks.length > 0 && (
                <section
                  id="links-section"
                  className="mt-8 p-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
                >
                  <h3 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">
                    Find Me Online
                  </h3>
                  <div className="flex flex-wrap justify-center gap-3">
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
                </section>
              )}
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
EOF

# 3.1. Refactor login page with new card style
cat <<'EOF' > 'src/app/auth/login/page.client.tsx'
// src/app/auth/login/page.tsx
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginUser } from "../actions";
import PublicLayout from "../../../components/layouts/PublicLayout"; // Import

interface FormState {
  message: string | null;
  error: string | null;
  errors?: {
    email?: string[];
    password?: string[];
  };
  success: boolean;
}

const initialState: FormState = {
  message: null,
  error: null,
  errors: undefined,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
    >
      {pending ? "Logging in..." : "Log In"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(loginUser, initialState);
  return (
    <PublicLayout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-black py-12 sm:px-6 lg:px-8">
        <div className="p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Trainer Login</h1>

          {state?.error && !state.errors && (
            <p className="text-red-500 text-sm mb-4 bg-red-100 p-2 rounded">
              {state.error}
            </p>
          )}
          {state?.message && !state.error && (
            <p className="text-green-500 text-sm mb-4 bg-green-100 p-2 rounded">
              {state.message}
            </p>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
              />
              {state?.errors?.email &&
                state.errors.email.map((err: string) => (
                  <p key={err} className="text-red-500 text-xs mt-1">
                    {err}
                  </p>
                ))}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
              />
              {state?.errors?.password &&
                state.errors.password.map((err: string) => (
                  <p key={err} className="text-red-500 text-xs mt-1">
                    {err}
                  </p>
                ))}
            </div>
            <SubmitButton />
          </form>
          <p className="mt-4 text-center text-sm">
            Need an account?{" "}
            <a
              href="/auth/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Register
            </a>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
EOF

# 3.1. Refactor register page with new card style
cat <<'EOF' > 'src/app/auth/register/page.client.tsx'
// src/app/auth/register/page.tsx
"use client";

import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { registerUser } from "../actions";
import PublicLayout from "../../../components/layouts/PublicLayout";

interface FormState {
  message: string | null;
  error: string | null;
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  success: boolean;
}

const initialState: FormState = {
  message: null,
  error: null,
  errors: undefined,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
    >
      {pending ? "Registering..." : "Register"}
    </button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerUser, initialState);

  // useEffect(() => { // For client-side redirect or message handling if not using server redirect
  //   if (state?.success && state.message) {
  //     // router.push('/auth/login?message=' + encodeURIComponent(state.message));
  //     alert(state.message); // Or show a toast
  //   }
  // }, [state, router]);

  return (
    <PublicLayout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-black py-12 sm:px-6 lg:px-8">
        <div className="p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">
            Register as Trainer
          </h1>

          {state?.error && !state.errors && (
            <p className="text-red-500 text-sm mb-4 bg-red-100 p-2 rounded">
              {state.error}
            </p>
          )}
          {state?.message && !state.error && (
            <p className="text-green-500 text-sm mb-4 bg-green-100 p-2 rounded">
              {state.message}
            </p>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
              />
              {state?.errors?.name &&
                state.errors.name.map((err: string) => (
                  <p key={err} className="text-red-500 text-xs mt-1">
                    {err}
                  </p>
                ))}
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
              />
              {state?.errors?.email &&
                state.errors.email.map((err: string) => (
                  <p key={err} className="text-red-500 text-xs mt-1">
                    {err}
                  </p>
                ))}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
              />
              {state?.errors?.password &&
                state.errors.password.map((err) => (
                  <p key={err} className="text-red-500 text-xs mt-1">
                    {err}
                  </p>
                ))}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword" // Supabase handles confirmation, or you can check in action
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
              />
              {/* Client-side check if password mismatch, or handle in action */}
            </div>
            <SubmitButton />
          </form>
          <p className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Log in
            </a>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
EOF