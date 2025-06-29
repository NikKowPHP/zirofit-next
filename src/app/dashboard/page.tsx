// src/app/dashboard/page.tsx
// Server component for authentication
import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardContent from "./DashboardContent";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Middleware should handle this, but as a fallback:
    return redirect("/auth/login");
  }

  return <DashboardContent />;
}
