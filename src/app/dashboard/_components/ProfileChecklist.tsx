import React from "react";
import Link from "next/link";

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
  // Calculate completion percentage based on profile fields
  const hasProfilePhoto = !!profile.profilePhotoPath;
  const hasBannerImage = !!profile.bannerImagePath;
  const hasAboutMe = !!profile.aboutMe?.trim();
  const hasServices = (profile.services ?? []).length > 0;
  const hasTestimonials = (profile.testimonials ?? []).length > 0;
  const hasBenefits = (profile.benefits ?? []).length > 1;
  const hasTransformationPhotos =
    (profile.transformationPhotos ?? []).length > 0;

  const completionPercentage =
    (hasProfilePhoto ? 20 : 0) +
    (hasBannerImage ? 10 : 0) +
    (hasAboutMe ? 15 : 0) +
    (hasServices ? 15 : 0) +
    (hasTestimonials ? 15 : 0) +
    (hasBenefits ? 15 : 0) +
    (hasTransformationPhotos ? 10 : 0);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Profile Completion
      </h2>
      <div className="mb-4">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
          <div
            className="bg-blue-500 h-4 rounded-full"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <span className="text-gray-600 dark:text-gray-400">
          {completionPercentage}% complete
        </span>
      </div>
      <ul className="space-y-2">
        <li>
          <Link
            href="/profile/edit/about"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            About Me
          </Link>
        </li>
        <li>
          <Link
            href="/profile/edit/services"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Services
          </Link>
        </li>
        <li>
          <Link
            href="/profile/edit/testimonials"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Testimonials
          </Link>
        </li>
        <li>
          <Link
            href="/profile/edit/photos"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Transformation Photos
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default ProfileChecklist;
