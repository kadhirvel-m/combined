// Converted from ui/youtube-transcript.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/youtube-transcript/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "PaperX - YouTube Notes",
};

export default function YoutubeTranscriptPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth dark"}}
      body={{"data-theme":"dark","class":"bg-brand-900 text-white font-sans selection:bg-brand-500/20 selection:text-white"}}
      head={
        <>
          <link rel="icon" type="image/x-icon" href="../assets/img/favicon.svg" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="/_legacy/youtube-transcript/script-01.js" />
      <link rel="stylesheet" href="/_legacy/youtube-transcript/style-01.css" />
      <script src="/config.js" />
      {/* ── original <body> ── */}
      <div className="relative min-h-screen overflow-hidden bg-cosmic before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(circle_at_20%_20%,rgba(87,232,255,0.12),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(158,75,138,0.22),transparent_55%)]">
        <div className="absolute inset-x-0 top-0 -z-20 h-[320px] bg-gradient-to-b from-neon-500/20 via-transparent to-transparent blur-3xl" />
        <header className="relative">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-3 pt-10">
            <a href="index.html" className="flex items-center gap-3 text-white/90 transition hover:text-white">
              {" "}
              <span className="material-symbols-rounded text-3xl text-neon-500">
                language
              </span>
              {" "}
              <span className="text-lg font-semibold tracking-wide">
                PaperX Synth
              </span>
              {" "}
            </a>
            {" "}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-sm font-medium text-white/70">
                <a
                  href="notes_generator.html"
                  className="rounded-full border border-white/10 px-4 py-2 transition hover:border-neon-500/60 hover:text-white"
                >
                  Notes Studio
                </a>
                {" "}
                <a
                  href="youtube-transcript.html"
                  className="rounded-full bg-neon-500/15 px-4 py-2 text-neon-500 shadow-glow ring-1 ring-inset ring-neon-500/30"
                >
                  YouTube Notes
                </a>
              </div>
              {" "}
              <button
                id="themeToggle"
                type="button"
                aria-label="Toggle color mode"
                aria-pressed="true"
                className="theme-toggle flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:border-neon-500/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-neon-500/40"
              >
                <span data-icon="sun" className="material-symbols-rounded text-xl hidden">
                  light_mode
                </span>
                {" "}
                <span data-icon="moon" className="material-symbols-rounded text-xl">
                  dark_mode
                </span>
              </button>
            </div>
          </nav>
        </header>
        <main className="relative mx-auto flex min-h-[calc(100vh-120px)] max-w-4xl flex-col gap-8 px-3 pb-20 pt-12">
          <section className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              {" "}
              <span className="material-symbols-rounded text-base text-neon-500">
                bolt
              </span>
              {" Futuristic study flow "}
            </span>
            {" "}
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              {" Turn any YouTube video into "}
              <span className="gradient-text">
                structured notes
              </span>
              {". "}
            </h1>
            <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/0 p-6 shadow-card backdrop-blur-xl ring-1 ring-white/10">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-neon-500/20 blur-3xl" />
              <form id="transcriptForm" className="relative space-y-4">
                <div>
                  <label
                    htmlFor="ytUrl"
                    className="mb-2 block text-sm font-semibold uppercase tracking-widest text-white/70"
                  >
                    YouTube URL
                  </label>
                  {" "}
                  <div className="group relative">
                    <span className="material-symbols-rounded pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-neon-500/80">
                      link
                    </span>
                    {" "}
                    <input
                      id="ytUrl"
                      name="url"
                      type="url"
                      required
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-12 py-4 text-base text-white placeholder:text-white/40 transition focus:border-neon-500/60 focus:outline-none focus:ring-2 focus:ring-neon-500/40"
                    />
                  </div>
                </div>
                {" "}
                <button
                  type="submit"
                  className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-neon-500/90 px-6 py-4 text-base font-semibold text-brand-900 shadow-glow transition hover:bg-neon-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-900 focus:ring-neon-500"
                >
                  <span className="material-symbols-rounded text-xl transition group-hover:rotate-3 group-hover:scale-110">
                    play_circle
                  </span>
                  {" Generate notes "}
                </button>
                {" "}
                <p className="text-sm font-medium text-white/60">
                  {"You'll be redirected to the results page."}
                </p>
              </form>
            </div>
          </section>
        </main>
        <footer className="border-t border-white/5 bg-brand-900/80 py-8 text-center text-xs text-white/40 backdrop-blur">
          {" Crafted with the PaperX toolkit - Leveraging yt-dlp + YouTubeTranscript API "}
        </footer>
      </div>
      <script src="/_legacy/youtube-transcript/script-02.js" />
    </LegacyPage>
  );
}
