import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3f7ff",
          100: "#e7efff",
          500: "#2f6fed",
          600: "#225bd0",
          700: "#1b49a7"
        }
      }
    }
  },
  plugins: []
};

export default config;
