import { Skeleton } from '@/components/ui/Skeleton'

export default function SkeletonActivityFeed() {
  return (
    <div className="space-y-4" data-testid="skeleton-activity-feed">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  )
}