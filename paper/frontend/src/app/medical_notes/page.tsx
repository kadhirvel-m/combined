// Converted from ui/medical_notes.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/medical_notes/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "PaperX — Notes Generator (Material Style)",
};

export default function MedicalNotesPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth","data-theme":"light"}}
      body={{"class":"bg-[var(--surface-dim)] text-[var(--surface-contrast)] min-h-screen font-sans overflow-x-hidden"}}
      head={
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <script src="/_legacy/medical_notes/script-01.js" />
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="assets/js/analytics-tracker.js" defer />
      <script src="/_legacy/medical_notes/script-02.js" />
      <script src="/config.js" />
      <script src="/_legacy/medical_notes/script-03.js" />
      <script src="/auth.js" defer />
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"}
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href={"https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"}
      />
      <link rel="stylesheet" href="/_legacy/medical_notes/style-01.css" />
      <link rel="stylesheet" href="/_legacy/medical_notes/style-02.css" />
      {/* ── original <body> ── */}
      {/* Background theme (light/dark) */}
      <div aria-hidden="true" className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[var(--surface-dim)]" />
      </div>
      {/* Top App Bar (PaperX style) */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur supports-[backdrop-filter]:saturate-150 border-b border-black/5 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-16 flex items-center gap-4">
            <a href="index.html" className="flex items-center gap-2 min-w-0">
              {" "}
              <img src="assets/img/logo-light.svg" alt="Paper X" className="h-8 w-auto dark:hidden" />
              {" "}
              <img src="assets/img/logo-dark.svg" alt="Paper X" className="h-8 w-auto hidden dark:block" />
              {" "}
              <span className="sr-only">
                Paper X
              </span>
              {" "}
            </a>
            {" "}
            <div className="ml-auto flex items-center gap-2">
              <button
                id="feedbackBtn"
                className="ripple inline-flex items-center gap-2 px-3 py-2 rounded-full bg-brand-500 text-white text-sm font-semibold shadow-glow transition hover:opacity-95"
                type="button"
              >
                <span className="material-symbols-rounded text-[18px] leading-none">
                  feedback
                </span>
                {" Feedback "}
              </button>
              {" "}
              <button
                id="adminRegenBtn"
                className="ripple inline-flex items-center gap-1 px-3 py-2 rounded-full bg-brand-500 hover:opacity-90 text-white text-sm font-semibold shadow-glow transition"
                title="Force Regenerate Note (Admin Only)"
              >
                <span className="material-symbols-rounded text-[16px] leading-none">
                  refresh
                </span>
                {" Regenerate"}
              </button>
              {" "}
              <button
                id="themeBtn"
                className="ripple inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm hover:bg-brandlt-100 dark:hover:bg-white/10 transition"
                style={{ borderColor: "var(--outline)" }}
                title="Toggle theme"
              >
                <span id="themeIcon" className="material-symbols-rounded text-base">
                  dark_mode
                </span>
                {" "}
                <span id="themeText" className="hidden sm:inline">
                  Theme
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Related Videos */}
      <section id="relatedVideosSection" className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 hidden">
        <details
          id="ytDetails"
          style={{ borderColor: "var(--outline)", background: "color-mix(in oklab, var(--surface) 78%, transparent)" }}
          className={"group rounded-2xl glass border shadow-glow [&_summary::-webkit-details-marker]:hidden"}
        >
          <summary
            className="flex items-center justify-between gap-3 px-6 py-4 border-b flex-nowrap cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition"
            style={{ borderColor: "var(--outline)" }}
          >
            <div className="min-w-0 flex items-center gap-2">
              <span className="material-symbols-rounded text-[var(--muted)] group-open:rotate-90 transition-transform">
                chevron_right
              </span>
              {" "}
              <div>
                <h2 className="text-base sm:text-lg font-semibold tracking-tight">
                  Related Video
                </h2>
                <p
                  id="relatedVideosSummary"
                  className="hidden group-open:block text-xs sm:text-sm text-[var(--muted)]"
                >
                  Click to view supporting videos.
                </p>
              </div>
            </div>
            <div
              id="ytTools"
              className="flex items-center gap-3 shrink-0 transition-opacity duration-300"
              data-px-onclick="event.stopPropagation()"
              data-px=""
            >
              <select
                id="videoLanguageSelect"
                className="rounded-xl border px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium bg-transparent text-current focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft)] transition"
                style={{ borderColor: "var(--outline)" }}
                aria-label="Select video language"
              >
                <option value="English">
                  English
                </option>
                <option value="Tamil">
                  Tamil
                </option>
                <option value="Hindi">
                  Hindi
                </option>
                <option value="Telugu">
                  Telugu
                </option>
                <option value="Malayalam">
                  Malayalam
                </option>
              </select>
            </div>
          </summary>
          <div id="relatedVideosSkeleton" className="px-6 py-5">
            <div className="yt-skeleton-grid">
              <div className="yt-skeleton-card skeleton" />
              <div className="yt-skeleton-card skeleton" />
              <div className="yt-skeleton-card skeleton" />
            </div>
          </div>
          <div id="relatedVideosWrap" className="px-6 py-5 hidden">
            <div id="relatedVideoCarousel" className="yt-carousel" />
          </div>
          <div id="relatedVideosEmpty" className="px-6 pb-6 text-sm text-[var(--muted)] hidden">
            {" Videos will appear once a topic is generated. "}
          </div>
        </details>
      </section>
      {/* Main layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column (Output) */}
        <section className="lg:col-span-9 space-y-4 order-first lg:order-last">
          <div className="rounded-2xl glass border shadow-glow" style={{ borderColor: "var(--outline)" }}>
            {/* Toolbar */}
            <div
              className="px-4 sm:px-5 py-3 border-b flex items-center gap-2"
              style={{ borderColor: "var(--outline)" }}
            >
              <h3 className="text-sm font-semibold mr-auto">
                Final Output
              </h3>
              {" "}
              {/* removed MD / Mermaid / Citations chips per request */}
              {/* Variant switcher */}
              {" "}
              <div
                className="inline-flex items-center mr-2 rounded-xl border p-0.5 bg-[var(--surface)]"
                role="tablist"
                aria-label="Variant"
                style={{ borderColor: "var(--outline)" }}
              >
                <button
                  id="variantDetailed"
                  data-variant="detailed"
                  className="ripple px-3 py-1.5 rounded-lg text-xs hover:bg-[var(--brand-soft)] transition"
                >
                  Detailed
                </button>
                {" "}
                <button
                  id="variantCheatsheet"
                  data-variant="cheatsheet"
                  className="ripple px-3 py-1.5 rounded-lg text-xs hover:bg-[var(--brand-soft)] transition"
                >
                  Cheat Sheet
                </button>
              </div>
              {" "}
              {/* removed Edit & Copy MD buttons per request */}
              <button
                id="saveBtn"
                className="ripple px-3 py-2 rounded-lg bg-emerald-500/90 hover:bg-emerald-600 text-white text-sm hidden"
              >
                Save
              </button>
              {" "}
              <button
                id="myNoteBtn"
                className="ripple px-3 py-2 rounded-lg border text-sm hover:bg-[var(--brand-soft)] hidden"
                style={{ borderColor: "var(--outline)" }}
              >
                My note
              </button>
              {" "}
              <button
                id="editToggle"
                className="ripple hidden sm:inline-flex px-3 py-2 rounded-lg border text-sm hover:bg-[var(--brand-soft)]"
                style={{ borderColor: "var(--outline)" }}
              >
                Edit
              </button>
              {" "}
              <button
                id="downloadBtn"
                className="ripple hidden sm:inline-flex px-3 py-2 rounded-lg border text-sm hover:bg-[var(--brand-soft)]"
                style={{ borderColor: "var(--outline)" }}
              >
                Download
              </button>
              {" "}
              <button
                id="expandBtn"
                className="ripple hidden sm:inline-flex px-3 py-2 rounded-lg border text-sm hover:bg-[var(--brand-soft)]"
                style={{ borderColor: "var(--outline)" }}
              >
                Fullscreen
              </button>
            </div>
            {/* Output */}
            <div id="outputWrap" className="relative p-4 sm:p-6 overflow-x-auto scrollbar-thin">
              {/* Centered loader overlay inside the answer box */}
              <div
                id="outputLoader"
                className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
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
              <article id="output" className="prose prose-slate dark:prose-invert max-w-none" />
              {" "}
              <textarea
                id="editor"
                className="hidden w-full h-[60vh] mt-2 p-3 rounded-lg border font-mono text-[13px] font-semibold"
                style={{ borderColor: "var(--outline)", background: "var(--surface)", color: "var(--surface-contrast)" }}
                spellCheck="false"
              />
              {" "}
              {/* Fullscreen overlay controls */}
              <div id="fsControls" className="hidden fixed top-4 right-4 z-[60] flex items-center gap-2">
                <button
                  id="fsThemeBtn"
                  className="ripple inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm bg-[var(--surface)] hover:bg-brandlt-100 dark:hover:bg-white/10 transition shadow-lg"
                  style={{ borderColor: "var(--outline)" }}
                  title="Toggle theme"
                >
                  <span className="material-symbols-rounded text-base">
                    dark_mode
                  </span>
                  {" "}
                  <span className="hidden sm:inline">
                    Theme
                  </span>
                </button>
                {" "}
                <button
                  id="fsExitBtn"
                  className="ripple px-3 py-2 rounded-lg border text-sm bg-[var(--surface)] hover:bg-[var(--brand-soft)] shadow-lg"
                  style={{ borderColor: "var(--outline)" }}
                >
                  Exit Fullscreen
                </button>
              </div>
            </div>
          </div>
          {/* Floating AI Assistant FAB */}
        </section>
        {/* Left column (Sidebar) */}
        <aside className="space-y-4 lg:col-span-3 order-last lg:order-first">
          {/* ═══ Study Tools Toolbar ═══ */}
          <div
            className="study-tools-panel rounded-2xl glass border shadow-glow"
            style={{ borderColor: "var(--outline)" }}
          >
            <div className="study-tools-header">
              <span className="st-icon material-symbols-rounded">
                dashboard
              </span>
              {" "}
              <h3>
                Study Tools
              </h3>
            </div>
            <div className="study-tools-list">
              {/* Match the Foll */}
              <button
                className="st-btn"
                id="matchFollBtn"
                data-tool="matchfoll"
                title="Match the Following — Interactive matching quiz"
              >
                <span className="st-btn-icon st-icon-matchfoll material-symbols-rounded">
                  swap_horiz
                </span>
                {" "}
                <span className="st-btn-text">
                  {" "}
                  <span className="st-btn-label">
                    Match the Foll
                  </span>
                  {" "}
                  <span className="st-btn-desc">
                    Match the following quiz
                  </span>
                  {" "}
                </span>
                {" "}
                <span className="st-btn-arrow material-symbols-rounded">
                  arrow_forward
                </span>
              </button>
              {" "}
              {/* ClinQ (MCQ) */}
              <button className="st-btn" id="clinqBtn" data-tool="clinq" title="ClinQ — Clinical Questions">
                <span className="st-btn-icon st-icon-clinq material-symbols-rounded">
                  quiz
                </span>
                {" "}
                <span className="st-btn-text">
                  {" "}
                  <span className="st-btn-label">
                    ClinQ
                  </span>
                  {" "}
                  <span className="st-btn-desc">
                    Clinical practice questions
                  </span>
                  {" "}
                </span>
                {" "}
                <span className="st-btn-arrow material-symbols-rounded">
                  arrow_forward
                </span>
              </button>
              {" "}
              {/* CaseFlow */}
              <button className="st-btn" data-tool="caseflow" title="Clinical CaseFlow">
                <span className="st-btn-icon st-icon-caseflow material-symbols-rounded">
                  account_tree
                </span>
                {" "}
                <span className="st-btn-text">
                  {" "}
                  <span className="st-btn-label">
                    CaseFlow
                  </span>
                  {" "}
                  <span className="st-btn-desc">
                    Clinical case scenarios
                  </span>
                  {" "}
                </span>
                {" "}
                <span className="st-btn-arrow material-symbols-rounded">
                  arrow_forward
                </span>
              </button>
              {" "}
              {/* Viva Simulator */}
              <button className="st-btn" data-tool="viva" title="Viva Simulator">
                <span className="st-btn-icon st-icon-viva material-symbols-rounded">
                  record_voice_over
                </span>
                {" "}
                <span className="st-btn-text">
                  {" "}
                  <span className="st-btn-label">
                    Viva
                  </span>
                  {" "}
                  <span className="st-btn-desc">
                    Why / How / What-if cross-questioning
                  </span>
                  {" "}
                </span>
                {" "}
                <span className="st-btn-arrow material-symbols-rounded">
                  arrow_forward
                </span>
              </button>
              {" "}
              {/* Clinical Decision Trees */}
              <button className="st-btn" data-tool="decision-tree" title="Clinical Decision Trees">
                <span className="st-btn-icon st-icon-decision material-symbols-rounded">
                  schema
                </span>
                {" "}
                <span className="st-btn-text">
                  {" "}
                  <span className="st-btn-label">
                    Decision Trees
                  </span>
                  {" "}
                  <span className="st-btn-desc">
                    {"Flowcharts & emergency protocols"}
                  </span>
                  {" "}
                </span>
                {" "}
                <span className="st-btn-arrow material-symbols-rounded">
                  arrow_forward
                </span>
              </button>
              {" "}
              {/* Echo (Labx) */}
              <button className="st-btn" data-tool="echo" title="Echo — Lab Explorer">
                <span className="st-btn-icon st-icon-echo material-symbols-rounded">
                  biotech
                </span>
                {" "}
                <span className="st-btn-text">
                  {" "}
                  <span className="st-btn-label">
                    Echo
                  </span>
                  {" "}
                  <span className="st-btn-desc">
                    {"Lab values & diagnostics"}
                  </span>
                  {" "}
                </span>
                {" "}
                <span className="st-btn-arrow material-symbols-rounded">
                  arrow_forward
                </span>
              </button>
              {" "}
              {/* MedMap (PPT) */}
              <button className="st-btn" data-tool="medmap" title="MedMap — Medical Presentations">
                <span className="st-btn-icon st-icon-medmap material-symbols-rounded">
                  slideshow
                </span>
                {" "}
                <span className="st-btn-text">
                  {" "}
                  <span className="st-btn-label">
                    MedMap
                  </span>
                  {" "}
                  <span className="st-btn-desc">
                    Generate medical presentations
                  </span>
                  {" "}
                </span>
                {" "}
                <span className="st-btn-arrow material-symbols-rounded">
                  arrow_forward
                </span>
              </button>
              {" "}
              {/* Blink (visual summary image) */}
              <button className="st-btn" id="blinkBtn" data-tool="blink" title="Blink — Visual summary image">
                <span className="st-btn-icon st-icon-blink material-symbols-rounded">
                  bolt
                </span>
                {" "}
                <span className="st-btn-text">
                  {" "}
                  <span className="st-btn-label">
                    Blink
                  </span>
                  {" "}
                  <span className="st-btn-desc">
                    Visual summary image
                  </span>
                  {" "}
                </span>
                {" "}
                <span className="st-btn-arrow material-symbols-rounded">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
          {/* Related Images */}
          <section className="hidden" style={{ borderColor: "var(--outline)" }}>
            <div className="p-4 sm:p-5">
              <h3 className="text-sm font-semibold mb-3">
                Related Images
              </h3>
              <div id="images" className="grid grid-cols-3 gap-2">
                {/* skeletons */}
                <div className="h-24 rounded-lg skeleton" />
                <div className="h-24 rounded-lg skeleton" />
                <div className="h-24 rounded-lg skeleton" />
              </div>
            </div>
          </section>
        </aside>
      </main>
      {/* Snackbar */}
      <div
        id="snack"
        className="fixed left-1/2 -translate-x-1/2 bottom-4 px-4 py-2 rounded-xl shadow-glow bg-[var(--surface)] border text-sm hidden"
        style={{ borderColor: "var(--outline)" }}
      >
        Copied
      </div>
      {/* Feedback Modal (opened by Feedback button) */}
      <div
        id="feedbackModal"
        className="hidden fixed inset-0"
        style={{ zIndex: "2147483647" }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative h-full w-full flex items-center justify-center p-4">
          <div
            data-feedback-modal-panel=""
            className="w-full max-w-2xl rounded-3xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-brand-900/95 text-neutral-900 dark:text-white shadow-card backdrop-blur supports-[backdrop-filter]:backdrop-blur-xl p-6 overflow-y-auto overflow-x-hidden"
            style={{ maxHeight: "calc(100dvh - 2rem)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-rounded text-brand-500">
                    feedback
                  </span>
                  {" "}
                  <h3 className="text-lg font-semibold">
                    Feedback
                  </h3>
                </div>
                <p className="text-xs text-black/60 dark:text-white/60 mt-1">
                  {"Report anything wrong/unclear/missing in the notes. "}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  id="feedbackInboxLink"
                  href="./admin/notes_feedback.html"
                  className="px-4 py-2 rounded-2xl text-xs font-semibold ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition px-privilege-hidden"
                >
                  {" Open Inbox "}
                </a>
                {" "}
                <button
                  id="feedbackModalClose"
                  type="button"
                  aria-label="Close"
                  className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  <span className="material-symbols-rounded">
                    close
                  </span>
                </button>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] tracking-wide uppercase font-semibold text-black/60 dark:text-white/60 mb-1">
                  Category
                </label>
                {" "}
                <select
                  id="fbCategory"
                  className="w-full px-3 py-2.5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/90 dark:bg-brand-900/70 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                >
                  <option value="Wrong information">
                    Wrong information
                  </option>
                  <option value="Missing details">
                    Missing details
                  </option>
                  <option value="Needs examples">
                    Needs examples
                  </option>
                  <option value="Spelling / grammar">
                    Spelling / grammar
                  </option>
                  <option value="Formatting issue">
                    Formatting issue
                  </option>
                  <option value="Outdated">
                    Outdated
                  </option>
                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] tracking-wide uppercase font-semibold text-black/60 dark:text-white/60 mb-1">
                  {"Rating "}
                  <span className="font-normal">
                    (optional)
                  </span>
                </label>
                {" "}
                <div id="fbRating" className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    data-rating="1"
                    className="ripple px-3 py-2 rounded-2xl ring-1 ring-black/10 dark:ring-white/15 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition"
                  >
                    1
                  </button>
                  {" "}
                  <button
                    type="button"
                    data-rating="2"
                    className="ripple px-3 py-2 rounded-2xl ring-1 ring-black/10 dark:ring-white/15 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition"
                  >
                    2
                  </button>
                  {" "}
                  <button
                    type="button"
                    data-rating="3"
                    className="ripple px-3 py-2 rounded-2xl ring-1 ring-black/10 dark:ring-white/15 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition"
                  >
                    3
                  </button>
                  {" "}
                  <button
                    type="button"
                    data-rating="4"
                    className="ripple px-3 py-2 rounded-2xl ring-1 ring-black/10 dark:ring-white/15 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition"
                  >
                    4
                  </button>
                  {" "}
                  <button
                    type="button"
                    data-rating="5"
                    className="ripple px-3 py-2 rounded-2xl ring-1 ring-black/10 dark:ring-white/15 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition"
                  >
                    5
                  </button>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] tracking-wide uppercase font-semibold text-black/60 dark:text-white/60 mb-1">
                  Quick tags
                </label>
                {" "}
                <div id="fbTags" className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    data-tag="Wrong"
                    className="ripple px-4 py-2 rounded-full ring-1 ring-black/10 dark:ring-white/15 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition"
                  >
                    Wrong
                  </button>
                  {" "}
                  <button
                    type="button"
                    data-tag="Unclear"
                    className="ripple px-4 py-2 rounded-full ring-1 ring-black/10 dark:ring-white/15 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition"
                  >
                    Unclear
                  </button>
                  {" "}
                  <button
                    type="button"
                    data-tag="Too long"
                    className="ripple px-4 py-2 rounded-full ring-1 ring-black/10 dark:ring-white/15 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition"
                  >
                    Too long
                  </button>
                  {" "}
                  <button
                    type="button"
                    data-tag="Too short"
                    className="ripple px-4 py-2 rounded-full ring-1 ring-black/10 dark:ring-white/15 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition"
                  >
                    Too short
                  </button>
                  {" "}
                  <button
                    type="button"
                    data-tag="Example needed"
                    className="ripple px-4 py-2 rounded-full ring-1 ring-black/10 dark:ring-white/15 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition"
                  >
                    Example needed
                  </button>
                  {" "}
                  <button
                    type="button"
                    data-tag="Equation"
                    className="ripple px-4 py-2 rounded-full ring-1 ring-black/10 dark:ring-white/15 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition"
                  >
                    Equation
                  </button>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] tracking-wide uppercase font-semibold text-black/60 dark:text-white/60 mb-1">
                  Quick templates
                </label>
                {" "}
                <div id="fbTemplates" className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    data-template="This section seems wrong: "
                    className="ripple px-4 py-2 rounded-full ring-1 ring-black/10 dark:ring-white/15 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition"
                  >
                    Wrong section
                  </button>
                  {" "}
                  <button
                    type="button"
                    data-template="Please add an example for: "
                    className="ripple px-4 py-2 rounded-full ring-1 ring-black/10 dark:ring-white/15 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition"
                  >
                    Need example
                  </button>
                  {" "}
                  <button
                    type="button"
                    data-template="Please simplify this part: "
                    className="ripple px-4 py-2 rounded-full ring-1 ring-black/10 dark:ring-white/15 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition"
                  >
                    Too complex
                  </button>
                  {" "}
                  <button
                    type="button"
                    data-template="Spelling/grammar issue here: "
                    className="ripple px-4 py-2 rounded-full ring-1 ring-black/10 dark:ring-white/15 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition"
                  >
                    Grammar
                  </button>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] tracking-wide uppercase font-semibold text-black/60 dark:text-white/60 mb-1">
                  Your feedback
                </label>
                {" "}
                <textarea
                  id="fbMessage"
                  rows={5}
                  placeholder="Write what’s wrong / what to improve…"
                  className="w-full px-4 py-3 rounded-3xl border border-black/10 dark:border-white/10 bg-white/90 dark:bg-brand-900/70 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
                {" "}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    id="fbUseSelection"
                    type="button"
                    className="ripple inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-xs font-semibold ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
                  >
                    <span className="material-symbols-rounded text-[16px]">
                      content_copy
                    </span>
                    {" Use selected text "}
                  </button>
                  {" "}
                  <div
                    id="fbSelPreview"
                    className="text-xs text-black/60 dark:text-white/60 truncate max-w-[min(720px,90vw)]"
                  />
                </div>
              </div>
              <div className="md:col-span-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div id="fbStatus" className="text-xs text-black/60 dark:text-white/60" />
                  <div id="fbAuthHint" className="text-xs text-black/60 dark:text-white/60 hidden">
                    Sign in required to send feedback.
                  </div>
                </div>
                {" "}
                <button
                  id="fbSubmit"
                  type="button"
                  className="ripple inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700"
                >
                  <span className="material-symbols-rounded text-[18px]">
                    send
                  </span>
                  {" Send feedback "}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {" "}
      {/* Inline Gemini helper affordances */}
      <button
        id="geminiSelectionBtn"
        type="button"
        aria-label="Ask TuneAI about selection"
        className="hidden select-none text-brand-600"
        style={{ position: "absolute", zIndex: "70", border: "1px solid var(--outline)", background: "var(--surface)", borderRadius: "999px", padding: "6px", boxShadow: "0 6px 16px rgba(15,23,42,0.18)" }}
      >
        <span className="material-symbols-outlined text-base leading-none">
          auto_awesome
        </span>
      </button>
      {" "}
      <div
        id="geminiSelectionPanel"
        role="dialog"
        aria-modal="false"
        aria-hidden="true"
        className="hidden rounded-2xl glass border shadow-glow custom-scroll"
        style={{ position: "absolute", zIndex: "70", width: "420px", maxWidth: "calc(100vw-32px)", borderColor: "var(--outline)" }}
      >
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-brand-600">
              <span className="material-symbols-outlined text-base leading-none">
                auto_awesome
              </span>
              {" TuneAI Inline "}
            </div>
            {" "}
            <button
              id="geminiSelectionClose"
              type="button"
              className="text-[10px] uppercase tracking-wide text-[var(--muted)] hover:text-[var(--surface-contrast)]"
            >
              Close
            </button>
          </div>
          <div
            className="text-[11px] text-[var(--muted)] bg-[var(--chip)]/60 rounded-lg px-2 py-1 max-h-20 overflow-auto custom-scroll"
            id="geminiSelectionContext"
          />
          {" "}
          <label
            htmlFor="geminiSelectionInput"
            className="text-[11px] font-medium text-[var(--muted)] tracking-wide uppercase"
          >
            Ask anything
          </label>
          {" "}
          <textarea
            id="geminiSelectionInput"
            rows={2}
            spellCheck="false"
            className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            placeholder="Explain it simply, expand it, translate it..."
            style={{ borderColor: "var(--outline)", background: "var(--surface)", color: "var(--surface-contrast)" }}
          />
          {" "}
          <div className="flex items-center gap-2">
            <button
              id="geminiSelectionRun"
              type="button"
              className="ripple px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold uppercase tracking-wide"
            >
              Ask Tune
            </button>
            {" "}
            <button
              id="geminiSelectionMeaning"
              type="button"
              className="ripple px-3 py-2 rounded-lg border text-xs hover:bg-[var(--brand-soft)]"
              style={{ borderColor: "var(--outline)" }}
            >
              <span className="material-symbols-outlined text-xs align-middle mr-1">
                translate
              </span>
              Meaning
            </button>
            {" "}
            <button
              id="geminiSelectionEdit"
              type="button"
              className="ripple px-3 py-2 rounded-lg border text-xs hover:bg-[var(--brand-soft)]"
              style={{ borderColor: "var(--outline)" }}
            >
              <span className="material-symbols-outlined text-xs align-middle mr-1">
                edit
              </span>
              Edit
            </button>
            {" "}
            <div id="geminiSelectionStatus" className="text-[11px] text-[var(--muted)] hidden" />
          </div>
          <div
            id="geminiSelectionOutput"
            className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-h-56 overflow-auto custom-scroll"
          />
        </div>
      </div>
      {/* Inject Material Symbols for icons used in the FAB/panel */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/_legacy/medical_notes/style-03.css" />
      <script src="/_legacy/medical_notes/script-04.js" />
      <script src="/_legacy/medical_notes/script-05.js" />
      <script src="assets/js/marker_overlay.js" />
    </LegacyPage>
  );
}
