// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-cream': "#F4F2EF", // Custom cream color
        'interview-blue': '#3863D3', // Interview blue color
        // Uncomment below lines if needed for custom variables
        // background: "var(--background)",
        // foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
