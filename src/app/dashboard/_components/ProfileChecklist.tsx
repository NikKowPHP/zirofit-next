import React from 'react';
import Link from 'next/link';

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
  const hasTransformationPhotos = (profile.transformationPhotos ?? []).length > 0;

  const completionPercentage = (
    (hasProfilePhoto ? 20 : 0) +
    (hasBannerImage ? 10 : 0) +
    (hasAboutMe ? 15 : 0) +
    (hasServices ? 15 : 0) +
    (hasTestimonials ? 15 : 0) +
    (hasBenefits ? 15 : 0) +
    (hasTransformationPhotos ? 10 : 0)
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Profile Completion</h2>
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-500 h-4 rounded-full"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <span>{completionPercentage}% complete</span>
      </div>
      <ul className="space-y-2">
        <li>
          <Link href="/profile/edit/about" className="text-blue-500 hover:underline">
            About Me
          </Link>
        </li>
        <li>
          <Link href="/profile/edit/services" className="text-blue-500 hover:underline">
            Services
          </Link>
        </li>
        <li>
          <Link href="/profile/edit/testimonials" className="text-blue-500 hover:underline">
            Testimonials
          </Link>
        </li>
        <li>
          <Link href="/profile/edit/photos" className="text-blue-500 hover:underline">
            Transformation Photos
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default ProfileChecklist;