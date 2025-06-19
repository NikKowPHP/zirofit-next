import { Skeleton } from '@/components/ui/Skeleton'

export default function SkeletonQuickActions() {
  return (
    <div className="flex flex-col space-y-2" data-testid="skeleton-quick-actions">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}