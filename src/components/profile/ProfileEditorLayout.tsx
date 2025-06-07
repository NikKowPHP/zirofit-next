"use client";

import React, { useState, Suspense, useEffect } from 'react';
import ProfileEditorSidebar from './ProfileEditorSidebar';

// Define a type for the initial data structure
interface InitialProfileData {
  name: string;
  username: string;
  email: string; // If needed by any section
  profile: {
    id: string;
    certifications: string | null;
    location: string | null;
    phone: string | null;
    aboutMe: string | null;
    philosophy: string | null;
    methodology: string | null;
    bannerImagePath: string | null;
    profilePhotoPath: string | null;
    services: Array<{id: string, title: string, description: string, createdAt: Date}>; // Add this
    testimonials: Array<{id: string, clientName: string, testimonialText: string, createdAt: Date}>; // Add this
    externalLinks: Array<{id: string, label: string, linkUrl: string, createdAt: Date}>;
    // Add other profile fields as they get editors
  } | null; // Profile can be null if not yet created
}

interface ProfileEditorLayoutProps {
  initialData: InitialProfileData;
}

// Import section components
const CoreInfoEditor = React.lazy(() => import('./sections/CoreInfoEditor'));
const AboutMeEditor = React.lazy(() => import('./sections/AboutMeEditor'));
const PhilosophyEditor = React.lazy(() => import('./sections/PhilosophyEditor'));
const MethodologyEditor = React.lazy(() => import('./sections/MethodologyEditor'));

// ... (placeholder components for Branding, Benefits, etc. remain for now)
const BrandingEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">Branding Editor Content</div>;
const BenefitsEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">Benefits Editor Content</div>;
const ServicesEditor = React.lazy(() => import('./sections/ServicesEditor'));
const PhotosEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">Photos Editor Content</div>;
const TestimonialsEditor = React.lazy(() => import('./sections/TestimonialsEditor'));
const LinksEditor = React.lazy(() => import('./sections/ExternalLinksEditor'));

const SectionLoadingFallback = () => <div className="p-6 bg-white shadow-sm rounded-lg">Loading section...</div>;

export default function ProfileEditorLayout({ initialData }: ProfileEditorLayoutProps) {
  const [selectedSection, setSelectedSection] = useState('core-info');

  const handleSelectSection = (section: string) => {
    setSelectedSection(section);
  };
  
  // Wrapper for About/Philosophy/Methodology
  const AboutDetailsSection = () => (
    <div className="space-y-6">
      <AboutMeEditor initialAboutMe={initialData.profile?.aboutMe ?? null} />
      <PhilosophyEditor initialPhilosophy={initialData.profile?.philosophy ?? null} />
      <MethodologyEditor initialMethodology={initialData.profile?.methodology ?? null} />
    </div>
  );

  const sectionComponents: { [key: string]: React.ComponentType<any> } = {
    'core-info': () => <CoreInfoEditor initialData={{
        name: initialData.name,
        username: initialData.username,
        certifications: initialData.profile?.certifications ?? null,
        location: initialData.profile?.location ?? null,
        phone: initialData.profile?.phone ?? null,
    }} />,
    'branding': BrandingEditor,
    'benefits': BenefitsEditor,
    'about-details': AboutDetailsSection,
    'services': () => <ServicesEditor initialServices={initialData.profile?.services || []} />,
    'photos': PhotosEditor,
    'testimonials': () => <TestimonialsEditor initialTestimonials={initialData.profile?.testimonials || []} />,
    'links': () => <LinksEditor initialExternalLinks={initialData.profile?.externalLinks || []} />,
  };

  const SelectedComponent = sectionComponents[selectedSection] || (() => <div className="p-6 bg-white shadow-sm rounded-lg">Select a section to edit.</div>);

  return (
    <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
      <ProfileEditorSidebar currentSection={selectedSection} onSelectSection={handleSelectSection} />
      <main className="w-full md:w-3/4 lg:w-4/5">
        <Suspense fallback={<SectionLoadingFallback />}>
          <SelectedComponent />
        </Suspense>
      </main>
    </div>
  );
}