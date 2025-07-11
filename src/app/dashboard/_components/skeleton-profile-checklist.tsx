import { Skeleton } from "@/components/ui/Skeleton";

export default function SkeletonProfileChecklist() {
  return (
    <div
      className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800"
      data-testid="skeleton-profile-checklist"
    >
      <Skeleton className="h-6 w-1/3 mb-4" />
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <Skeleton className="h-4 w-1/4" />
        </div>
        <Skeleton className="h-2.5 w-full rounded-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
      </div>
    </div>
  );
}
