// Converted from ui/ppt/viewer.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/ppt/viewer/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Slide Viewer — PaperX",
  description: "Preview and export your AI-generated presentation slides.",
};

export default function PptViewerPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-surface-light dark:bg-surface-dark mesh-bg overflow-hidden"}}
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="https://cdn.tailwindcss.com" />
      <script src="/config.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" />
      <script src="https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js" />
      <script src="/_legacy/ppt/viewer/script-01.js" />
      <script src="/_legacy/ppt/viewer/script-02.js" />
      <link rel="stylesheet" href="/_legacy/ppt/viewer/style-01.css" />
      {/* ── original <body> ── */}
      {/* Orbs */}
      <div className="orb w-72 h-72 bg-brand-500/15 dark:bg-brand-500/10 -top-20 right-[5%]" />
      <div className="orb w-56 h-56 bg-brand-700/10 dark:bg-brand-700/8 bottom-[10%] -left-16" />
      {/* Toast */}
      <div id="toast" className="toast glass text-brand-500 shadow-lg">
        <span id="toastText" />
      </div>
      {/* ═══ NAVBAR ═══ */}
      <header className="sticky top-0 z-40 bg-white/60 dark:bg-surface-dark/60 backdrop-blur-xl border-b border-black/[0.04] dark:border-white/[0.06] h-16">
        <div className="flex items-center justify-between h-full px-4 md:px-6">
          {/* Left */}
          <div className="flex items-center gap-3">
            <a href="index.html" className="tb-btn text-sm" data-tooltip="Back to generator">
              {" "}
              <span className="material-symbols-rounded text-lg">
                arrow_back
              </span>
              {" "}
              <span className="hidden sm:inline">
                Back
              </span>
              {" "}
            </a>
            {" "}
            <div className="w-px h-6 bg-black/[0.06] dark:bg-white/[0.08] mx-1" />
            <div className="min-w-0">
              <h1 id="viewerTitle" className="text-sm font-bold truncate max-w-[200px] md:max-w-[400px]">
                {"Presentation "}
              </h1>
              <p
                id="viewerSubtitle"
                className="text-[10px] text-neutral-400 dark:text-white/30 truncate max-w-[200px] md:max-w-[400px]"
              >
                {" Generating slides..."}
              </p>
            </div>
          </div>
          {/* Center: progress */}
          <div id="genProgress" className="hidden items-center gap-3 flex-shrink-0">
            <div className="spinner" />
            {" "}
            <span
              id="genProgressText"
              className="text-xs font-bold text-neutral-500 dark:text-white/50 hidden sm:block"
            >
              Generating...
            </span>
            {" "}
            <div className="w-24 md:w-40 h-1.5 rounded-full bg-neutral-100 dark:bg-white/[0.06] overflow-hidden">
              <div id="genProgressBar" className="progress-fill" style={{ width: "0%" }} />
            </div>
            {" "}
            <span id="genProgressCount" className="text-[10px] font-mono text-neutral-400">
              0/0
            </span>
          </div>
          {/* Right */}
          <div className="flex items-center gap-2">
            <button data-theme-toggle="" className="tb-btn" aria-label="Toggle theme">
              <span id="themeIcon" className="material-symbols-rounded text-lg">
                dark_mode
              </span>
            </button>
            {" "}
            {/* Download Button */}
            <div className="relative" id="dlBtnWrap" style={{ display: "none" }}>
              <button id="dlBtn" data-px-onclick="toggleDlMenu()" className="tb-btn tb-btn-primary" data-px="">
                <span className="material-symbols-rounded text-lg">
                  download
                </span>
                {" "}
                <span className="hidden sm:inline">
                  Export
                </span>
              </button>
              {" "}
              <div id="dlMenu" className="dl-menu glass shadow-lg dark:shadow-2xl">
                <div className="dl-item" data-px-onclick="exportZip()" data-px="">
                  <span className="material-symbols-rounded text-brand-500">
                    folder_zip
                  </span>
                  {" "}
                  <div>
                    <div className="text-sm">
                      Download as ZIP
                    </div>
                    <div className="text-[10px] text-neutral-400 dark:text-white/30 font-normal">
                      All slides as PNG images
                    </div>
                  </div>
                </div>
                <div className="dl-item" data-px-onclick="exportPdf()" data-px="">
                  <span className="material-symbols-rounded text-red-500">
                    picture_as_pdf
                  </span>
                  {" "}
                  <div>
                    <div className="text-sm">
                      Download as PDF
                    </div>
                    <div className="text-[10px] text-neutral-400 dark:text-white/30 font-normal">
                      Single PDF document
                    </div>
                  </div>
                </div>
                <div className="dl-item" data-px-onclick="exportPptx()" data-px="">
                  <span className="material-symbols-rounded text-orange-500">
                    slideshow
                  </span>
                  {" "}
                  <div>
                    <div className="text-sm">
                      Download as PPTX
                    </div>
                    <div className="text-[10px] text-neutral-400 dark:text-white/30 font-normal">
                      PowerPoint presentation
                    </div>
                  </div>
                </div>
                <div className="border-t border-black/[0.04] dark:border-white/[0.06] my-1" />
                <div className="dl-item" data-px-onclick="downloadSingleSlide()" data-px="">
                  <span className="material-symbols-rounded text-brand-400">
                    image
                  </span>
                  {" "}
                  <div>
                    <div className="text-sm">
                      Download Current Slide
                    </div>
                    <div className="text-[10px] text-neutral-400 dark:text-white/30 font-normal">
                      Save as PNG image
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* ═══ MAIN LAYOUT: Sidebar + Preview ═══ */}
      <div className="flex h-[calc(100vh-64px)] relative z-10">
        {/* ══ LEFT: Slide Sidebar ══ */}
        <aside
          id="slideSidebar"
          className="sidebar w-56 md:w-64 flex-shrink-0 border-r border-black/[0.04] dark:border-white/[0.06] p-3 space-y-2.5 bg-white/40 dark:bg-surface-dark/40 backdrop-blur-sm"
        >
          {/* Slide thumbnails will be injected here */}
        </aside>
        {/* ══ RIGHT: Main Preview ══ */}
        <div className="flex-1 preview-container">
          {/* Preview area */}
          <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-hidden">
            <div id="previewArea" className="w-full max-w-5xl">
              <div className="aspect-[16/9] rounded-2xl glass flex items-center justify-center shadow-lg">
                <div className="text-center gen-pulse">
                  <div className="spinner mx-auto mb-4" />
                  <p className="text-sm font-bold text-neutral-400 dark:text-white/30">
                    {"Preparing your slides... "}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Bottom toolbar */}
          <div
            id="bottomBar"
            className="flex-shrink-0 border-t border-black/[0.04] dark:border-white/[0.06] px-4 md:px-6 py-3 bg-white/60 dark:bg-surface-dark/60 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button data-px-onclick="prevSlide()" className="tb-btn" id="prevBtn" disabled data-px="">
                  <span className="material-symbols-rounded text-lg">
                    chevron_left
                  </span>
                </button>
                {" "}
                <span id="slideCounter" className="text-sm font-bold tabular-nums min-w-[60px] text-center">
                  0 / 0
                </span>
                {" "}
                <button data-px-onclick="nextSlide()" className="tb-btn" id="nextBtn" disabled data-px="">
                  <span className="material-symbols-rounded text-lg">
                    chevron_right
                  </span>
                </button>
              </div>
              <div className="flex items-center gap-1">
                <span
                  id="currentSlideTitle"
                  className="text-xs text-neutral-400 dark:text-white/35 font-medium truncate max-w-[200px] md:max-w-[400px]"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  data-px-onclick="toggleFullscreen()"
                  className="tb-btn"
                  data-tooltip="Fullscreen"
                  data-px=""
                >
                  <span className="material-symbols-rounded text-lg">
                    fullscreen
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <script src="/_legacy/ppt/viewer/script-03.js" />
    </LegacyPage>
  );
}
