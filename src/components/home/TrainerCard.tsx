import React from 'react';
import { Trainer } from '@/lib/api/trainers';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

interface TrainerCardProps {
  trainer: Trainer;
}

export function TrainerCard({ trainer }: TrainerCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 w-full">
        <Image
          src={trainer.profile.profilePhotoPath}
          alt={`${trainer.name}'s profile`}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {trainer.name}
        </h3>
        {trainer.username && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            @{trainer.username}
          </p>
        )}
        {trainer.profile.location && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {trainer.profile.location}
          </p>
        )}
        {trainer.profile.certifications && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {trainer.profile.certifications}
          </p>
        )}
        <Button className="mt-4 w-full" variant="secondary">
          View Profile
        </Button>
      </div>
    </div>
  );
}