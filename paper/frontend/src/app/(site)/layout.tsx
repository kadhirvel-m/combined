import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

// Glyphs Inter's latin subset lacks (e.g. "→") fall back to the system UI font,
// as they did on the original pages (Inter, ui-sans-serif, system-ui, sans-serif).
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  adjustFontFallback: false,
});

/**
 * Layout for pages rebuilt as React components. Legacy pages (src/app/<route>)
 * do not use it, so these global styles never reach them.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Icon fonts (@font-face only; the .px-icon classes live in globals.css).
          `display=block` keeps ligature names from flashing as text. */}
      {/* eslint-disable-next-line @next/next/google-font-display, @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400..600,0..1,0&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,300..700,0..1,0&display=block"
        precedence="default"
      />
      {/* next/font's generated family, exposed globally so portals get it too. */}
      <style href="px-font-inter" precedence="default">{`:root{--font-inter:${inter.style.fontFamily}}`}</style>
      <script
        type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
      />
      <Providers>{children}</Providers>
    </>
  );
}
