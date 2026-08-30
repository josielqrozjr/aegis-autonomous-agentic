import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0D1013",
        surface: "#171B1F",
        "surface-raised": "#21262B",
        "surface-border": "#2A3038",
        aegis: {
          ink: "#0D1013",
          surface: "#171B1F",
          "surface-raised": "#21262B",
          border: "#2A3038",
          bronze: "#B8843A",
          "bronze-light": "#D4A559",
          "bronze-dark": "#946727",
          slate: "#9096A0",
          "slate-light": "#B8BDC7",
          "slate-dark": "#5C636E",
          confirmed: "#3B8F6B",
          rejected: "#A24438",
          insufficient: "#7C8591",
          active: "#4C8FA6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Cinzel", "Georgia", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
