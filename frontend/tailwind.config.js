/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#0A0A0F",
          panel: "#12121C",
          purple: "#8B5CF6",
          pink: "#EC4899",
          blue: "#06B6D4",
          cyan: "#67E8F9",
          slate: "#C7CAE3",
          glow: "#A78BFA",
        },
        status: {
          green: "#4ADE80",
          "green-bg": "rgba(74, 222, 128, 0.14)",
          yellow: "#FBBF24",
          "yellow-bg": "rgba(251, 191, 36, 0.16)",
          red: "#FB7185",
          "red-bg": "rgba(251, 113, 133, 0.16)",
        },
        surface: {
          DEFAULT: "rgba(18, 18, 28, 0.76)",
          secondary: "rgba(20, 20, 32, 0.9)",
          elevated: "rgba(28, 28, 44, 0.82)",
          light: "rgba(255, 255, 255, 0.74)",
        },
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.1)",
          muted: "rgba(255, 255, 255, 0.06)",
          strong: "rgba(255, 255, 255, 0.2)",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#C7CAE3",
          muted: "#8F96BC",
          dark: "#101427",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "DM Sans", "system-ui", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        card: "0 20px 44px rgba(1, 4, 20, 0.32)",
        "card-hover": "0 28px 64px rgba(1, 4, 20, 0.48)",
        "tab-bar": "0 -1px 0 rgba(255,255,255,0.08), 0 -18px 48px rgba(1,4,20,0.34)",
        glow: "0 0 0 1px rgba(255,255,255,0.08), 0 22px 80px rgba(9,16,38,0.48)",
        neon: "0 0 30px rgba(139, 92, 246, 0.35)",
      },
      borderRadius: {
        "2xl": "1.5rem",
        "3xl": "1.75rem",
      },
      keyframes: {
        "float-glow": {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)", opacity: "0.9" },
          "50%": { transform: "translate3d(0,-10px,0) scale(1.03)", opacity: "1" },
        },
        "card-rise": {
          from: { opacity: "0", transform: "translate3d(0, 12px, 0)" },
          to: { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
      },
      animation: {
        "float-glow": "float-glow 5s ease-in-out infinite",
        "card-rise": "card-rise 420ms cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};
