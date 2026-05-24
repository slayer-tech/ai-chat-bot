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
        void: "#08080c",
        surface: "#0f0f16",
        elevated: "#16161f",
        "elevated-hover": "#1e1e2a",
        text: "#f5f5f7",
        muted: "#6b6b75",
        subtle: "#2a2a35",
        accent: "#4f6af7",
        "accent-hover": "#6b82ff",
      },
      fontFamily: {
        sans: ["var(--font-onest)", "system-ui", "sans-serif"],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
        "34": "8.5rem",
        "38": "9.5rem",
      },
      maxWidth: {
        "content": "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
