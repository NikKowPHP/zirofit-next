// src/lib/supabase/server.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('sb-auth-token')?.value;

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storageKey: 'sb-auth-token',
        autoRefreshToken: true,
        detectSessionInUrl: false,
        persistSession: true,
      },
      global: {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }
    }
  );

  // Set up auth state change handling
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      cookieStore.delete('sb-auth-token');
    } else if (session?.access_token) {
      cookieStore.set({
        name: 'sb-auth-token',
        value: session.access_token,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
    }
  });

  return supabase;
}
