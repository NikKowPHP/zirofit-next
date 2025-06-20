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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: "ZIRO.FIT | All-In-One Platform for Personal Trainers",
    template: "%s | ZIRO.FIT",
  },
  description: "Attract more clients, showcase your results, and grow your fitness business with ZIRO.FIT. The ultimate toolkit for the modern personal trainer.",
  openGraph: {
    title: "ZIRO.FIT | All-In-One Platform for Personal Trainers",
    description: "The ultimate toolkit for the modern personal trainer.",
    url: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
    siteName: 'ZIRO.FIT',
    images: [
      {
        url: '/og-image.png', // Create this image and place it in the public folder
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZIRO.FIT | All-In-One Platform for Personal Trainers',
    description: 'The ultimate toolkit for the modern personal trainer.',
    // Add your twitter handle if you have one: creator: '@YourTwitterHandle',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Adding JSON-LD structured data
  other: {
    'script[type="application/ld+json"]': JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "ZIRO.FIT",
      "url": process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      "logo": `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/logo.png`, // Create a logo file
      "sameAs": [
        // Add URLs to your social media profiles here
        // "https://twitter.com/zirofit",
        // "https://www.instagram.com/zirofit/"
      ]
    }),
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}