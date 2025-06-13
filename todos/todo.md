
 ⨯ Error: @prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.
    at eval (src/lib/prisma.ts:4:41)
    at <unknown> (rsc)/./src/lib/prisma.ts (/home/kasjer/projects/zirofit-next/.next/server/app/dashboard/page.js:309:1)
    at __webpack_require__ (.next/server/webpack-runtime.js:33:43)
    at eval (webpack-internal:///(rsc)/./src/lib/dashboard.ts:5:65)
    at <unknown> (rsc)/./src/lib/dashboard.ts (/home/kasjer/projects/zirofit-next/.next/server/app/dashboard/page.js:298:1)
    at __webpack_require__ (.next/server/webpack-runtime.js:33:43)
    at eval (webpack-internal:///(rsc)/./src/app/dashboard/page.tsx:9:72)
    at <unknown> (rsc)/./src/app/dashboard/page.tsx (/home/kasjer/projects/zirofit-next/.next/server/app/dashboard/page.js:242:1)
    at Function.__webpack_require__ (.next/server/webpack-runtime.js:33:43)
  2 |
  3 | const globalForPrisma = global as unknown as { prisma: PrismaClient };
> 4 | const prisma = globalForPrisma.prisma || new PrismaClient();
    |                                         ^
  5 |
  6 | if (process.env.NODE_ENV !== 'production') {
  7 |   globalForPrisma.prisma = prisma; {
  page: '/dashboard'
}
 GET /dashboard 500 in 601ms
 ⚠ ./node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js
Critical dependency: the request of a dependency is an expression

Import trace for requested module:
./node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js
./node_modules/@supabase/realtime-js/dist/main/index.js
./node_modules/@supabase/supabase-js/dist/module/index.js
./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
./node_modules/@supabase/ssr/dist/module/index.js
./src/lib/supabase/server.ts
./src/app/auth/actions.ts
 ⚠ ./node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js
Critical dependency: the request of a dependency is an expression

Import trace for requested module:
./node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js
./node_modules/@supabase/realtime-js/dist/main/index.js
./node_modules/@supabase/supabase-js/dist/module/index.js
./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
./node_modules/@supabase/ssr/dist/module/index.js
./src/lib/supabase/server.ts
./src/app/auth/actions.ts
 GET /favicon.ico 200 in 1059ms
