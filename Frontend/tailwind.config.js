import { defineConfig } from "tailwindcss";

export default defineConfig({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1f2937",     // fond principal
        secondary: "#111827",   // fond navbar
        accent: "#fbbf24",      // étoiles / éléments importants
        dark: "#030712",        // fond global
        light: "#f9fafb",       // texte clair
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        title: ["Bebas Neue", "sans-serif"],
      },
    },
  },
  plugins: [],
});