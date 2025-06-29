// src/app/trainers/page.tsx
import PublicLayout from "@/components/layouts/PublicLayout";
import { getPublishedTrainers } from "@/lib/api/trainers";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find a Personal Trainer",
  description:
    "Browse our directory of certified and experienced personal trainers. Find the right fitness coach near you or online to help you achieve your health and fitness goals.",
  alternates: {
    canonical: "/trainers",
  },
};

interface Trainer {
  id: string;
  name: string;
  username: string | null;
  profile: {
    location: string | null;
    profilePhotoPath: string | null;
  } | null;
}

const DEFAULT_PROFILE_IMAGE = "/next.svg";

export default async function TrainersPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const data = await getPublishedTrainers(currentPage);

  if (data.error) {
    return (
      <PublicLayout>
        <div className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold mb-6 text-center">
              Find a Trainer
            </h1>
            <p className="text-red-500 text-center">{data.error}</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const { trainers, totalPages } = data;

  return (
    <PublicLayout>
      <div className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
            Meet Our Trainers
          </h1>

          {trainers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ">
                {trainers.map((trainer: Trainer) => (
                  <div
                    key={trainer.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
                  >
                    <div className="flex-shrink-0 mb-4 text-center">
                      <Image
                        src={
                          trainer.profile?.profilePhotoPath ||
                          DEFAULT_PROFILE_IMAGE
                        }
                        alt={`${trainer.name}'s profile photo`}
                        width={128}
                        height={128}
                        className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-indigo-100"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1 text-center">
                      {trainer.name}
                    </h3>
                    {trainer.profile?.location && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="inline-block h-4 w-4 mr-1 text-gray-400"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001zm.612-1.426a.75.75 0 01-.001-1.061C10.294 16.126 10 15.837 10 15.5c0-.338.293-.626.31-.647a.75.75 0 111.04 1.083C11.293 16.063 11 16.427 11 16.75c0 .322.293.626.309.647a.75.75 0 01-1.04 1.083zM10 2a.75.75 0 01.75.75v.008c0 .005 0 .01 0 .016l.002.005a.75.75 0 01-1.502-.026l-.002-.005A.75.75 0 0110 2z"
                            clipRule="evenodd"
                          />
                          <path
                            fillRule="evenodd"
                            d="M10 1a9 9 0 100 18 9 9 0 000-18zM2.407 9.51a.75.75 0 010 1.058 7.5 7.5 0 0010.246 8.332.75.75 0 11.01-1.06 5.996 5.996 0 01-8.18-6.696.75.75 0 01-1.018-.028A7.46 7.46 0 002.5 10c0-.026.002-.052.005-.078a.75.75 0 01-.098-.412z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {trainer.profile.location}
                      </p>
                    )}
                    <div className="mt-auto text-center">
                      <Link
                        href={`/trainer/${trainer.username}`}
                        className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg text-sm font-semibold transition-colors shadow hover:shadow-md"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              {/* Basic Pagination (Example) */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center space-x-2">
                  {currentPage > 1 && (
                    <Link
                      href={`/trainers?page=${currentPage - 1}`} //
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Previous
                    </Link>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Link
                        key={page}
                        href={`/trainers?page=${page}`}
                        className={`px-4 py-2 border rounded-md text-sm font-medium ${
                          page === currentPage //
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {page}
                      </Link>
                    ),
                  )}
                  {currentPage < totalPages && (
                    <Link
                      href={`/trainers?page=${currentPage + 1}`}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Next
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center italic">
              No trainers found at the moment. Check back soon!
            </p>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
