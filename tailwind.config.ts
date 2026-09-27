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
        craft: {
          50: "#FAF7F2",   // Warm Ivory
          100: "#F4ECE1",  // Cream Sand
          200: "#E8DAC6",  // Soft Beige
          300: "#D6BF9F",  // Muted Straw
          400: "#BC996E",  // Warm Oak
          500: "#9E7848",  // Artisan Bronze
          600: "#835E35",  // Deep Ochre
          700: "#694726",  // Terracotta Bark
          800: "#4E3219",  // Deep Walnut
          900: "#2A180B",  // Charcoal Espresso
          950: "#180C05",
        },
        gold: {
          DEFAULT: "#C5A059",
          light: "#E2C889",
          dark: "#A38038",
        },
        cream: "#FAF8F5",
        sand: "#F0E9DF",
        charcoal: "#1F1D1B",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(42, 24, 11, 0.05)",
        card: "0 10px 30px -4px rgba(42, 24, 11, 0.08)",
        floating: "0 20px 40px -8px rgba(42, 24, 11, 0.12)",
        glow: "0 0 25px rgba(197, 160, 89, 0.25)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
