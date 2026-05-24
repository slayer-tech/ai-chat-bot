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
        void: {
          DEFAULT: "#050507",
          50: "#f5f5f6",
          100: "#e6e6e8",
          200: "#cfcfd4",
          300: "#aeaeb6",
          400: "#858590",
          500: "#6a6a76",
          600: "#5b5b66",
          700: "#4d4d57",
          800: "#43434b",
          900: "#3b3b42",
          950: "#050507",
        },
        frost: {
          DEFAULT: "#F0F0F5",
          50: "#FAFAFC",
          100: "#F0F0F5",
          200: "#E2E2EA",
          300: "#C8C8D5",
          400: "#A8A8BA",
        },
        electric: {
          DEFAULT: "#4F8CFF",
          50: "#EFF5FF",
          100: "#DBE8FE",
          200: "#BED8FF",
          300: "#91BBFF",
          400: "#4F8CFF",
          500: "#3B6EF5",
          600: "#1F4FE0",
        },
        mint: {
          DEFAULT: "#22D3A6",
          50: "#ECFDF6",
          400: "#22D3A6",
          500: "#14B88E",
        },
        rose: {
          DEFAULT: "#FB6184",
          50: "#FFF0F3",
          400: "#FB6184",
          500: "#E8466D",
        },
        glass: {
          light: "rgba(255,255,255,0.03)",
          medium: "rgba(255,255,255,0.06)",
          heavy: "rgba(255,255,255,0.10)",
          border: "rgba(255,255,255,0.08)",
          borderLight: "rgba(255,255,255,0.04)",
        },
      },
      fontFamily: {
        display: ["var(--font-onest)", "system-ui", "sans-serif"],
        body: ["var(--font-onest)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2s infinite",
        "float-slow": "float 8s ease-in-out 1s infinite",
        "glow-pulse": "glowPulse 4s ease-in-out infinite",
        "shimmer": "shimmer 3s linear infinite",
        "spin-slow": "spin 20s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-16px)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.7" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "aurora": "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(79,140,255,0.18), transparent), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(34,211,166,0.08), transparent), radial-gradient(ellipse 50% 50% at 20% 60%, rgba(251,97,132,0.06), transparent)",
        "aurora-strong": "radial-gradient(ellipse 80% 70% at 50% 0%, rgba(79,140,255,0.28), transparent), radial-gradient(ellipse 60% 50% at 80% 40%, rgba(34,211,166,0.12), transparent)",
        "grid-pattern": "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        "gradient-shimmer": "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
      },
      backgroundSize: {
        "grid": "64px 64px",
      },
      boxShadow: {
        "glow-electric": "0 0 80px -20px rgba(79,140,255,0.4), 0 0 40px -10px rgba(79,140,255,0.2)",
        "glow-electric-sm": "0 0 40px -10px rgba(79,140,255,0.3)",
        "glow-mint": "0 0 60px -15px rgba(34,211,166,0.3)",
        "glow-rose": "0 0 60px -15px rgba(251,97,132,0.3)",
        "inner-glow": "inset 0 1px 1px rgba(255,255,255,0.08)",
      },
      transitionTimingFunction: {
        "premium": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
