// src/app/trainers/page.tsx
import PublicLayout from "@/components/layouts/PublicLayout";
import { getPublishedTrainers } from "@/lib/api/trainers";
import Link from "next/link";
import TrainerResultCard from "@/components/trainers/TrainerResultCard";
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
    certifications: string | null;
    profilePhotoPath: string | null;
  } | null;
}


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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {trainers.map((trainer: Trainer) => (
                    <TrainerResultCard key={trainer.id} trainer={trainer} />
                  ))}
                </div>
                <div className="lg:col-span-1">
                  <div className="sticky top-24 h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                    <p>Map View Placeholder</p>
                  </div>
                </div>
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
