import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./config/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:    "var(--color-primary)",
        secondary:  "var(--color-secondary)",
        accent:     "var(--color-accent)",
        accent2:    "var(--color-accent2)",
        bg:         "var(--color-bg)",
        surface:    "var(--color-surface)",
        surface2:   "var(--color-surface2)",
        "text-main": "var(--color-text)",
        "text-muted": "var(--color-text-muted)",
      },
      fontFamily: {
        display: "var(--font-display)",
        body:    "var(--font-body)",
      },
      animation: {
        "slide-up":    "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in":     "fadeIn 0.3s ease both",
        "pop":         "pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "card-in":     "cardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "pulse-dot":   "pulseDot 1.2s ease-in-out infinite",
        "ticker":      "ticker 20s linear infinite",
      },
      keyframes: {
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pop: {
          "0%":   { opacity: "0", transform: "scale(0.85)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        cardIn: {
          "0%":   { opacity: "0", transform: "translateY(32px) rotate(-1deg)" },
          "100%": { opacity: "1", transform: "translateY(0) rotate(0deg)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%":      { opacity: "0.4", transform: "scale(0.7)" },
        },
        ticker: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
