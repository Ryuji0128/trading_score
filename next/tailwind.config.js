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
        primary: {
          pale: "#E3F2FD",
          light: "#64B5F6",
          DEFAULT: "#1565C0",
          dark: "#0D47A1",
        },
        secondary: {
          pale: "#E0F7FA",
          light: "#4DD0E1",
          DEFAULT: "#00ACC1",
          dark: "#006064",
        },
        background: "#FAFBFC",
        foreground: "#263238",
      },
    },
  },
  plugins: [],
}
