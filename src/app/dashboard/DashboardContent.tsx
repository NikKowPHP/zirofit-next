"use client";

import useSWR from "swr";
import AtAGlanceStats from "./_components/AtAGlanceStats";
import ProfileChecklist from "./_components/ProfileChecklist";
import QuickActions from "./_components/QuickActions";
import ActivityFeed from "./_components/ActivityFeed";
import ClientProgressChart from "./_components/ClientProgressChart";
import MonthlyActivityChart from "./_components/MonthlyActivityChart";
import SkeletonAtAGlanceStats from "./_components/skeleton-at-a-glance-stats";
import SkeletonProfileChecklist from "./_components/skeleton-profile-checklist";
import SkeletonQuickActions from "./_components/skeleton-quick-actions";
import SkeletonActivityFeed from "./_components/skeleton-activity-feed";
import { Card, CardContent, CardHeader, Skeleton } from "@/components/ui";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardContent() {
  const { data, error, isLoading } = useSWR("/api/dashboard", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });

  if (error)
    return (
      <div className="text-red-500 p-4 bg-red-100 dark:bg-red-900/20 rounded-md">
        Failed to load dashboard data
      </div>
    );
  if (isLoading || !data)
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonAtAGlanceStats />
          <SkeletonProfileChecklist />
          <SkeletonQuickActions />
        </div>
        <div className="lg:col-span-3">
          <SkeletonActivityFeed />
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );

  const {
    activeClients,
    sessionsThisMonth,
    pendingClients,
    profile,
    activityFeed = [],
    clientProgressData = [],
    monthlyActivityData = [],
  } = data;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
        <AtAGlanceStats
          activeClients={activeClients}
          sessionsThisMonth={sessionsThisMonth}
          pendingClients={pendingClients}
        />
        {profile ? (
          <ProfileChecklist profile={profile} />
        ) : (
          <SkeletonProfileChecklist />
        )}
        <QuickActions />
      </div>

      <div className="lg:col-span-3">
        <ActivityFeed activityFeed={activityFeed} />
      </div>

      {/* Chart Section */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
        {clientProgressData.length > 0 ? (
          <ClientProgressChart
            data={clientProgressData}
            title="Client Progress (Weight)"
          />
        ) : (
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 text-center text-gray-500">
            No client progress data to display. Add some measurements to a
            client to see the chart.
          </div>
        )}
        {monthlyActivityData.length > 0 ? (
          <MonthlyActivityChart
            data={monthlyActivityData}
            title="Monthly Activity"
          />
        ) : (
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 text-center text-gray-500">
            No monthly activity data available.
          </div>
        )}
      </div>
    </div>
  );
}