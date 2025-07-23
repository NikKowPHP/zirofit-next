import PublicLayout from "@/components/layouts/PublicLayout";
import { getPublishedTrainers } from "@/lib/api/trainers";
import type { Metadata } from "next";
import SortControl from "@/components/trainers/SortControl";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { getTranslations } from "next-intl/server";
import TrainersView from "@/components/trainers/TrainersView";

interface PageProps {
  params: Promise<{
  
    locale: string;
  }>;
}
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'TrainersPage'});
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: "/trainers",
    },
  };
}

function TrainerCardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 min-h-[148px]">
      <Skeleton className="w-24 h-24 rounded-full flex-shrink-0" />
      <div className="flex-grow space-y-2 text-center sm:text-left">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-24 mt-2" />
      </div>
      <Skeleton className="h-10 w-28 flex-shrink-0 sm:ml-auto rounded-full" />
    </div>
  );
}

function TrainersListSkeleton() {
  return (
    <div className="lg:col-span-3">
      <div className="space-y-6">
        <TrainerCardSkeleton />
        <TrainerCardSkeleton />
        <TrainerCardSkeleton />
      </div>
    </div>
  );
}

async function TrainerList({
  page,
  query,
  location,
  sortBy,
}: {
  page: number;
  query?: string;
  location?: string;
  sortBy?: string;
}) {
  const t = await getTranslations('TrainersPage');
  const { trainers, totalPages, error } = await getPublishedTrainers(
    page,
    15,
    query,
    location,
    sortBy,
  );

  if (error) {
    return (
      <div className="lg:col-span-3">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  if (trainers.length === 0) {
    return (
      <div className="lg:col-span-3">
        <EmptyState
          icon={<MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />}
          title={t('emptyStateTitle')}
          description={t('emptyStateDescription')}
        />
      </div>
    );
  }

  return (
    <TrainersView
      trainers={trainers}
      totalPages={totalPages}
      currentPage={page}
    />
  );
}

export default async function TrainersPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; q?: string; location?: string; sortBy?: string }>;
}) {
  const t = await getTranslations('TrainersPage');
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const query = resolvedSearchParams?.q;
  const location = resolvedSearchParams?.location;
  const sortBy = resolvedSearchParams?.sortBy;

  return (
    <PublicLayout>
      <div className="bg-neutral-50 dark:bg-black flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-4 pt-40 pb-12">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="trainers-heading">
              {t('heading')}
            </h1>
            <SortControl />
          </div>
          <Suspense key={`${currentPage}-${query}-${location}-${sortBy}`} fallback={<TrainersListSkeleton />}>
            <TrainerList
              page={currentPage}
              query={query}
              location={location}
              sortBy={sortBy}
            />
          </Suspense>
        </div>
      </div>
    </PublicLayout>
  );
}