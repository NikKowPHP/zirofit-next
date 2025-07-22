"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui";
import { MapPinIcon } from "@heroicons/react/24/solid";
import { useTranslations } from "next-intl";

interface TrainerCardProps {
  trainer: {
    id: string;
    name: string;
    username: string | null;
    profile: {
      location: string | null;
      certifications: string | null;
      profilePhotoPath: string | null;
      services: {
        price: string | null;
        currency: string | null;
        duration: number | null;
      }[];
    } | null;
  };
}

export default function TrainerResultCard({ trainer }: TrainerCardProps) {
  const t = useTranslations('TrainerResultCard');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  if (!trainer.profile) return null;

  const handleClick = () => {
    setIsLoading(true);
    router.push(`/trainer/${trainer.username}`);
  };

  const firstService = trainer.profile.services?.[0];

  return (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 transition-shadow duration-300 hover:shadow-md flex flex-col sm:flex-row items-center gap-6" data-testid="trainer-card">
      <div className="flex-shrink-0">
        <Image
          src={trainer.profile.profilePhotoPath || "/default-profile.jpg"}
          alt={trainer.name}
          width={100}
          height={100}
          className="rounded-full object-cover w-24 h-24 border-2 border-white dark:border-neutral-800 shadow-sm"
        />
      </div>
      <div className="flex-grow text-center sm:text-left">
        <Link href={`/trainer/${trainer.username}`}>
          <h2 className="text-xl font-bold text-[var(--primary-blue)] hover:underline" data-testid="trainer-card-name">
            {trainer.name}
          </h2>
        </Link>
        <p className="font-semibold text-neutral-700 dark:text-neutral-300 mt-1">
          {trainer.profile.certifications}
        </p>
        {firstService && firstService.price && (
            <p className="mt-2 text-lg font-bold text-neutral-800 dark:text-neutral-200">
                {t('fromPrice', { price: firstService.price, currency: firstService.currency || 'PLN' })}
                {firstService.duration && ` / ${firstService.duration} min`}
            </p>
        )}
        {trainer.profile.location && (
          <div className="flex items-center justify-center sm:justify-start text-sm text-neutral-500 dark:text-neutral-400 mt-2">
            <MapPinIcon className="w-4 h-4 mr-1.5" />
            <span>{trainer.profile.location}</span>
          </div>
        )}
      </div>
      <div className="flex-shrink-0 sm:ml-auto">
        <Button variant="secondary" onClick={handleClick} disabled={isLoading} data-testid="view-profile-button">
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-neutral-900 dark:text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {t('loading')}
            </>
          ) : (
            t('viewProfile')
          )}
        </Button>
      </div>
    </div>
  );
}