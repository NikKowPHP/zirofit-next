"use client"; // This component needs to handle client-side state for active section

import {
  Cog6ToothIcon,
  SwatchIcon,
  GiftIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  PhotoIcon,
  ChatBubbleLeftEllipsisIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import React from "react";

interface ProfileEditorSidebarProps {
  currentSection: string;
  onSelectSection: (section: string) => void;
}

const sections = [
  { id: "core-info", name: "Core Info", icon: Cog6ToothIcon },
  { id: "branding", name: "Branding", icon: SwatchIcon },
  { id: "benefits", name: "Benefits", icon: GiftIcon },
  { id: "about-details", name: "About & Details", icon: DocumentTextIcon },
  { id: "services", name: "Services", icon: BriefcaseIcon },
  { id: "photos", name: "Photos", icon: PhotoIcon },
  {
    id: "testimonials",
    name: "Testimonials",
    icon: ChatBubbleLeftEllipsisIcon,
  },
  { id: "links", name: "External Links", icon: LinkIcon },
];

export default function ProfileEditorSidebar({
  currentSection,
  onSelectSection,
}: ProfileEditorSidebarProps) {
  return (
    <aside className="w-full md:w-1/4 lg:w-1/5 bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 md:p-6 h-fit">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 px-2">
        Edit Profile Sections
      </h3>
      <nav className="space-y-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSelectSection(section.id)}
            type="button"
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-3 transition-colors duration-150 ease-in-out ${
              currentSection === section.id
                ? "bg-indigo-50 text-indigo-700 dark:bg-gray-700 dark:text-indigo-300"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
            }`}
          >
            <section.icon className="h-5 w-5 flex-shrink-0" />
            {section.name}
          </button>
        ))}
      </nav>
    </aside>
  );
}
