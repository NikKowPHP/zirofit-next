import type { NextConfig } from "next";
import pwa from "next-pwa";
import { withSentryConfig } from "@sentry/nextjs";

const withPWA = pwa({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
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
  withPWA(nextConfig as any),
  sentryWebpackPluginOptions
);