### 1. Sentry Integration (Error Monitoring)

-   `[x]` **Task 1.1: Install Sentry SDK**
    -   **Action:** Run the npm command to install Sentry's Next.js package.
    -   **Command:** `npm install @sentry/nextjs`

-   `[ ]` **Task 1.2: Create Sentry Client Configuration**
    -   **File:** `sentry.client.config.ts`
    -   **Action:** Create this new file to initialize Sentry for the browser.
    -   **Content:**
        ```typescript
        // This file configures the initialization of Sentry on the client.
        import * as Sentry from "@sentry/nextjs";

        Sentry.init({
          dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
          tracesSampleRate: 1.0,
          debug: false,
          replaysOnErrorSampleRate: 1.0,
          replaysSessionSampleRate: 0.1,
          integrations: [
            Sentry.replayIntegration({
              maskAllText: true,
              blockAllMedia: true,
            }),
          ],
        });
        ```

-   `[ ]` **Task 1.3: Create Sentry Server Configuration**
    -   **File:** `sentry.server.config.ts`
    -   **Action:** Create this new file to initialize Sentry for the server runtime.
    -   **Content:**
        ```typescript
        // This file configures the initialization of Sentry on the server.
        import * as Sentry from "@sentry/nextjs";

        Sentry.init({
          dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
          tracesSampleRate: 1.0,
          debug: false,
        });
        ```

-   `[ ]` **Task 1.4: Create Sentry Edge Configuration**
    -   **File:** `sentry.edge.config.ts`
    -   **Action:** Create this new file to initialize Sentry for edge runtimes.
    -   **Content:**
        ```typescript
        // This file configures the initialization of Sentry for edge features.
        import * as Sentry from "@sentry/nextjs";

        Sentry.init({
          dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
          tracesSampleRate: 1.0,
          debug: false,
        });
        ```

-   `[ ]` **Task 1.5: Update Next.js Configuration for Sentry**
    -   **File:** `next.config.ts`
    -   **Action:** This task involves two steps: first, rename `next.config.ts` to `next.config.mjs` to support top-level import/export syntax for the Sentry wrapper. Second, update the file to wrap the configuration with Sentry's `withSentryConfig`.
    -   **Step 1 Command:** `mv next.config.ts next.config.mjs`
    -   **Step 2 File Content (`next.config.mjs`):**
        ```javascript
        import { withSentryConfig } from "@sentry/nextjs";

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

        export default withSentryConfig(
          nextConfig,
          {
            silent: true,
            org: "your-sentry-org-slug", // Replace with actual Sentry org
            project: "your-sentry-project-slug", // Replace with actual Sentry project
          },
          {
            widenClientFileUpload: true,
            tunnelRoute: "/monitoring",
            hideSourceMaps: true,
            disableLogger: true,
            automaticVercelMonitors: true,
          }
        );
        ```

---

### 2. PWA (Progressive Web App) Conversion

-   `[ ]` **Task 2.1: Install PWA Dependency**
    -   **Action:** Run the npm command to install the Next.js PWA package.
    -   **Command:** `npm install @ducanh2912/next-pwa`

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

        const sentryWrappedConfig = withSentryConfig(
          nextConfig,
          {
            silent: true,
            org: "your-sentry-org-slug",
            project: "your-sentry-project-slug",
          },
          {
            widenClientFileUpload: true,
            tunnelRoute: "/monitoring",
            hideSourceMaps: true,
            disableLogger: true,
            automaticVercelMonitors: true,
          }
        );

        export default withPWA(sentryWrappedConfig);
        ```

-   `[ ]` **Task 2.3: Merge PWA properties into the existing `metadata` object**
    -   **File:** `src/app/layout.tsx`
    -   **Action:** Update the existing `metadata` object to include PWA-specific fields like `manifest` and `appleWebApp`.
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
          // --- Start of PWA-specific additions ---
          applicationName: APP_NAME,
          manifest: "/manifest.json",
          appleWebApp: {
            capable: true,
            statusBarStyle: "default",
            title: APP_DEFAULT_TITLE,
          },
          formatDetection: {
            telephone: false,
          },
          // --- End of PWA-specific additions ---
          
          metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
          title: {
            default: APP_DEFAULT_TITLE,
            template: "%s | ZIRO.FIT",
          },
          description: APP_DESCRIPTION,
          openGraph: {
            type: "website",
            siteName: APP_NAME,
            title: {
              default: APP_DEFAULT_TITLE,
              template: "%s | ZIRO.FIT",
            },
            description: APP_DESCRIPTION,
            url: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
            images: [{ url: "/og-image.png", width: 1200, height: 630 }],
            locale: "en_US",
          },
          twitter: {
            card: "summary_large_image",
            title: {
              default: APP_DEFAULT_TITLE,
              template: "%s | ZIRO.FIT",
            },
            description: APP_DESCRIPTION,
            images: ["/og-image.png"],
          },
          robots: {
            index: true,
            follow: true,
            googleBot: {
              index: true,
              follow: true,
              "max-video-preview": -1,
              "max-image-preview": "large",
              "max-snippet": -1,
            },
          },
          other: {
            'script[type="application/ld+json"]': JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "ZIRO.FIT",
              url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
              logo: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/logo.png`,
            }),
          },
        };
        
        export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
          return (
            <html lang="en" suppressHydrationWarning>
              <head>
                <link rel="preconnect" href="http://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
              </head>
              <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <ThemeProvider>{children}</ThemeProvider>
              </body>
            </html>
          );
        }
        ```

-   `[ ]` **Task 2.4: Create Manifest File**
    -   **File:** `public/manifest.json`
    -   **Action:** Create the web app manifest file.
    -   **Content:**
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
    -   **Action:** This is a conceptual task. Create a directory `public/icons` and add `icon-192x192.png` and `icon-512x512.png`. *No file will be created by the AI for this task.*

---