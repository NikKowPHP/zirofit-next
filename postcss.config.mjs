/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // This tells the Next.js loader to find the plugin in the '@tailwindcss/postcss' package.
    '@tailwindcss/postcss': {},
    // Autoprefixer is NOT needed with Tailwind v4.
  },
};

export default config;