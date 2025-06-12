// src/app/dashboard/page.tsx
// Server component with grid layout for dashboard
import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardData } from "../../lib/dashboard";
import AtAGlanceStats from "./_components/AtAGlanceStats";
import ProfileChecklist from "./_components/ProfileChecklist";
import QuickActions from "./_components/QuickActions";
import ActivityFeed from "./_components/ActivityFeed";
import ClientSpotlight from "./_components/ClientSpotlight";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Middleware should handle this, but as a fallback:
    return redirect('/auth/login');
  }

  const data = await getDashboardData(user.id);
  const { activeClients, sessionsThisMonth, pendingClients, profile, activityFeed, spotlightClient } = data;

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
  );
}