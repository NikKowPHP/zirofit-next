import { Skeleton } from "@/components/ui/Skeleton";

export default function SkeletonActivityFeed() {
  return (
    <div
      className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800"
      data-testid="skeleton-activity-feed"
    >
      <Skeleton className="h-6 w-1/3 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}
