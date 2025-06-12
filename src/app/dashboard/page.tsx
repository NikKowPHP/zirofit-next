// src/app/dashboard/page.tsx
// Server component with grid layout for dashboard
import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import AtAGlanceStats from "./_components/AtAGlanceStats";
import ProfileChecklist from "./_components/ProfileChecklist";
import QuickActions from "./_components/QuickActions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Middleware should handle this, but as a fallback:
    return redirect('/auth/login');
  }

  const { activeClients, sessionsThisMonth, pendingClients } = await getDashboardData(user.id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <AtAGlanceStats
        activeClients={activeClients}
        sessionsThisMonth={sessionsThisMonth}
        pendingClients={pendingClients}
      />
      <ProfileChecklist />
      <QuickActions />
    </div>
  );
}

import { prisma } from '../../../lib/prisma';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function getDashboardData(trainerId: string) {
  const activeClients = await prisma.client.count({
    where: { trainerId, status: 'active' },
  });

  const sessionsThisMonth = await prisma.clientSessionLog.count({
    where: {
      client: { trainerId },
      sessionDate: {
        gte: startOfMonth(new Date()),
        lte: endOfMonth(new Date()),
      },
    },
  });

  const pendingClients = await prisma.client.count({
    where: { trainerId, status: 'pending' },
  });

  return {
    activeClients,
    sessionsThisMonth,
    pendingClients,
  };
}