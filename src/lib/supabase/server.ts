import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { HttpsProxyAgent } from 'https-proxy-agent';

export async function createClient() {
  const cookieStore = await cookies();

  // Create proxy agent if configured
  let agent: HttpsProxyAgent<string> | undefined = undefined;
  if (process.env.NEXT_PUBLIC_HTTP_PROXY) {
    agent = new HttpsProxyAgent(process.env.NEXT_PUBLIC_HTTP_PROXY);
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll(cookies: Array<{ name: string; value: string }>) {
          cookies.forEach(({ name, value }) => {
            cookieStore.set(name, value);
          });
        }
      }
    }
  );
}
