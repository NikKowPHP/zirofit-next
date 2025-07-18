
// src/app/dashboard/page.tsx
// Server component for authentication
import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardContent from "./DashboardContent";
import { getDashboardData } from "@/lib/services/dashboardService";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Middleware should handle this, but as a fallback:
    return redirect("/auth/login");
  }

  // Fetch data on the server for a faster initial load and to avoid client-side skeletons.
  // The client-side DashboardContent component will still use SWR for revalidation,
  // but it will be hydrated with this initial server-fetched data.
  let dashboardData = null;
  try {
    dashboardData = await getDashboardData(user.id);
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    // The DashboardContent component will handle the null initialData
    // and show an error state or attempt to refetch.
  }

  return <DashboardContent initialData={dashboardData} />;
}