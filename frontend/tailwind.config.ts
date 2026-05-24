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
        void: "#0a0a0f",
        surface: "#111118",
        elevated: "#1a1a24",
        "elevated-hover": "#22222e",
        border: "rgba(255,255,255,0.06)",
        "border-hover": "rgba(255,255,255,0.10)",
        text: "#f0f0f5",
        "text-secondary": "#a0a0ac",
        muted: "#6e6e78",
        accent: "#ff6b5b",
        "accent-hover": "#ff8578",
        "accent-soft": "rgba(255,107,91,0.10)",
      },
      fontFamily: {
        sans: ["var(--font-geist)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.32, 0.72, 0, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
