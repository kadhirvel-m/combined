import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import aspectRatio from "@tailwindcss/aspect-ratio";

/**
 * Paper X design tokens, merged from ui/tailwind.config.js (the prebuilt
 * assets/css/tailwind.css) and the per-page Tailwind CDN configs of the
 * original pages (landing page palette: ink/plum/orchid/magenta/…).
 *
 * Where the two disagreed, the prebuilt value keeps the plain name and the
 * landing-page value gets a suffixed name (e.g. `shadow-glow` vs
 * `shadow-glow-magenta`).
 */
const config: Config = {
  content: [
    "./src/app/(site)/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#FAF5FB",
          100: "#F3E7F2",
          200: "#E7D0E4",
          300: "#D9B4D3",
          400: "#C88DBA",
          500: "#9E4B8A",
          600: "#7d3c6d",
          700: "#4C2A59",
          800: "#362042",
          900: "#1E1E2F",
        },
        brandAlt: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#b3ccff",
          300: "#88adff",
          400: "#628fff",
          500: "#3f6fff",
          600: "#2f56e6",
          700: "#2846bb",
          800: "#223a95",
          900: "#1c2f78",
        },
        brandlt: {
          50: "#FAF5FB",
          100: "#F3E7F2",
          200: "#E7D0E4",
          300: "#D9B4D3",
          400: "#C88DBA",
          500: "#9E4B8A",
          700: "#4C2A59",
          900: "#1E1E2F",
        },
        ink: { DEFAULT: "#1E1E2F", 50: "#f7f7f9", 900: "#0c0f14" },
        plum: "#4C2A59",
        orchid: "#9E4B8A",
        night: { 900: "#0a0c10", 800: "#0f131a", 700: "#141a22", 600: "#1a2230" },
        indigoDark: "#1E1E2F",
        deepPurple: "#4C2A59",
        magenta: "#9E4B8A",
        paper: "#FFFFFF",
        stoneTint: "#F6F7FB",
        edge: "#E7E9F2",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(59,130,246,.2), 0 8px 40px rgba(59,130,246,.15)",
        "glow-magenta": "0 8px 30px rgba(158,75,138,0.35)",
        neon: "0 0 25px rgba(43,140,255,.35)",
        "brand-lg": "0 10px 30px rgba(63,111,255,.25)",
        soft: "0 4px 20px rgba(0,0,0,.12)",
        "soft-lg": "0 10px 30px rgba(0,0,0,0.25)",
        card: "0 6px 24px rgba(30,30,47,0.35)",
        "card-lg": "0 24px 60px rgba(30,30,47,0.35)",
        ring: "0 0 0 1px rgba(231,233,242,1)",
      },
      backgroundImage: {
        "hero-dark":
          "radial-gradient(1000px 600px at 50% -10%, rgba(158,75,138,0.28), transparent 60%), linear-gradient(180deg,#1E1E2F 0%,#201934 35%,#141321 100%)",
        // What assets/css/tailwind.css actually ships (differs from ui/tailwind.config.js).
        "hero-light":
          "radial-gradient(1000px 600px at 50% -10%, rgba(158,75,138,0.24), transparent 60%), linear-gradient(180deg,#FAF5FB 0%,#F3E7F2 45%,#E7D0E4 100%)",
        // The whiter variant from the Tailwind-CDN pages' inline config (landing page).
        "hero-light-soft":
          "radial-gradient(1000px 600px at 50% -10%, rgba(158,75,138,0.18), transparent 60%), linear-gradient(180deg, #FFFFFF 0%, #FBF8FC 45%, #F7F2F9 100%)",
      },
    },
  },
  plugins: [forms, typography, aspectRatio],
};

export default config;
