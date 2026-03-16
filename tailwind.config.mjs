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
        'custom-cream': "rgb(var(--color-background-light) / <alpha-value>)",
        'interview-blue': "rgb(var(--color-primary) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "background-light": "rgb(var(--color-background-light) / <alpha-value>)",
        "background-dark": "rgb(var(--color-background-dark) / <alpha-value>)",
        "surface-dark": "rgb(var(--color-surface-dark) / <alpha-value>)",
        "border-dark": "rgb(var(--color-border-dark) / <alpha-value>)",
        "slate-card": "rgb(var(--color-slate-card) / <alpha-value>)",
        "card-dark": "rgb(var(--color-slate-card) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "var(--radius-default)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      fontSize: {
        xs: "var(--text-xs)",
        sm: "var(--text-sm)",
        base: "var(--text-base)",
        lg: "var(--text-lg)",
        xl: "var(--text-xl)",
        "2xl": "var(--text-2xl)",
        "3xl": "var(--text-3xl)",
        "4xl": "var(--text-4xl)",
        "5xl": "var(--text-5xl)",
        "6xl": "var(--text-6xl)",
        "7xl": "var(--text-7xl)",
        "8xl": "var(--text-8xl)",
        "9xl": "var(--text-9xl)",
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
