// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import { HttpsProxyAgent } from 'https-proxy-agent';

export function createClient() {
  // Create proxy agent if configured
  // Proxy agent is only used on the server side
  // In the browser, we'll just use regular fetch
  const _agent: HttpsProxyAgent<string> | undefined = undefined;
  if (process.env.NEXT_PUBLIC_HTTP_PROXY) {
    // This agent is never used in the browser
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const agent = new HttpsProxyAgent(process.env.NEXT_PUBLIC_HTTP_PROXY);
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: (input, init) => {
          return fetch(input, init);
        },
      },
    }
  );
}