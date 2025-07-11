### work_breakdown/tasks/plan-phase-A-pwa-and-sentry.md
# **Phase A: PWA & Observability Foundation**

**Goal:** Configure the application to function as an installable Progressive Web App (PWA) and integrate Sentry for production error monitoring. This phase establishes the foundational tooling for a more resilient application.

---

### 1. Sentry Integration (Error Monitoring)

-   `[ ]` **Task 1.1: Install Sentry SDK**

    -   **Action:** Run the npm command to install Sentry's Next.js package.
    -   **Command:**
        ```bash
        npm install @sentry/nextjs
        ```

-   `[ ]` **Task 1.2: Create Sentry Client Configuration**

    -   **File:** `sentry.client.config.ts`
    -   **Action:** Create this new file to initialize Sentry for the browser.
    -   **Content:**
        ```typescript
        // This file configures the initialization of Sentry on the client.
        // The config you add here will be used whenever a users loads a page in their browser.
        // https://docs.sentry.io/platforms/javascript/guides/nextjs/

        import * as Sentry from "@sentry/nextjs";

        Sentry.init({
          dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

          // Adjust this value in production, or use tracesSampler for finer control
          tracesSampleRate: 1.0,

          // Setting this option to true will print useful information to the console while you're setting up Sentry.
          debug: false,

          replaysOnErrorSampleRate: 1.0,

          // This sets the sample rate for session replay for all sessions, not just those with errors.
          replaysSessionSampleRate: 0.1,

          // You can remove this option if you're not planning to use the Sentry Feedback feature
          integrations: [
            Sentry.replayIntegration({
              // Additional Replay configuration goes in here, for example:
              maskAllText: true,
              blockAllMedia: true,
            }),
          ],
        });
        ```

-   `[ ]` **Task 1.3: Create Sentry Server Configuration**

    -   **File:** `sentry.server.config.ts`
    -   **Action:** Create this new file to initialize Sentry for the server (Node.js runtime).
    -   **Content:**
        ```typescript
        // This file configures the initialization of Sentry on the server.
        // The config you add here will be used whenever the server handles a request.
        // https://docs.sentry.io/platforms/javascript/guides/nextjs/

        import * as Sentry from "@sentry/nextjs";

        Sentry.init({
          dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

          // Adjust this value in production, or use tracesSampler for finer control
          tracesSampleRate: 1.0,

          // Setting this option to true will print useful information to the console while you're setting up Sentry.
          debug: false,
        });
        ```

-   `[ ]` **Task 1.4: Create Sentry Edge Configuration**
    -   **File:** `sentry.edge.config.ts`
    -   **Action:** Create this new file to initialize Sentry for edge runtimes (e.g., Vercel Edge Functions, Middleware).
    -   **Content:**
        ```typescript
        // This file configures the initialization of Sentry for edge features of Sentry on Vercel.
        // The config you add here will be used whenever a server-side route is handled by Vercel Edge Functions.
        // https://docs.sentry.io/platforms/javascript/guides/nextjs/

        import * as Sentry from "@sentry/nextjs";

        Sentry.init({
          dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

          // Adjust this value in production, or use tracesSampler for finer control
          tracesSampleRate: 1.0,

          // Setting this option to true will print useful information to the console while you're setting up Sentry.
          debug: false,
        });
        ```

-   `[ ]` **Task 1.5: Update Next.js Configuration for Sentry**

    -   **File:** `next.config.mjs` (renamed from `next.config.ts`)
    -   **Action:** Rename `next.config.ts` to `next.config.mjs`, update its syntax to ES Modules, and wrap the configuration with Sentry's `withSentryConfig` to enable automatic source map uploading and instrumentation.
    -   **Content:**
        ```javascript
        import { withSentryConfig } from "@sentry/nextjs";

        /** @type {import('next').NextConfig} */
        const nextConfig = {
          images: {
            remotePatterns: [
              {
                protocol: 'https',
                hostname: '**', // This will allow all hostnames. Use with caution.
              },
            ],
          },
        };

        export default withSentryConfig(
          nextConfig,
          {
            // For all available options, see:
            // https://github.com/getsentry/sentry-webpack-plugin#options

            // Suppresses source map uploading logs during build
            silent: true,
            org: "your-sentry-org-slug",
            project: "your-sentry-project-slug",
          },
          {
            // For all available options, see:
            // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

            // Upload a larger set of source maps for better stack traces (increases build time)
            widenClientFileUpload: true,

            // Transpiles SDK to be compatible with IE11 (increases bundle size)
            transpileClientSDK: true,

            // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
            // This can increase your server load as well as your hosting bill.
            // Note: Check that the configured route will not match with any existing routes in your app.
            tunnelRoute: "/monitoring",

            // Hides source maps from generated client bundles
            hideSourceMaps: true,

            // Automatically tree-shake Sentry logger statements to reduce bundle size
            disableLogger: true,

            // Enables automatic instrumentation of Vercel Cron Monitors.
            // See the following for more information:
            // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/integrations/vercel-cron-monitors/
            automaticVercelMonitors: true,
          }
        );
        ```

---

### 2. PWA (Progressive Web App) Conversion

-   `[ ]` **Task 2.1: Install PWA Dependency**
    -   **Action:** Run the npm command to install the Next.js PWA package.
    -   **Command:**
        ```bash
        npm install @ducanh2912/next-pwa
        ```

-   `[ ]` **Task 2.2: Update Next.js Configuration for PWA**

    -   **File:** `next.config.mjs`
    -   **Action:** Update the configuration to include the PWA options and wrap the Sentry-wrapped config with the PWA plugin.
    -   **Content:**
        ```javascript
        import { withSentryConfig } from "@sentry/nextjs";
        import withPWAInit from "@ducanh2912/next-pwa";

        const withPWA = withPWAInit({
            dest: "public",
            register: true,
            skipWaiting: true,
            disable: process.env.NODE_ENV === "development",
        });

        /** @type {import('next').NextConfig} */
        const nextConfig = {
          images: {
            remotePatterns: [
              {
                protocol: 'https',
                hostname: '**',
              },
            ],
          },
        };

        const sentryConfig = withSentryConfig(
          nextConfig,
          {
            silent: true,
            org: "your-sentry-org-slug",
            project: "your-sentry-project-slug",
          },
          {
            widenClientFileUpload: true,
            transpileClientSDK: true,
            tunnelRoute: "/monitoring",
            hideSourceMaps: true,
            disableLogger: true,
            automaticVercelMonitors: true,
          }
        );

        export default withPWA(sentryConfig);
        ```

-   `[ ]` **Task 2.3: Add PWA Manifest to Root Layout**

    -   **File:** `src/app/layout.tsx`
    -   **Action:** Enhance the `metadata` object to include PWA-specific fields like `manifest`, `themeColor`, and `icons` to generate a `manifest.json` file.
    -   **Content:**
        ```typescript
        // src/app/layout.tsx
        import type { Metadata } from "next";
        import { Geist, Geist_Mono } from "next/font/google";
        import "./globals.css";
        import { ThemeProvider } from "@/context/ThemeContext";

        const geistSans = Geist({
          variable: "--font-geist-sans",
          subsets: ["latin"],
        });

        const geistMono = Geist_Mono({
          variable: "--font-geist-mono",
          subsets: ["latin"],
        });

        const APP_NAME = "ZIRO.FIT";
        const APP_DEFAULT_TITLE = "ZIRO.FIT | All-In-One Platform for Personal Trainers";
        const APP_DESCRIPTION = "Attract more clients, showcase your results, and grow your fitness business with ZIRO.FIT.";

        export const metadata: Metadata = {
          applicationName: APP_NAME,
          title: {
            default: APP_DEFAULT_TITLE,
            template: "%s | ZIRO.FIT",
          },
          description: APP_DESCRIPTION,
          manifest: "/manifest.json",
          themeColor: "#FFFFFF",
          appleWebApp: {
            capable: true,
            statusBarStyle: "default",
            title: APP_DEFAULT_TITLE,
          },
          formatDetection: {
            telephone: false,
          },
          openGraph: {
            type: "website",
            siteName: APP_NAME,
            title: {
              default: APP_DEFAULT_TITLE,
              template: "%s | ZIRO.FIT",
            },
            description: APP_DESCRIPTION,
          },
          twitter: {
            card: "summary",
            title: {
              default: APP_DEFAULT_TITLE,
              template: "%s | ZIRO.FIT",
            },
            description: APP_DESCRIPTION,
          },
        };
        
        export default function RootLayout({
          children,
        }: Readonly<{
          children: React.ReactNode;
        }>) {
          return (
            <html lang="en" suppressHydrationWarning>
              <head>
                {/* Preconnect to fonts */}
                <link rel="preconnect" href="http://fonts.googleapis.com" />
                <link
                  rel="preconnect"
                  href="https://fonts.gstatic.com"
                  crossOrigin="anonymous"
                />
              </head>
              <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
              >
                <ThemeProvider>{children}</ThemeProvider>
              </body>
            </html>
          );
        }
        ```
-   `[ ]` **Task 2.4: Create Manifest File**
    - **File:** `public/manifest.json`
    - **Action:** Create the web app manifest file.
    - **Content:**
      ```json
      {
        "theme_color": "#FFFFFF",
        "background_color": "#FFFFFF",
        "display": "standalone",
        "scope": "/",
        "start_url": "/",
        "name": "ZIRO.FIT",
        "short_name": "ZIRO.FIT",
        "description": "The All-in-One Platform for Personal Trainers",
        "icons": [
            {
                "src": "/icons/icon-192x192.png",
                "sizes": "192x192",
                "type": "image/png"
            },
            {
                "src": "/icons/icon-512x512.png",
                "sizes": "512x512",
                "type": "image/png"
            }
        ]
    }
    ```

-   `[ ]` **Task 2.5: Create PWA Icon Files**
    -   **Action:** This is a conceptual task. Add the necessary icon files to the `public/` directory. For this implementation, we will assume the files `icon-192x192.png` and `icon-512x512.png` have been created and placed in `public/icons/`. *No file will be created by the AI for this task.*