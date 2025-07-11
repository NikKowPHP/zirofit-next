import React from "react";
import Link from "next/link";
import {
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

type ProfileChecklistProps = {
  profile: {
    profilePhotoPath?: string;
    bannerImagePath?: string;
    aboutMe?: string;
    services?: { id: string }[];
    testimonials?: { id: string }[];
    benefits?: { id: string }[];
    transformationPhotos?: { id: string }[];
  };
};

const ProfileChecklist: React.FC<ProfileChecklistProps> = ({ profile }) => {
  const checklistItems = [
    {
      label: "Add a Profile Photo",
      completed: !!profile.profilePhotoPath,
      link: "/profile/edit?section=branding",
      points: 20,
    },
    {
      label: "Set a Banner Image",
      completed: !!profile.bannerImagePath,
      link: "/profile/edit?section=branding",
      points: 10,
    },
    {
      label: "Write About Yourself",
      completed: !!profile.aboutMe?.trim(),
      link: "/profile/edit?section=about-details",
      points: 15,
    },
    {
      label: "Define Your Services",
      completed: (profile.services ?? []).length > 0,
      link: "/profile/edit?section=services",
      points: 15,
    },
    {
      label: "Add Client Testimonials",
      completed: (profile.testimonials ?? []).length > 0,
      link: "/profile/edit?section=testimonials",
      points: 15,
    },
    {
      label: "List Your Benefits",
      completed: (profile.benefits ?? []).length > 1,
      link: "/profile/edit?section=benefits",
      points: 15,
    },
    {
      label: "Show Transformations",
      completed: (profile.transformationPhotos ?? []).length > 0,
      link: "/profile/edit?section=photos",
      points: 10,
    },
  ];

  const completionPercentage = checklistItems.reduce(
    (total, item) => total + (item.completed ? item.points : 0),
    0,
  );

  return (
    <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Profile Completion
      </h2>
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {completionPercentage}% complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>
      <ul className="space-y-2">
        {checklistItems.slice(0, 4).map((item, index) => (
          <li key={index}>
            <Link
              href={item.link}
              className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {item.completed ? (
                <CheckCircleIcon className="w-5 h-5 mr-2 text-green-500" />
              ) : (
                <XCircleIcon className="w-5 h-5 mr-2 text-red-500" />
              )}
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfileChecklist;
