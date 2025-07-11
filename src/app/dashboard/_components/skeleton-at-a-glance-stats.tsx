import { Skeleton } from "@/components/ui/Skeleton";

export default function SkeletonAtAGlanceStats() {
  return (
    <div
      className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800"
      data-testid="skeleton-at-a-glance"
    >
      <Skeleton className="h-6 w-1/3 mb-4" />
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-8 w-1/4" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-8 w-1/4" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-8 w-1/4" />
        </div>
      </div>
    </div>
  );
}
