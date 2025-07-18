import type { NextConfig } from "next";
import pwa from "next-pwa";
import { withSentryConfig } from "@sentry/nextjs";
import withNextIntl from 'next-intl/plugin';
import withBundleAnalyzer from "@next/bundle-analyzer";

const withIntl = withNextIntl('./src/i18n.ts');

const withPWA = pwa({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // This will allow all hostnames. Use with caution.
      },
    ],
  },
   eslint: {
   // Disable ESLint during builds as it's handled separately
  ignoreDuringBuilds: true,
   },
  webpack: (config) => {
    return config;
  },
};

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Don't show logs
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
};


// Make sure to put `withSentryConfig` last in your list of HOCs.
export default withSentryConfig(
  withIntl(withPWA(bundleAnalyzer(nextConfig  as any)) as any),
  sentryWebpackPluginOptions
);