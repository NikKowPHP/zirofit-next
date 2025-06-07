import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
theme: {
    extend: {
      // You can extend your theme here if needed later
      // Example from Laravel project:
      // colors: {
      //   action: '#0171e3',
      // },
      // fontFamily: {
      //   sans: ['Instrument Sans', ...defaultTheme.fontFamily.sans],
      // }
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Add forms plugin
  ],
} satisfies Config;
