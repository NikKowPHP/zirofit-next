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
### `work_breakdown/tasks_stage_2/plan-phase-B-testing-setup.md`
# **Phase B: Comprehensive Test Suite Implementation**

**Goal:** Expand the test suite to provide comprehensive coverage for all critical business logic implemented in Stage 1, including booking validation, search filtering, and dashboard data services, to prevent regressions and ensure backend stability.

---

### 1. Test Environment Enhancement

-   `[ ]` **Task 1.1: Install Testing Utility**
    -   **Action:** Install `jest-mock-extended` for simplified Prisma client mocking.
    -   **Command:** `npm install --save-dev jest-mock-extended`

-   `[ ]` **Task 1.2: Create Singleton Prisma Mock**
    -   **Action:** Create a reusable, singleton instance of a mocked Prisma client.
    -   **File:** `tests/singleton.ts`
    -   **Content:**
        ```typescript
        import { PrismaClient } from '@prisma/client'
        import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'
        import { prisma } from '@/lib/prisma'

        jest.mock('@/lib/prisma', () => ({
          __esModule: true,
          prisma: mockDeep<PrismaClient>(),
        }))

        beforeEach(() => {
          mockReset(prismaMock)
        })

        export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
        ```

-   `[ ]` **Task 1.3: Update Jest Setup for Singleton Mock**
    -   **File:** `jest.setup.js`
    -   **Action:** Import the new singleton mock to ensure it runs before every test suite.
    -   **Content:**
        ```javascript
        const fetch = require('node-fetch');
        global.fetch = fetch;
        global.Request = fetch.Request;
        global.Response = fetch.Response;
        global.Headers = fetch.Headers;
        require('@testing-library/jest-dom');
        const { TextEncoder, TextDecoder } = require('util');
        global.TextEncoder = TextEncoder;
        global.TextDecoder = TextDecoder;
        
        require('./tests/singleton'); // Add this line

        process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://mock-url.com';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-key-valid-format';
        ```

---

### 2. Core Logic Test Implementation

-   `[ ]` **Task 2.1: Create Test for Booking Validation Logic**
    -   **Action:** Create a new test file to verify the `createBooking` server action correctly handles scheduling conflicts.
    -   **File:** `src/app/profile/actions/booking-actions.test.ts`
    -   **Content:**
        ```typescript
        import { createBooking, getTrainerSchedule } from './booking-actions';
        import { prismaMock } from '../../../../tests/singleton';

        jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
        jest.mock('resend', () => ({ Resend: jest.fn().mockReturnValue({ emails: { send: jest.fn().mockResolvedValue({}) } }) }));

        describe('Booking Actions', () => {
          it('should reject a booking that overlaps with an existing booking', async () => {
            const formData = new FormData();
            formData.append('trainerId', 'trainer-1');
            formData.append('startTime', '2025-10-10T10:00:00.000Z');
            formData.append('endTime', '2025-10-10T11:00:00.000Z');
            formData.append('clientName', 'Test Client');
            formData.append('clientEmail', 'test@example.com');
            
            // Mock existing data
            prismaMock.profile.findFirst.mockResolvedValue({ availability: { fri: ["09:00-17:00"] } } as any);
            prismaMock.booking.findMany.mockResolvedValue([{ startTime: new Date('2025-10-10T10:00:00.000Z'), endTime: new Date('2025-10-10T11:00:00.000Z') }]);

            const result = await createBooking(undefined, formData);

            expect(result.success).toBe(false);
            expect(result.error).toContain('This time slot is already booked');
            expect(prismaMock.booking.create).not.toHaveBeenCalled();
          });

          it('should reject a booking outside of the trainer\'s availability', async () => {
            const formData = new FormData();
            formData.append('trainerId', 'trainer-1');
            formData.append('startTime', '2025-10-10T18:00:00.000Z'); // 6 PM
            formData.append('endTime', '2025-10-10T19:00:00.000Z'); // 7 PM
            formData.append('clientName', 'Test Client');
            formData.append('clientEmail', 'test@example.com');

            prismaMock.profile.findFirst.mockResolvedValue({ availability: { fri: ["09:00-17:00"] } } as any);
            prismaMock.booking.findMany.mockResolvedValue([]);

            const result = await createBooking(undefined, formData);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('outside trainer\'s available hours');
            expect(prismaMock.booking.create).not.toHaveBeenCalled();
          });
        });
        ```

-   `[ ]` **Task 2.2: Create Test for Search & Filter Logic**
    -   **Action:** Create a new test file to verify that `getPublishedTrainers` builds the correct Prisma query.
    -   **File:** `src/lib/api/trainers.test.ts`
    -   **Content:**
        ```typescript
        import { getPublishedTrainers } from './trainers';
        import { prismaMock } from '../../../tests/singleton';

        describe('Trainer API', () => {
          it('should build the correct where clause for query and location', async () => {
            const query = 'yoga';
            const location = 'New York';
            
            await getPublishedTrainers(1, 10, query, location);

            expect(prismaMock.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
              where: {
                role: 'trainer',
                profile: { isNot: null },
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { username: { contains: query, mode: 'insensitive' } },
                  { profile: { certifications: { contains: query, mode: 'insensitive' } } },
                  { profile: { aboutMe: { contains: query, mode: 'insensitive' } } },
                  { profile: { methodology: { contains: query, mode: 'insensitive' } } },
                  { profile: { philosophy: { contains: query, mode: 'insensitive' } } },
                ],
                AND: [
                  { profile: { location: { contains: location, mode: 'insensitive' } } }
                ]
              }
            }));
          });
        });
        ```

-   `[ ]` **Task 2.3: Create Test for Dashboard Data Service**
    -   **Action:** Create a new test file to verify the data aggregation logic in `getDashboardData`.
    -   **File:** `src/lib/dashboard.test.ts`
    -   **Content:**
        ```typescript
        import { getDashboardData } from './dashboard';
        import { prismaMock } from '../../tests/singleton';

        describe('Dashboard Service', () => {
          it('should correctly