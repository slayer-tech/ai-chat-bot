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
        void: "#fafafa",
        surface: "#ffffff",
        elevated: "#f5f5f5",
        "elevated-hover": "#eeeeee",
        border: "#e5e5e5",
        "border-hover": "#d4d4d4",
        text: "#1a1a1a",
        "text-secondary": "#404040",
        muted: "#737373",
        accent: "#0d9488",
        "accent-hover": "#14b8a6",
        "accent-soft": "#ccfbf1",
      },
      fontFamily: {
        sans: ["var(--font-geist)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
