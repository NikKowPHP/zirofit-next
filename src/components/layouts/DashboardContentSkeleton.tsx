import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardContentSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-start">
        <div>
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
      <Card>
        <CardHeader>
          <div className="flex gap-4 p-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg">
            <Skeleton className="h-8 flex-1 rounded-md" />
            <Skeleton className="h-8 flex-1 rounded-md bg-white dark:bg-neutral-700" />
            <Skeleton className="h-8 flex-1 rounded-md" />
            <Skeleton className="h-8 flex-1 rounded-md" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}