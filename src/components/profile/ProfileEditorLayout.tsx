"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { TransformationPhoto } from "./sections/TransformationPhotosEditor";
import type { SocialLink } from "./sections/SocialLinksEditor";
import ProfileEditorSidebar from "./ProfileEditorSidebar";

interface ExternalLink {
  id: string;
  label: string;
  linkUrl: string;
  createdAt: Date;
  profileId: string;
  updatedAt: Date;
}

interface InitialProfileData {
  name: string;
  username: string;
  email: string;
  profile?: {
    id: string;
    certifications: string | null;
    location: string | null;
    phone: string | null;
    aboutMe: string | null;
    philosophy: string | null;
    methodology: string | null;
    bannerImagePath: string | null;
    profilePhotoPath: string | null;
    services: Array<{
      id: string;
      title: string;
      description: string;
      createdAt: Date;
      profileId: string;
      updatedAt: Date;
    }>;
    testimonials: Array<{
      id: string;
      clientName: string;
      testimonialText: string;
      createdAt: Date;
      updatedAt: Date;
      profileId: string;
    }>;
    externalLinks: Array<{
      id: string;
      label: string;
      linkUrl: string;
      createdAt: Date;
    }>;
    socialLinks: Array<{
      id: string;
      platform: string;
      username: string;
      profileUrl: string;
      createdAt: Date;
      profileId: string;
      updatedAt: Date;
    }>;
    transformationPhotos: Array<{
      id: string;
      imagePath: string;
      caption: string | null;
      createdAt: Date;
    }>;
    benefits: Array<{
      id: string;
      title: string;
      description: string | null;
      iconName: string | null;
      iconStyle: string | null;
      orderColumn: number;
      createdAt: Date;
      profileId: string;
      updatedAt: Date;
    }>;
  };
}

interface ProfileEditorLayoutProps {
  initialData: InitialProfileData;
}

const CoreInfoEditor = React.lazy(() => import("./sections/CoreInfoEditor"));
const AboutMeEditor = React.lazy(() => import("./sections/AboutMeEditor"));
const PhilosophyEditor = React.lazy(
  () => import("./sections/PhilosophyEditor"),
);
const MethodologyEditor = React.lazy(
  () => import("./sections/MethodologyEditor"),
);
const BrandingEditor = React.lazy(() => import("./sections/BrandingEditor"));
const BenefitsEditor = React.lazy(() => import("./sections/BenefitsEditor"));
const ServicesEditor = React.lazy(() => import("./sections/ServicesEditor"));
const PhotosEditor = React.lazy(
  () => import("./sections/TransformationPhotosEditor"),
);
const TestimonialsEditor = React.lazy(
  () => import("./sections/TestimonialsEditor"),
);
const LinksEditor = React.lazy(() => import("./sections/ExternalLinksEditor"));
const SocialLinksEditor = React.lazy(
  () => import("./sections/SocialLinksEditor"),
);

const SectionLoadingFallback = () => (
  <div className="p-6  dark:bg-gray-800 shadow-sm rounded-lg">
    Loading section...
  </div>
);

export default function ProfileEditorLayout({
  initialData,
}: ProfileEditorLayoutProps) {
  const searchParams = useSearchParams();
  const selectedSection = searchParams.get("section") || "core-info";

  const handleSelectSection = (section: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("section", section);
    window.history.pushState(null, "", `?${newSearchParams.toString()}`);
  };

  const AboutDetailsSection = () => (
    <div className="space-y-6">
      <AboutMeEditor initialAboutMe={initialData.profile?.aboutMe ?? null} />
      <PhilosophyEditor
        initialPhilosophy={initialData.profile?.philosophy ?? null}
      />
      <MethodologyEditor
        initialMethodology={initialData.profile?.methodology ?? null}
      />
    </div>
  );

  const sectionComponents: { [key: string]: React.ComponentType<unknown> } = {
    "core-info": () => (
      <CoreInfoEditor
        initialData={{
          name: initialData.name,
          username: initialData.username,
          certifications: initialData.profile?.certifications ?? null,
          location: initialData.profile?.location ?? null,
          phone: initialData.profile?.phone ?? null,
        }}
      />
    ),
    branding: () => (
      <BrandingEditor
        initialData={
          initialData.profile || {
            bannerImagePath: null,
            profilePhotoPath: null,
          }
        }
      />
    ),
    benefits: () => (
      <BenefitsEditor initialBenefits={initialData.profile?.benefits ?? []} />
    ),
    "about-details": AboutDetailsSection,
    services: () => (
      <ServicesEditor initialServices={initialData.profile?.services || []} />
    ),
    photos: () => (
      <PhotosEditor
        initialTransformationPhotos={
          (initialData.profile
            ?.transformationPhotos as TransformationPhoto[]) || []
        }
      />
    ),
    testimonials: () => (
      <TestimonialsEditor
        initialTestimonials={initialData.profile?.testimonials || []}
      />
    ),
    links: () => (
      <LinksEditor
        initialExternalLinks={
          (initialData.profile?.externalLinks as ExternalLink[]) || []
        }
      />
    ),
    "social-links": () => (
      <SocialLinksEditor
        initialSocialLinks={
          (initialData.profile?.socialLinks as SocialLink[]) || []
        }
      />
    ),
  };

  const SelectedComponent =
    sectionComponents[selectedSection] ||
    (() => (
      <div className="p-6 bg-white shadow-sm rounded-lg">
        Select a section to edit.
      </div>
    ));

  return (
    <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
      <ProfileEditorSidebar
        currentSection={selectedSection}
        onSelectSection={handleSelectSection}
      />
      <main className="w-full md:w-3/4 lg:w-4/5">
        <Suspense fallback={<SectionLoadingFallback />}>
          <SelectedComponent />
        </Suspense>
      </main>
    </div>
  );
}
