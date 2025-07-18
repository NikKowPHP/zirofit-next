

const { withSentryConfig } = require('@sentry/nextjs');
const withNextIntl = require('next-intl/plugin');
const withBundleAnalyzer = require('@next/bundle-analyzer');
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const withIntl = withNextIntl('./src/i18n.ts');

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

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

// Chain plugins: bundleAnalyzer -> withPWA -> withIntl -> withSentryConfig
// Make sure to put `withSentryConfig` last in your list of HOCs.
module.exports = withSentryConfig(
  withIntl(withPWA(bundleAnalyzer(nextConfig))),
  sentryWebpackPluginOptions
);
