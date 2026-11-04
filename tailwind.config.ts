import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          emerald: "#059669",
          forest: "#064E3B",
          leaf: "#84CC16",
          secondary: "#10B981",
          soft: "#F5FAF5",
          primaryText: "#16352A",
          secondaryText: "#64756B",
          darkBg: "#051D16",
          darkCard: "#0A2920",
          darkCardHover: "#0E382C",
          darkBorder: "#134B3B",
          darkText: "#E6F4EA",
          darkMuted: "#8DA99B",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(6, 78, 59, 0.08)",
        card: "0 10px 30px -4px rgba(6, 78, 59, 0.07), 0 4px 10px -2px rgba(6, 78, 59, 0.04)",
        glow: "0 0 25px -5px rgba(16, 185, 129, 0.35)",
        darkCard: "0 10px 30px -4px rgba(0, 0, 0, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;

