"use client";

import React, { useState, Suspense, useEffect } from 'react';
import ProfileEditorSidebar from './ProfileEditorSidebar';

// Placeholder components for each section - will be replaced by actual editor components
const CoreInfoEditor = React.lazy(() => import('@/components/profile/sections/CoreInfoEditor'));
const BrandingEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">Branding Editor Content</div>;
const BenefitsEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">Benefits Editor Content</div>;
const AboutMeEditor = React.lazy(() => import('./sections/AboutMeEditor'));
const PhilosophyEditor = React.lazy(() => import('./sections/PhilosophyEditor'));
const MethodologyEditor = React.lazy(() => import('./sections/MethodologyEditor'));

const AboutDetailsSection = () => {
    const [initialData, setInitialData] = useState<{aboutMe: string|null, philosophy: string|null, methodology: string|null} | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.warn("AboutDetailsSection: Initial data loading needs to be implemented via server action call from a parent or this component if it becomes async.");
        setInitialData({ aboutMe: "", philosophy: "", methodology: "" });
        setLoading(false);
    }, []);

    if (loading || !initialData) return <SectionLoadingFallback />;

    return (
        <div className="space-y-6">
            <AboutMeEditor initialAboutMe={initialData.aboutMe} />
            <PhilosophyEditor initialPhilosophy={initialData.philosophy} />
            <MethodologyEditor initialMethodology={initialData.methodology} />
        </div>
    );
};
const ServicesEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">Services Editor Content</div>;
const PhotosEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">Photos Editor Content</div>;
const TestimonialsEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">Testimonials Editor Content</div>;
const LinksEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">External Links Editor Content</div>;

const sectionComponents: { [key: string]: React.ComponentType<any> } = {
  'core-info': CoreInfoEditor,
  'branding': BrandingEditor,
  'benefits': BenefitsEditor,
  'about-details': AboutDetailsSection,
  'services': ServicesEditor,
  'photos': PhotosEditor,
  'testimonials': TestimonialsEditor,
  'links': LinksEditor,
};

// Placeholder for loading state
const SectionLoadingFallback = () => <div className="p-6 bg-white shadow-sm rounded-lg">Loading section...</div>;


export default function ProfileEditorLayout() {
  const [selectedSection, setSelectedSection] = useState('core-info'); // Default section

  const handleSelectSection = (section: string) => {
    setSelectedSection(section);
  };

  const SelectedComponent = sectionComponents[selectedSection] || (() => <div className="p-6 bg-white shadow-sm rounded-lg">Select a section to edit.</div>);

  return (
    <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
      <ProfileEditorSidebar currentSection={selectedSection} onSelectSection={handleSelectSection} />
      <main className="w-full md:w-3/4 lg:w-4/5">
        {/* Global Session Status/Feedback can be added here if needed */}
        <Suspense fallback={<SectionLoadingFallback />}>
          <SelectedComponent />
        </Suspense>
      </main>
    </div>
  );
}