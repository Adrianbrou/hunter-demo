import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        // Industrial dark palette with Southwire blue accent
        background: "hsl(220, 13%, 9%)",
        foreground: "hsl(210, 20%, 95%)",
        panel: "hsl(220, 13%, 12%)",
        "panel-elevated": "hsl(220, 13%, 15%)",
        border: "hsl(220, 13%, 20%)",
        muted: "hsl(220, 9%, 46%)",

        // Status colors
        "status-running": "hsl(142, 71%, 45%)",
        "status-idle": "hsl(38, 92%, 50%)",
        "status-alarm": "hsl(0, 84%, 60%)",

        // Brand accent (Southwire blue)
        primary: {
          DEFAULT: "hsl(214, 60%, 30%)",
          foreground: "hsl(210, 20%, 95%)",
          light: "hsl(214, 60%, 45%)",
        },

        // UI semantic
        accent: "hsl(214, 60%, 45%)",
        destructive: "hsl(0, 84%, 60%)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in": "slide-in 0.3s ease-out",
      },
      keyframes: {
        "slide-in": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
