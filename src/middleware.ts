
// src/middleware.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

const protectedRoutes = ["/dashboard", "/profile", "/clients"];
const authRoutes = ["/auth/login", "/auth/register"];

const handleI18nRouting = createIntlMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always'
});

export async function middleware(request: NextRequest) {
  const response = handleI18nRouting(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname  = request.nextUrl.pathname;

  // Since next-intl middleware runs first, it strips the locale.
  // We need to know the original locale to construct correct redirect URLs.
  // 'x-next-intl-locale' is a header added by the middleware.
  const locale = request.headers.get('x-next-intl-locale') || 'en';
  
  // Use the pathname without locale for route matching
  const pathnameWithoutLocale = pathname.startsWith(`/${locale}`) 
    ? pathname.substring(`/${locale}`.length) || "/" 
    : pathname;

  if (!user && protectedRoutes.some((route) => pathnameWithoutLocale.startsWith(route))) {
    const url = new URL(`/${locale}/auth/login`, request.url);
    url.searchParams.set('error', 'Please log in to access this page.');
    return NextResponse.redirect(url);
  }

  if (user && authRoutes.some((route) => pathnameWithoutLocale.startsWith(route))) {
    const url = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};