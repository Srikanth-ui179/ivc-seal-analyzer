import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17201d",
        paper: "#f5f2eb",
        clay: "#a55b38",
        moss: "#47604e",
        sandstone: "#d9c8ac",
      },
      fontFamily: {
        display: ["Iowan Old Style", "Baskerville", "Georgia", "serif"],
        sans: ["Inter", "Aptos", "Helvetica Neue", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
