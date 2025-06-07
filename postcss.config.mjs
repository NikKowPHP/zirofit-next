import tailwindcss from '@tailwindcss/postcss';

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: [
    // Use the imported plugin function
    tailwindcss({}),
    // Autoprefixer is no longer needed with Tailwind CSS v4 and is handled by the plugin itself.
  ],
};

export default config;