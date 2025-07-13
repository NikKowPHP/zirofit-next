// src/app/trainers/page.tsx
import PublicLayout from "@/components/layouts/PublicLayout";
import { getPublishedTrainers } from "@/lib/api/trainers";
import Link from "next/link";
import TrainerResultCard from "@/components/trainers/TrainerResultCard";
import type { Metadata } from "next";
import { Button } from "@/components/ui";

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
  searchParams?: Promise<{ page?: string; q?: string; location?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const query = resolvedSearchParams?.q;
  const location = resolvedSearchParams?.location;

  const data = await getPublishedTrainers(currentPage, 15, query, location);

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

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (location) params.set("location", location);
    if (page > 1) params.set("page", page.toString());
    return `/trainers?${params.toString()}`;
  };

  return (
    <PublicLayout>
      <div className="bg-neutral-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-4 py-12">
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
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
                  <div className="sticky top-24 h-96 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl flex items-center justify-center border border-neutral-200 dark:border-neutral-700">
                    <p className="text-neutral-500">Map View Coming Soon</p>
                  </div>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center space-x-2">
                  {currentPage > 1 && (
                    <Button asChild variant="secondary" size="sm">
                      <Link href={getPageUrl(currentPage - 1)}>Previous</Link>
                    </Button>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        asChild
                        variant={page === currentPage ? "primary" : "secondary"}
                        size="sm"
                      >
                        <Link href={getPageUrl(page)}>{page}</Link>
                      </Button>
                    ),
                  )}
                  {currentPage < totalPages && (
                    <Button asChild variant="secondary" size="sm">
                      <Link href={getPageUrl(currentPage + 1)}>Next</Link>
                    </Button>
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