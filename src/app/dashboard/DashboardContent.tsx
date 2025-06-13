'use client'

import useSWR from 'swr'
import AtAGlanceStats from './_components/AtAGlanceStats'
import ProfileChecklist from './_components/ProfileChecklist'
import QuickActions from './_components/QuickActions'
import ActivityFeed from './_components/ActivityFeed'
import ClientSpotlight from './_components/ClientSpotlight'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function DashboardContent() {
  const { data, error, isLoading } = useSWR('/api/dashboard', fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true
  })

  if (error) return <div>Failed to load dashboard data</div>
  if (isLoading) return <div>Loading...</div>

  const {
    activeClients,
    sessionsThisMonth,
    pendingClients,
    profile,
    activityFeed,
    spotlightClient
  } = data

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <AtAGlanceStats
        activeClients={activeClients}
        sessionsThisMonth={sessionsThisMonth}
        pendingClients={pendingClients}
      />
      <ProfileChecklist profile={profile} />
      <QuickActions />
      <ActivityFeed activityFeed={activityFeed} />
      <ClientSpotlight
        clientName={spotlightClient?.name}
        measurements={spotlightClient?.measurements}
      />
    </div>
  )
}