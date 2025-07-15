
import TrainerDashboardLayout from "../../../components/layouts/TrainerDashboardLayout";
import { createClient } from "../../../lib/supabase/server";

export default async function ClientsSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <TrainerDashboardLayout
      userEmail={user?.email}
      headerTitle="Manage Clients"
    >
      {children}
    </TrainerDashboardLayout>
  );
}