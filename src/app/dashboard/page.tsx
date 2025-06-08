// src/app/dashboard/page.tsx
// Remove LogoutButton import from here, it's in the layout
// import LogoutButton from "'components/auth/LogoutButton"' (see below for file content);
import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Middleware should handle this, but as a fallback:
    return redirect('/auth/login');
  }

  return (
    // Content specific to dashboard page
    <div>
      <p className="text-gray-700">
        You are logged in! Your Supabase User ID is: {user.id}.
      </p>
      <p className="mt-4">This is the main content area for the dashboard.</p>
      {/* Add dashboard specific widgets/content here later */}
    </div>
  );
}