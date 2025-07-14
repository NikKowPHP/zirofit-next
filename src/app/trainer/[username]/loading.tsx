import PublicLayout from "@/components/layouts/PublicLayout";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { MapPinIcon } from "@heroicons/react/24/outline";

export default function Loading() {
  return (
    <PublicLayout>
      {/* Hero Section Skeleton */}
      <section className="relative bg-neutral-900 text-white -mt-[82px]">
        <div className="absolute inset-0 bg-neutral-800" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-50 text-center">
          <div className="mb-6">
            <Skeleton className="w-44 h-44 rounded-full mx-auto border-4 border-white/10" />
          </div>
          <Skeleton className="h-12 w-3/4 md:w-1/2 mx-auto mb-3" />
          <Skeleton className="h-6 w-1/2 md:w-1/3 mx-auto mb-6" />
          <Skeleton className="h-12 w-48 mx-auto" />
          <p className="text-gray-300 mt-6 text-sm flex items-center justify-center">
            <MapPinIcon className="w-4 h-4 mr-1.5" />
            <Skeleton className="h-4 w-24" />
          </p>
        </div>
      </section>

      <div className="bg-neutral-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-0 py-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-8 w-1/3 mt-4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column Skeleton */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 35 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-10 rounded-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}