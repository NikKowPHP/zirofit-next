
import PublicLayout from "@/components/layouts/PublicLayout";
import { getPublishedTrainers } from "@/lib/api/trainers";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import SortControl from "@/components/trainers/SortControl";
import TrainersMapWrapper from "@/components/trainers/TrainersMapWrapper";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { TrainerGrid } from "@/components/trainers/TrainerGrid";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({params: {locale}}): Promise<Metadata> {
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
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
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
    <div className="lg:col-span-2 space-y-6">
      <TrainerCardSkeleton />
      <TrainerCardSkeleton />
      <TrainerCardSkeleton />
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

  const mapKey = trainers.map((t: any) => t.id).join("-");
  const getPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (location) params.set("location", location);
    if (sortBy) params.set("sortBy", sortBy);
    if (p > 1) params.set("page", p.toString());
    return `/trainers?${params.toString()}`;
  };

  return (
    <>
      <div className="lg:col-span-2 space-y-6">
        <TrainerGrid trainers={trainers} />
      </div>
      <div className="lg:col-span-1">
        <div className="sticky top-24 h-96 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl flex items-center justify-center border border-neutral-200 dark:border-neutral-700">
          <TrainersMapWrapper key={mapKey} trainers={trainers} />
        </div>
      </div>

      {totalPages > 1 && (
        <div className="lg:col-span-3 mt-12 flex justify-center items-center space-x-2">
          {page > 1 && (
            <Button asChild variant="secondary" size="sm">
              <Link href={getPageUrl(page - 1)}>{t('previous')}</Link>
            </Button>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              asChild
              variant={p === page ? "primary" : "secondary"}
              size="sm"
            >
              <Link href={getPageUrl(p)}>{p}</Link>
            </Button>
          ))}
          {page < totalPages && (
            <Button asChild variant="secondary" size="sm">
              <Link href={getPageUrl(page + 1)}>{t('next')}</Link>
            </Button>
          )}
        </div>
      )}
    </>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
      </div>
    </PublicLayout>
  );
}