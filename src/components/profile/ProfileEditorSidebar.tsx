
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
  CalendarDaysIcon,
  UserCircleIcon,
  ShareIcon
} from "@heroicons/react/24/outline";
import React from "react";
import { useTranslations } from "next-intl";

interface ProfileEditorSidebarProps {
  currentSection: string;
  onSelectSection: (section: string) => void;
}

export default function ProfileEditorSidebar({
  currentSection,
  onSelectSection,
}: ProfileEditorSidebarProps) {
  const t = useTranslations("ProfileEditor");

  const sections = [
    { id: "core-info", name: t("coreInfo"), icon: UserCircleIcon },
    { id: "branding", name: t("branding"), icon: SwatchIcon },
    { id: "about-details", name: t("aboutDetails"), icon: DocumentTextIcon },
    { id: "services", name: t("services"), icon: BriefcaseIcon },
    { id: "benefits", name: t("benefits"), icon: GiftIcon },
    { id: "availability", name: t("availability"), icon: CalendarDaysIcon },
    { id: "photos", name: t("photos"), icon: PhotoIcon },
    {
      id: "testimonials",
      name: t("testimonials"),
      icon: ChatBubbleLeftEllipsisIcon,
    },
    { id: "social-links", name: t("socialLinks"), icon: ShareIcon },
    { id: "links", name: t("externalLinks"), icon: LinkIcon },
  ];

  return (
    <aside className="w-full md:w-1/4 lg:w-1/5">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 px-2">
        {t("sidebarTitle")}
      </h3>
      <nav className="space-y-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSelectSection(section.id)}
            type="button"
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors duration-150 ease-in-out ${
              currentSection === section.id
                ? "bg-neutral-200/60 dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400 font-semibold"
                : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
            }`}
          >
            <section.icon
              className={`h-5 w-5 flex-shrink-0 ${
                currentSection === section.id
                  ? "text-indigo-500"
                  : "text-neutral-500"
              }`}
            />
            {section.name}
          </button>
        ))}
      </nav>
    </aside>
  );
}