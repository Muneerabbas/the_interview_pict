/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        'custom-cream': "#F6F4EF", // Custom cream color
        'interview-blue': '#2447E8', // Interview blue color
        // Warm paper/ink ramp from the "theInterviewRoom Landing" Claude Design
        // file, mapped onto `slate` so existing slate-* classes pick it up.
        // The design's accent (#2447E8) mapped onto `blue`, so every existing
        // blue-* class across the app picks it up instead of Tailwind's default.
        blue: {
          50: '#EEF1FE',
          100: '#DDE3FD',
          200: '#BCC8FB',
          300: '#93A7F8',
          400: '#6480F2',
          500: '#3A5CEC',
          600: '#2447E8',
          700: '#1D3AC4',
          800: '#1B319B',
          900: '#1B2E7B',
          950: '#141E4B',
        },
        slate: {
          50: '#FAF9F5',
          100: '#F1EFE8',
          200: '#E4E0D7',
          300: '#D6D1C5',
          400: '#A8A59D',
          500: '#8A877E',
          600: '#5E5C56',
          700: '#3E3C38',
          800: '#1A1E25',
          900: '#14161C',
          950: '#101216',
        },
      },
      animation: {
        slideIn: 'slideIn 0.5s ease-out',
        fadeOut: 'fadeOut 3s 2.5s forwards',
      },
      keyframes: {
        slideIn: {
          '0%': {
            transform: 'translateX(-50%) translateY(20px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateX(-50%) translateY(0)',
            opacity: '1',
          },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
