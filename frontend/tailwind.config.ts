import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        void: "#050508",
        surface: "#0c0c10",
        elevated: "#131318",
        "elevated-hover": "#1a1a22",
        text: "#f0f0f5",
        muted: "#6e6e78",
        subtle: "#2a2a32",
        accent: "#3b6ef5",
        "accent-hover": "#5c8aff",
      },
      fontFamily: {
        sans: ["var(--font-onest)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
