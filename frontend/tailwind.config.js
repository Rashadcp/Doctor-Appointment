/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "ink-black": "#0B0B0B",
        "deep-blue": "#004AC6",
        "medical-blue": "#004AC6",
        "status-pending": "#FEF3C7", // Amber-100
        "status-confirmed": "#D1FAE5", // Emerald-100
        "status-cancelled": "#FEE2E2", // Rose-100
        "slate-50": "#F8FAFC",
        "slate-200": "#E2E8F0",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        none: "0px",
        sm: "0px",
        DEFAULT: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
        "2xl": "0px",
        "3xl": "0px",
        full: "0px",
      },
      borderWidth: {
        DEFAULT: "1px",
      },
    },
  },
  plugins: [],
};
