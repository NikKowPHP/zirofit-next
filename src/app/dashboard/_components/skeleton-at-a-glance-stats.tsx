import { Skeleton } from "@/components/ui/Skeleton";

export default function SkeletonAtAGlanceStats() {
  return (
    <div className="space-y-4" data-testid="skeleton-at-a-glance">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-8 w-1/3" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  );
}
