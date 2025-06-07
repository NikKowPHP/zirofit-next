import TrainerDashboardLayout from '../../components/layouts/TrainerDashboardLayout';
import { createClient } from '../../lib/supabase/server';

export default async function ProfileSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <TrainerDashboardLayout userEmail={user?.email} headerTitle="Edit Profile">
      {children}
    </TrainerDashboardLayout>
  );
}