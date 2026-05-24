import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B82F6",
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          secondary: "#F5F5F7",
          tertiary: "#FAFAFA",
        },
        ink: {
          DEFAULT: "#111827",
          secondary: "#6B7280",
          tertiary: "#9CA3AF",
          quaternary: "#D1D5DB",
        },
        success: "#16A34A",
        warning: "#D97706",
        danger: "#DC2626",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
      },
      spacing: {
        "0.5": "0.125rem",
        "1.5": "0.375rem",
        "2.5": "0.625rem",
        "3.5": "0.875rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        "micro": "0 1px 2px rgba(0, 0, 0, 0.04)",
        "soft": "0 4px 24px rgba(0, 0, 0, 0.06)",
        "elevated": "0 8px 32px rgba(0, 0, 0, 0.08)",
      },
      transitionTimingFunction: {
        "premium": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
