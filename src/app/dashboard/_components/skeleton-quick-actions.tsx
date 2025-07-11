import { Skeleton } from "@/components/ui/Skeleton";

export default function SkeletonQuickActions() {
  return (
    <div
      className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800"
      data-testid="skeleton-quick-actions"
    >
      <Skeleton className="h-6 w-1/3 mb-4" />
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
