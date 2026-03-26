/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#07111F",
          navy: "#10233B",
          teal: "#0F766E",
          cyan: "#06B6D4",
          sky: "#D9F2FF",
          mint: "#DDF8EA",
          sand: "#FFF0D6",
          peach: "#FFD9C2",
          tide: "#155E75",
          glow: "#F97316",
        },
        status: {
          green: "#16A34A",
          "green-bg": "#DCFCE7",
          "green-soft": "#ECFDF3",
          yellow: "#D97706",
          "yellow-bg": "#FEF3C7",
          "yellow-soft": "#FFF8E7",
          red: "#DC2626",
          "red-bg": "#FEE2E2",
          "red-soft": "#FFF1F2",
        },
        surface: "#FFFFFF",
        "surface-secondary": "#F5F7FB",
        "surface-elevated": "#FBFDFF",
        border: "#D7E1EA",
        "text-primary": "#0F172A",
        "text-secondary": "#475569",
        "text-muted": "#64748B",
      },
      fontFamily: {
        sans: ["Segoe UI", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        card: "0 20px 50px rgba(15, 23, 42, 0.12)",
        "card-hover": "0 24px 60px rgba(15, 23, 42, 0.18)",
        "tab-bar": "0 -1px 0 rgba(0,0,0,0.06), 0 -4px 16px rgba(0,0,0,0.06)",
        glow: "0 0 0 1px rgba(255,255,255,0.55), 0 18px 40px rgba(8,47,73,0.16)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
