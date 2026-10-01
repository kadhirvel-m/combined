// Converted from ui/youtube-notes.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/youtube-notes/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "PaperX ? YouTube Notes",
};

export default function YoutubeNotesPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"data-theme":"dark","class":"text-slate-900 dark:text-slate-100"}}
      head={
        <>
          <link rel="icon" type="image/x-icon" href="assets/img/favicon.svg" />
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
      <script src="/config.js" />
      <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js" />
      <script src="https://cdn.jsdelivr.net/npm/dompurify@3.1.7/dist/purify.min.js" />
      <script src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.5/dist/dotlottie-wc.js" type="module" />
      <link rel="stylesheet" href="/_legacy/youtube-notes/style-01.css" />
      {/* ── original <body> ── */}
      <header className="fixed inset-x-0 top-0 z-40 bg-white/95 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm dark:shadow-slate-900/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="index.html" className="flex items-center gap-3" aria-label="Paper X Home">
            {" "}
            <img src="assets/img/logo-light.svg" alt="Paper X" className="h-10 w-auto dark:hidden" />
            {" "}
            <img src="assets/img/logo-dark.svg" alt="Paper X" className="h-10 w-auto hidden dark:block" />
            {" "}
          </a>
          {" "}
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-200 lg:flex">
            <a href="index.html" className="transition hover:text-slate-900 dark:hover:text-white">
              Home
            </a>
            {" "}
            <a href="about.html" className="transition hover:text-slate-900 dark:hover:text-white">
              About
            </a>
            {" "}
            <a href="contact.html" className="transition hover:text-slate-900 dark:hover:text-white">
              Contact
            </a>
            {" "}
            <a href="help.html" className="transition hover:text-slate-900 dark:hover:text-white">
              Help
            </a>
            {" "}
            <a href="index.html#pricing" className="transition hover:text-slate-900 dark:hover:text-white">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              data-theme-toggle=""
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
            >
              <span className="material-symbols-rounded text-base">
                dark_mode
              </span>
              {" "}
              <span className="hidden sm:block">
                Theme
              </span>
            </button>
            {" "}
            <a
              href="login.html"
              className="hidden rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-200 dark:hover:text-white md:inline-flex"
            >
              Log in
            </a>
            {" "}
            <a
              href="signup.html"
              className="hidden rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:shadow-purple-500/50 md:inline-flex"
            >
              Sign up
            </a>
          </div>
        </div>
      </header>
      <main className="relative mx-auto max-w-7xl px-5 pt-36 sm:pt-40 lg:pt-44 pb-16">
        <div className="notes-grid mt-6 lg:mt-10">
          <aside className="notes-sidebar space-y-5">
            <div className="surface overflow-hidden">
              <div className="aspect-video bg-black">
                <iframe id="videoEmbed" title="YouTube video player" className="h-full w-full" allowFullScreen />
              </div>
            </div>
            <div className="surface p-6 space-y-5">
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-lg font-semibold text-slate-900 shadow-inner dark:bg-slate-900 dark:text-slate-100">
                  {" "}
                  <img
                    id="channelAvatar"
                    alt="Channel avatar"
                    referrerPolicy="no-referrer"
                    className="hidden h-full w-full rounded-2xl object-cover ring-1 ring-white/80 dark:ring-slate-800"
                    loading="lazy"
                  />
                  {" "}
                  <span id="channelAvatarFallback" className="text-base font-semibold">
                    P
                  </span>
                  {" "}
                </span>
                {" "}
                <div className="space-y-1">
                  <p id="channelName" className="text-base font-semibold">
                    N/A
                  </p>
                  <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
                    <span className="material-symbols-rounded text-base opacity-70">
                      calendar_today
                    </span>
                    {" "}
                    <span id="uploadDate">
                      N/A
                    </span>
                  </p>
                  <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
                    <span className="material-symbols-rounded text-base opacity-70">
                      visibility
                    </span>
                    {" "}
                    <span id="viewCount">
                      N/A
                    </span>
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                    {" Source"}
                  </p>
                  {" "}
                  <a
                    id="openOnYoutube"
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200/70 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-400 dark:hover:text-white"
                  >
                    {" "}
                    <span className="material-symbols-rounded text-base">
                      open_in_new
                    </span>
                    {" Watch on YouTube "}
                  </a>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="pill">
                    {" "}
                    <span className="material-symbols-rounded text-base opacity-60">
                      robot
                    </span>
                    {" TuneAI summary "}
                  </span>
                  {" "}
                  <span className="pill">
                    {" "}
                    <span className="material-symbols-rounded text-base opacity-60">
                      subtitles
                    </span>
                    {" Smart transcript "}
                  </span>
                </div>
              </div>
            </div>
          </aside>
          <section className="surface p-6 lg:p-8 space-y-6">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
                  Structured Notes
                </h1>
                <p
                  id="notesStatus"
                  className="text-sm font-medium text-slate-500 dark:text-slate-300"
                  role="status"
                >
                  Preparing workspace...
                </p>
              </div>
              {" "}
              <button
                id="notesCopyBtn"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-400 dark:hover:text-white"
              >
                <span className="material-symbols-rounded text-base">
                  content_copy
                </span>
                {" Copy notes "}
              </button>
            </header>
            <div
              id="notesScroll"
              className="notes-scroll relative space-y-4 text-base leading-relaxed text-slate-700 dark:text-slate-100"
            >
              <div
                id="notesLoader"
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ display: "none" }}
              >
                <div className="px-loader-box">
                  <dotlottie-wc
                    src="https://lottie.host/848055f4-11c7-4032-80e0-d51319c33bca/lF6845uqpU.lottie"
                    autoplay=""
                    loop=""
                  />
                </div>
              </div>
              <div
                id="notesRendered"
                className="prose max-w-none prose-headings:mt-6 prose-headings:font-semibold prose-p:mb-4 prose-ul:mb-5 prose-li:marker:text-slate-400 dark:prose-invert"
              />
            </div>
          </section>
        </div>
      </main>
      <footer className="px-5 pb-10 text-center text-sm text-slate-400 dark:text-slate-500">
        {" Crafted with PaperX ? yt-dlp ? YouTube Transcript API ? TuneAI "}
      </footer>
      <script src="/_legacy/youtube-notes/script-01.js" />
      <script src="/auth.js" />
    </LegacyPage>
  );
}
