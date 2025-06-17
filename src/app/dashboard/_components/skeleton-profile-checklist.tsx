import { Skeleton } from '@/components/ui/Skeleton'

export default function SkeletonProfileChecklist() {
  return (
    <div
      className="space-y-4 p-4 border rounded-lg bg-background"
      data-testid="skeleton-profile-checklist"
    >
      <Skeleton className="h-6 w-1/4 mb-4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <div className="pt-4">
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}