import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0e17",
          rail: "#0a0e17",
          surface: "#141926",
          surfaceHover: "#1a2032",
          input: "#171d2c",
          card: "#141926",
        },
        border: {
          DEFAULT: "#242b3d",
          subtle: "#1b2130",
        },
        brand: {
          teal: "#2dd4bf",
          blue: "#4f6ef5",
          blueHover: "#3d5ce0",
        },
        text: {
          primary: "#f3f4f6",
          secondary: "#a3abbd",
          muted: "#6b7280",
        },
        severity: {
          red: "#ef4444",
          orange: "#f97316",
          amber: "#f59e0b",
          yellow: "#eab308",
          blue: "#38bdf8",
          purple: "#a855f7",
          pink: "#ec4899",
          gray: "#94a3b8",
        },
      },
      borderRadius: {
        lg: "10px",
        xl: "14px",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
