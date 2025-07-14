import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "@/components/ui/Toaster";
import { Suspense } from "react";
import { TopLoader } from "@/components/layouts/TopLoader";

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
        <Suspense fallback={null}>
          <TopLoader />
        </Suspense>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}