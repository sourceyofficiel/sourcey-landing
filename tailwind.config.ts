import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        neutral: {
          0: "#FFFFFF",
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
        success: "#16A34A",
        warning: "#EAB308",
        danger: "#EF4444",
        enterprise: {
          50: "#FAF5FF",
          100: "#F3E8FF",
          200: "#E9D5FF",
          400: "#C084FC",
          500: "#A855F7",
          600: "#9333EA",
          700: "#7E22CE",
          800: "#6B21A8",
          900: "#581C87",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        brand: "0 10px 40px -10px rgba(37, 99, 235, 0.35)",
        enterprise: "0 10px 40px -10px rgba(147, 51, 234, 0.35)",
        sm: "0 1px 2px 0 rgba(15, 23, 42, 0.05)",
        md: "0 4px 12px -2px rgba(15, 23, 42, 0.08)",
        lg: "0 12px 40px -8px rgba(15, 23, 42, 0.12)",
      },
      keyframes: {
        "float-y": {
          "0%, 100%": { transform: "translateY(-8px)" },
          "50%": { transform: "translateY(8px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.4)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" },
        },
        aurora: {
          "0%": { backgroundPosition: "0% 50%", transform: "rotate(-5deg) scale(0.9)" },
          "25%": { backgroundPosition: "50% 100%", transform: "rotate(5deg) scale(1.1)" },
          "50%": { backgroundPosition: "100% 50%", transform: "rotate(-3deg) scale(0.95)" },
          "75%": { backgroundPosition: "50% 0%", transform: "rotate(3deg) scale(1.05)" },
          "100%": { backgroundPosition: "0% 50%", transform: "rotate(-5deg) scale(0.9)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        shine: {
          "0%": { backgroundPosition: "0% 0%" },
          "50%": { backgroundPosition: "100% 100%" },
          "100%": { backgroundPosition: "0% 0%" },
        },
      },
      animation: {
        "float-y": "float-y 5s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        marquee: "marquee var(--duration, 40s) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration, 40s) linear infinite",
        aurora: "aurora 8s ease-in-out infinite alternate",
        shimmer: "shimmer 1.5s infinite",
        shine: "shine var(--duration, 14s) linear infinite",
      },
      backgroundImage: {
        "grid-light":
          "linear-gradient(to right, rgba(15, 23, 42, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.04) 1px, transparent 1px)",
        "grid-dark":
          "linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
