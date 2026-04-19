/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Segoe UI", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        mono: ["Inter", "Fira Code", "ui-monospace", "monospace"],
      },
      colors: {
        /* Background & Surfaces - Exact match from reference */
        "primary": "#0A0E1A",
        "card": "#151B2B",
        "sidebar": "#0D1117",
        "deep": "#0A0E1A",
        "hover": "#1a2437",
        "input": "#0F1420",
        "overlay": "rgba(10, 14, 26, 0.8)",

        /* Accent Colors */
        "cyan": "#00D9C0",
        "cyan-light": "#1DD3C3",
        "cyan-dark": "#00a89f",

        /* Status Colors */
        "green": "#0A4A3F",
        "green-light": "#34d399",
        "green-dark": "#059669",

        "red": "#E74C3C",
        "red-light": "#FF6B6B",
        "red-dark": "#8B3A3A",

        "amber": "#F5A623",
        "amber-light": "#FFB84D",
        "amber-dark": "#d97706",

        /* Text Colors */
        "white": "#FFFFFF",
        "secondary": "#9CA3AF",
        "muted": "#6B7280",
        "hint": "#475569",

        /* Border & Divider */
        "border": "#1e293b",
        "border-light": "rgba(255, 255, 255, 0.05)",
        "border-lighter": "rgba(255, 255, 255, 0.02)",
      },
      spacing: {
        "xs": "0.25rem",
        "sm": "0.5rem",
        "md": "1rem",
        "lg": "1.5rem",
        "xl": "2rem",
        "2xl": "3rem",
        "3xl": "4rem",
      },
      borderRadius: {
        xs: "0.25rem",
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0, 0, 0, 0.3)",
        md: "0 4px 12px rgba(0, 0, 0, 0.3)",
        lg: "0 8px 16px rgba(0, 0, 0, 0.4)",
        xl: "0 12px 24px rgba(0, 0, 0, 0.5)",

        "card": "0 4px 12px rgba(0, 0, 0, 0.3)",
        "card-hover": "0 8px 24px rgba(0, 0, 0, 0.4)",

        "glow-cyan": "0 0 20px rgba(0, 217, 192, 0.1)",
        "glow-cyan-hover": "0 0 30px rgba(0, 217, 192, 0.2)",

        "glow-red": "0 0 20px rgba(231, 76, 60, 0.1)",
        "glow-red-hover": "0 0 30px rgba(231, 76, 60, 0.15)",

        "glow-amber": "0 0 20px rgba(245, 166, 35, 0.1)",
        "glow-amber-hover": "0 0 30px rgba(245, 166, 35, 0.15)",

        "inset-light": "inset 0 1px 1px rgba(255, 255, 255, 0.05)",
      },
      animation: {
        "pulse-subtle": "pulse-subtle 3s ease-in-out infinite",
        "fade-in": "fade-in 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-in-left": "slide-in-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-in-up": "slide-in-up 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "scale-in": "scale-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "ping-soft": "ping-soft 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite",
      },
      keyframes: {
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "fade-in": {
          "from": { opacity: "0", transform: "translateY(8px)" },
          "to": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          "from": { opacity: "0", transform: "translateX(-12px)" },
          "to": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-up": {
          "from": { opacity: "0", transform: "translateY(12px)" },
          "to": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "from": { opacity: "0", transform: "scale(0.95)" },
          "to": { opacity: "1", transform: "scale(1)" },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(0, 217, 192, 0.1)",
          },
          "50%": {
            boxShadow: "0 0 30px rgba(0, 217, 192, 0.2)",
          },
        },
        "ping-soft": {
          "75%, 100%": {
            transform: "scale(2)",
            opacity: "0",
          },
        },
      },
      transitionDuration: {
        fast: "150ms",
        base: "300ms",
        slow: "500ms",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
    },
  },
  plugins: [],
}