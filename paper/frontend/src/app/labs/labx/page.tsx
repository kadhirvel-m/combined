// Converted from ui/labs/labx.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/labs/labx/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "LabX — Explorable Explanation Generator | Paper X",
};

export default function LabsLabxPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white"}}
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
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js" />
      <link rel="stylesheet" href="/_legacy/labs/labx/style-01.css" />
      <script src="/_legacy/labs/labx/script-01.js" />
      <script src="/config.js" />
      {/* ── original <body> ── */}
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-brand-900/70 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-3.5">
          <a href="../index.html" className="flex items-center gap-3 shrink-0" aria-label="Paper X Home">
            {" "}
            <img src="../assets/img/logo-light.svg" className="h-9 w-auto dark:hidden" alt="Paper X" />
            {" "}
            <img src="../assets/img/logo-dark.svg" className="h-9 w-auto hidden dark:block" alt="Paper X" />
            {" "}
          </a>
          {" "}
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700 dark:text-white/85">
            <a href="../index.html" className="hover:text-brandlt-900 dark:hover:text-white">
              Home
            </a>
            {" "}
            <a href="../academicas.html" className="hover:text-brandlt-900 dark:hover:text-white">
              Academics
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              id="themeToggle"
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
              aria-label="Toggle theme"
            >
              <span className="material-symbols-rounded">
                dark_mode
              </span>
            </button>
          </div>
        </div>
      </header>
      <main className="lab-shell pb-16">
        {/* Hero */}
        <section className="pt-12 pb-8">
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-brandlt-100 dark:bg-brand-500/20 px-4 py-1.5 text-sm font-medium text-brand-700 dark:text-brandlt-300 mb-6">
              <span className="material-symbols-rounded text-lg">
                science
              </span>
              {" Explorable Explanations "}
            </div>
            {" "}
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-brand-900 dark:text-white mb-4">
              LabX Generator
            </h1>
            <p className="text-lg text-neutral-600 dark:text-white/70 max-w-2xl mx-auto mb-8">
              {" Transform any topic into an interactive, self-contained HTML deep-dive. Cached results return instantly! "}
            </p>
          </div>
        </section>
        {/* Input */}
        <section className="pb-8">
          <div className="container max-w-3xl mx-auto px-4">
            <div className="glass-card p-8">
              <label
                htmlFor="topicInput"
                className="block text-sm font-semibold text-brand-700 dark:text-brandlt-300 mb-3"
              >
                Enter a Topic
              </label>
              {" "}
              <input
                type="text"
                id="topicInput"
                className="topic-input mb-6"
                placeholder="e.g., Binary Search, Photosynthesis, Blockchain..."
                maxLength={500}
                aria-label="Topic to generate"
              />
              {" "}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-sm text-neutral-500 dark:text-white/50 mr-2">
                  Try:
                </span>
                {" "}
                <button className="example-chip" data-px-onclick="setTopic('Binary Search')" data-px="">
                  Binary Search
                </button>
                {" "}
                <button className="example-chip" data-px-onclick="setTopic('Osmosis')" data-px="">
                  Osmosis
                </button>
                {" "}
                <button className="example-chip" data-px-onclick="setTopic('PageRank Algorithm')" data-px="">
                  PageRank
                </button>
                {" "}
                <button className="example-chip" data-px-onclick="setTopic('Neural Networks')" data-px="">
                  Neural Networks
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <button
                  id="generateBtn"
                  className="generate-btn w-full sm:w-auto"
                  data-px-onclick="generateExplanation()"
                  data-px=""
                >
                  <span className="material-symbols-rounded">
                    auto_awesome
                  </span>
                  {" "}
                  <span id="btnText">
                    Generate Explanation
                  </span>
                  {" "}
                  <div id="btnSpinner" className="spinner hidden" />
                </button>
                {" "}
                <p id="statusText" className="status-text" />
              </div>
              {/* Cached topics */}
              <div id="cachedTopicsSection" className="cached-topics-section hidden">
                <p className="text-sm font-medium text-brand-700 dark:text-brandlt-300 mb-3">
                  <span className="material-symbols-rounded text-sm align-middle mr-1">
                    bolt
                  </span>
                  {" Instant Access (cached): "}
                </p>
                <div id="cachedTopicsList" className="flex flex-wrap gap-2" />
              </div>
            </div>
          </div>
        </section>
        {/* Results */}
        <section id="resultsSection" className="hidden pb-8">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="glass-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-brand-900 dark:text-white">
                      <span id="generatedTopic" className="text-brand-500" />
                    </h2>
                    {" "}
                    <span id="cacheBadge" className="cache-badge cached">
                      {" "}
                      <span className="material-symbols-rounded text-sm">
                        bolt
                      </span>
                      {" Cached "}
                    </span>
                  </div>
                  <div id="metaInfo" className="meta-info">
                    <span className="meta-item">
                      <span className="material-symbols-rounded text-sm">
                        timer
                      </span>
                      {" "}
                      <span id="genTime">
                        -
                      </span>
                    </span>
                    {" "}
                    <span className="meta-item">
                      <span className="material-symbols-rounded text-sm">
                        visibility
                      </span>
                      {" "}
                      <span id="viewCount">
                        -
                      </span>
                      {" views"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="action-btn" data-px-onclick="downloadHTML()" data-px="">
                    <span className="material-symbols-rounded text-lg">
                      download
                    </span>
                    {" Download "}
                  </button>
                  {" "}
                  <button className="action-btn" data-px-onclick="openInNewTab()" data-px="">
                    <span className="material-symbols-rounded text-lg">
                      open_in_new
                    </span>
                    {" Open "}
                  </button>
                  {" "}
                  <button className="action-btn" data-px-onclick="copyHTML()" data-px="">
                    <span className="material-symbols-rounded text-lg">
                      content_copy
                    </span>
                    {" Copy "}
                  </button>
                  {" "}
                  <button
                    id="regenerateBtn"
                    className="action-btn"
                    data-px-onclick="regenerateExplanation()"
                    data-px=""
                  >
                    <span className="material-symbols-rounded text-lg">
                      refresh
                    </span>
                    {" Regenerate "}
                  </button>
                  {" "}
                  <button className="action-btn" data-px-onclick="toggleRawView()" data-px="">
                    <span className="material-symbols-rounded text-lg">
                      code
                    </span>
                    {" "}
                    <span id="rawToggleText">
                      Code
                    </span>
                  </button>
                </div>
              </div>
              <div id="previewContainer" className="preview-container">
                <iframe
                  id="previewFrame"
                  sandbox="allow-scripts allow-same-origin"
                  title="Generated Explanation"
                />
              </div>
              <div id="rawContainer" className="hidden mt-4">
                <div className="html-preview" id="rawHTML" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <script src="/_legacy/labs/labx/script-02.js" />
    </LegacyPage>
  );
}
