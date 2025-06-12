import React from 'react';
import Link from 'next/link';

const ProfileChecklist: React.FC = () => {
  // Placeholder for actual completion percentage calculation
  const completionPercentage = 60;

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