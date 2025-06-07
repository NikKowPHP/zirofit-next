"use client";

import React, { useState, Suspense } from 'react';
import ProfileEditorSidebar from './ProfileEditorSidebar';
// Import section components dynamically later or statically for now
// For now, we'll just show a placeholder for the content area

// Placeholder components for each section - will be replaced by actual editor components
const CoreInfoEditor = React.lazy(() => import('./sections/CoreInfoEditor')); // Example, create this file later
const BrandingEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">Branding Editor Content</div>;
const BenefitsEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">Benefits Editor Content</div>;
const AboutDetailsEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">About & Details Editor Content</div>;
const ServicesEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">Services Editor Content</div>;
const PhotosEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">Photos Editor Content</div>;
const TestimonialsEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">Testimonials Editor Content</div>;
const LinksEditor = () => <div className="p-6 bg-white shadow-sm rounded-lg">External Links Editor Content</div>;

const sectionComponents: { [key: string]: React.ComponentType<any> } = {
  'core-info': CoreInfoEditor,
  'branding': BrandingEditor,
  'benefits': BenefitsEditor,
  'about-details': AboutDetailsEditor,
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