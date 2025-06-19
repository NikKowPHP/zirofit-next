'use client'

import useSWR from 'swr'
import AtAGlanceStats from './_components/AtAGlanceStats'
import ProfileChecklist from './_components/ProfileChecklist'
import QuickActions from './_components/QuickActions'
import ActivityFeed from './_components/ActivityFeed'
import ClientProgressChart from './_components/ClientProgressChart'
import MonthlyActivityChart from './_components/MonthlyActivityChart'
import SkeletonAtAGlanceStats from './_components/skeleton-at-a-glance-stats'
import SkeletonProfileChecklist from './_components/skeleton-profile-checklist'
import SkeletonQuickActions from './_components/skeleton-quick-actions'
import SkeletonActivityFeed from './_components/skeleton-activity-feed'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function DashboardContent() {
  const { data, error, isLoading } = useSWR('/api/dashboard', fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true
  })

  if (error) return <div className="text-red-500 p-4 bg-red-100 dark:bg-red-900/20 rounded-md">Failed to load dashboard data</div>
  if (isLoading || !data) return ( // Added !data check for extra safety
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <SkeletonAtAGlanceStats data-testid="skeleton-at-a-glance" />
      <SkeletonProfileChecklist data-testid="skeleton-profile-checklist" />
      <SkeletonQuickActions data-testid="skeleton-quick-actions" />
      <SkeletonActivityFeed data-testid="skeleton-activity-feed" />
    </div>
  )

  const {
    activeClients,
    sessionsThisMonth,
    pendingClients,
    profile,
    // FIX: Provide a default empty array for activityFeed to prevent runtime errors.
    activityFeed = [],
    clientProgressData = [],
    monthlyActivityData = []
  } = data

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <AtAGlanceStats
        activeClients={activeClients}
        sessionsThisMonth={sessionsThisMonth}
        pendingClients={pendingClients}
      />
      {profile ? (
        <ProfileChecklist profile={profile} />
      ) : <SkeletonProfileChecklist />}
      <QuickActions />
      <ActivityFeed activityFeed={activityFeed} />
      
      {/* Chart Section */}
      <div className="lg:col-span-2 space-y-6">
        {clientProgressData.length > 0 ? (
          <ClientProgressChart
            data={clientProgressData}
            title="Client Progress"
          />
        ) : (
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center text-gray-500">
            No client progress data to display. Add some measurements to a client to see the chart.
          </div>
        )}
        {monthlyActivityData.length > 0 ? (
          <MonthlyActivityChart
            data={monthlyActivityData}
            title="Monthly Activity"
          />
        ) : (
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center text-gray-500">
            No monthly activity data available.
          </div>
        )}
      </div>
    </div>
  )
}