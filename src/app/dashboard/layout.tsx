// src/app/dashboard/layout.tsx
import TrainerDashboardLayout from '../../components/layouts/TrainerDashboardLayout';
import { createClient } from '../../lib/supabase/server'; // For fetching user session

export default async function DashboardSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <TrainerDashboardLayout userEmail={user?.email} headerTitle="Dashboard">
      {children}
    </TrainerDashboardLayout>
  );
}