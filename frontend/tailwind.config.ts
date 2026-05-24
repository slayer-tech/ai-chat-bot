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
        void: "#0e0e16",
        surface: "#161620",
        elevated: "#1e1e2c",
        "elevated-hover": "#28283a",
        border: "rgba(255,255,255,0.08)",
        "border-hover": "rgba(255,255,255,0.14)",
        text: "#f4f4f8",
        "text-secondary": "#b4b4c0",
        muted: "#7a7a8a",
        accent: "#ff6b5b",
        "accent-hover": "#ff8578",
        "accent-soft": "rgba(255,107,91,0.12)",
      },
      fontFamily: {
        sans: ["var(--font-geist)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
