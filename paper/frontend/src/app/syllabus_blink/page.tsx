// Converted from ui/syllabus_blink.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/syllabus_blink/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata, Viewport } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Syllabus Blink - Paper X",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function SyllabusBlinkPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark"}}
      head={
        <>
          <link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link
        href={"https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&display=swap"}
        rel="stylesheet"
      />
      <script src="assets/js/analytics-tracker.js" defer />
      <script src="https://cdn.tailwindcss.com" />
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <link rel="stylesheet" href="/_legacy/syllabus_blink/style-01.css" />
      <script src="/_legacy/syllabus_blink/script-01.js" />
      <script src="/config.js" />
      {/* ── original <body> ── */}
      <main className="min-h-screen flex flex-col">
        <section className="flex-1 relative py-4 md:py-2">
          <div className="container max-w-5xl">
            <div id="status" className="mb-4 text-sm text-neutral-700 dark:text-white/70" />
            <div
              id="viewerShell"
              className="relative rounded-3xl bg-white/80 dark:bg-brand-900/70 ring-1 ring-black/5 dark:ring-white/10 shadow-card overflow-hidden flex flex-col"
            >
              <div className="absolute inset-x-10 -top-24 h-64 bg-[radial-gradient(circle_at_top,_rgba(158,75,138,0.4),_transparent_60%)] pointer-events-none opacity-60" />
              <div className="relative p-4 md:p-6 flex flex-col gap-4">
                <header
                  id="blinkHeader"
                  className="flex items-center justify-between gap-4 rounded-2xl px-3 py-2 -mx-1 bg-white/90 dark:bg-black/25 backdrop-blur ring-1 ring-black/5 dark:ring-white/10"
                >
                  <div>
                    <p
                      id="unitLabel"
                      className="text-xs font-medium text-brand-700 dark:text-brandlt-200 mb-1"
                    >
                      {" Unit"}
                    </p>
                    <h2
                      id="unitTitle"
                      className="text-lg md:text-xl font-semibold line-clamp-2 text-brand-900 dark:text-white"
                    >
                      {" -"}
                    </h2>
                    <p id="courseTitle" className="text-xs text-neutral-700 dark:text-white/70 mt-1">
                      -
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-xs">
                    <span
                      id="counterBadge"
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1 bg-brand-500/10 text-brand-700 dark:text-brandlt-200"
                    >
                      {" "}
                      <span className="material-symbols-rounded text-sm">
                        photo_library
                      </span>
                      {" "}
                      <span id="counterText">
                        0 / 0
                      </span>
                      {" "}
                    </span>
                    {" "}
                    <span
                      id="topicTitle"
                      className="text-[11px] text-neutral-800 dark:text-white/80 max-w-xs text-right truncate"
                    >
                      -
                    </span>
                  </div>
                </header>
                <div className="relative mt-2 md:mt-4 flex items-center justify-center">
                  <div className="w-full rounded-2xl bg-black/5 dark:bg-black/40 overflow-hidden flex items-center justify-center">
                    <img
                      id="topicImage"
                      alt="Topic visual"
                      className="w-full h-auto max-h-[70vh] object-contain transition duration-300 opacity-0"
                    />
                    {" "}
                    <div
                      id="noImageFallback"
                      className="text-xs text-neutral-500 dark:text-white/60 text-center px-6 hidden"
                    >
                      {" No image URL found for this topic. Use the syllabus page to attach one. "}
                    </div>
                  </div>
                </div>
                <footer className="mt-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-white/65">
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    {" "}
                    <span>
                      Use left / right arrow keys to navigate quickly.
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      id="prevBtn"
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-medium bg-black/5 dark:bg-white/5 text-neutral-800 dark:text-white/80 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-rounded text-sm">
                        chevron_left
                      </span>
                      {" Prev "}
                    </button>
                    {" "}
                    <button
                      id="nextBtn"
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-medium bg-gradient-to-r from-brand-500 to-brand-700 text-white shadow-glow hover:shadow-ringed disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {" Next "}
                      <span className="material-symbols-rounded text-sm">
                        chevron_right
                      </span>
                    </button>
                  </div>
                </footer>
              </div>
            </div>
          </div>
        </section>
      </main>
      <script src="/_legacy/syllabus_blink/script-02.js" />
      <script src="assets/js/marker_overlay.js" />
    </LegacyPage>
  );
}
