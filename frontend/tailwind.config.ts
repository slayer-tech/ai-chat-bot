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
        void: "#000000",
        surface: "#0D0D0D",
        elevated: "#1D1D1F",
        text: "#F5F5F7",
        muted: "#86868B",
        subtle: "#424245",
        accent: "#2997FF",
        "accent-hover": "#0077ED",
        success: "#30D158",
        danger: "#FF453A",
      },
      fontFamily: {
        sans: ["var(--font-onest)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
