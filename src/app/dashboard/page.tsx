// src/app/dashboard/page.tsx
import LogoutButton from '../../components/auth/LogoutButton';
import { createClient } from '../../lib/supabase/server';
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/auth/login'); // Protect this page
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">Dashboard</h1>
        <p className="text-center mb-2">Welcome, {user.email}!</p>
        <p className="text-center mb-6 text-sm text-gray-600">(Supabase User ID: {user.id})</p>
        <div className="mt-6 flex justify-center">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}