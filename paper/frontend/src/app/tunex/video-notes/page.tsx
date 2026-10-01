// Converted from ui/tunex/video-notes.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/tunex/video-notes/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Video Notes | Tunex",
};

export default function TunexVideoNotesPage() {
  return (
    <LegacyPage
      html={{"lang":"en"}}
      body={{"class":"min-h-screen font-sans antialiased"}}
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <script src="/config.js" />
      <link
        href={"https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"}
        rel="stylesheet"
      />
      <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"
      />
      <script src="../assets/js/theme.js" />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="/_legacy/tunex/video-notes/script-01.js" />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.css"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/theme/material-darker.min.css"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/theme/eclipse.min.css"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/hint/show-hint.min.css"
      />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/python/python.min.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/edit/closebrackets.min.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/edit/matchbrackets.min.js" />
      <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js" />
      <script src="/_legacy/tunex/video-notes/script-02.js" />
      <link rel="stylesheet" href="/_legacy/tunex/video-notes/style-01.css" />
      {/* ── original <body> ── */}
      {/* Header */}
      <header className="appbar fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <button
            data-px-onclick="history.back()"
            className="w-8 h-8 rounded-full appbar-btn flex items-center justify-center"
            title="Back"
            data-px=""
          >
            <i className="ri-arrow-left-line" />
          </button>
          {" "}
          <div className="flex items-center gap-3">
            <img src="../assets/img/tunex/tunex-logo-dark.svg" alt="Tunex" className="h-8 logo-dark" />
            {" "}
            <img src="../assets/img/tunex/tunex-logo-light.svg" alt="Tunex" className="h-8 logo-light" />
            {" "}
            <span className="font-bold tracking-tight opacity-60 text-sm border-l border-white/20 pl-3">
              {" Video Notes "}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="runAllBtn"
            className="px-4 py-2 rounded-lg appbar-btn text-sm font-bold flex items-center gap-2"
            title="Run all"
          >
            <i className="ri-play-list-2-fill" />
            <span className="hidden sm:inline">
              Run All
            </span>
          </button>
          {" "}
          <button
            id="clearBtn"
            className="px-4 py-2 rounded-lg appbar-btn text-sm font-bold flex items-center gap-2"
            title="Clear outputs"
          >
            <i className="ri-eraser-fill" />
            <span className="hidden sm:inline">
              Clear
            </span>
          </button>
          {" "}
          <button
            id="themeBtn"
            className="w-9 h-9 rounded-lg appbar-btn flex items-center justify-center"
            title="Toggle theme"
          >
            <i className="ri-moon-line dark:hidden text-lg" />
            {" "}
            <i className="ri-sun-line hidden dark:block text-lg" />
          </button>
        </div>
      </header>
      {/* Main Layout: Video Sidebar + Notebook */}
      <div className="flex h-screen pt-16">
        {/* Video Sidebar */}
        <aside
          id="videoSidebar"
          className="video-sidebar flex-shrink-0 p-4 overflow-y-auto custom-scrollbar hidden md:block"
          style={{ width: "384px", minWidth: "280px", maxWidth: "600px" }}
        >
          <div className="space-y-4">
            {/* Video Player */}
            <div className="video-container">
              <iframe id="videoEmbed" title="YouTube video player" allowFullScreen />
            </div>
            {/* Video Info */}
            <div className="video-info p-4 space-y-3">
              <h2 id="videoTitle" className="font-bold text-base line-clamp-2">
                Loading video...
              </h2>
              <div className="flex items-center gap-3">
                <img
                  id="channelLogo"
                  src="../assets/img/default-avatar.png"
                  alt="Channel"
                  className="w-10 h-10 rounded-full object-cover border border-white/10"
                />
                {" "}
                <div>
                  <p id="channelName" className="font-semibold text-sm opacity-90">
                    Channel
                  </p>
                  <p id="viewCount" className="text-xs opacity-50">
                    Views
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10">
                <a
                  id="youtubeLink"
                  href="#"
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 text-xs font-medium opacity-60 hover:opacity-100 transition"
                >
                  {" "}
                  <i className="ri-youtube-fill text-red-500" />
                  {" Watch on YouTube "}
                </a>
              </div>
            </div>
            {/* Quick Tips */}
            <div className="p-4 rounded-2xl border border-white/10 space-y-2">
              <h3 className="text-xs uppercase tracking-widest font-bold opacity-40">
                Keyboard Shortcuts
              </h3>
              <div className="space-y-1 text-xs opacity-60">
                <p>
                  <kbd className="px-1.5 py-0.5 rounded font-mono" style={{ background: "var(--surface)" }}>
                    Ctrl+Enter
                  </kbd>
                  {" Run cell"}
                </p>
                <p>
                  <kbd className="px-1.5 py-0.5 rounded font-mono" style={{ background: "var(--surface)" }}>
                    Shift+Enter
                  </kbd>
                  {" Run + Add"}
                </p>
              </div>
            </div>
          </div>
        </aside>
        {/* Resizable Divider */}
        <div id="resizer" className="resizer hidden md:block" title="Drag to resize" />
        {/* Notebook Main Content */}
        <main id="notebookMain" className="flex-1 overflow-y-auto custom-scrollbar pb-10">
          <div className="max-w-4xl mx-auto px-4 pt-8">
            {/* Cells Container */}
            <div id="cells-container" className="space-y-4" />
            {/* Add Cell Buttons */}
            <div className="flex justify-center mt-8 gap-3 flex-wrap">
              <button
                id="addCellBtn"
                className="btn-primary px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2"
              >
                <i className="ri-add-line" />
                {" Add Cell "}
              </button>
              {" "}
              <button
                id="addMarkdownBtn"
                className="btn-ghost px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2"
              >
                <i className="ri-markdown-line" />
                {" Add Markdown "}
              </button>
            </div>
          </div>
        </main>
      </div>
      {" "}
      {/* Mobile Video Toggle */}
      <button
        id="mobileVideoBtn"
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-[#9E4B8A] to-[#4C2A59] text-white shadow-lg flex items-center justify-center z-50"
        title="Show Video"
      >
        <i className="ri-video-line text-xl" />
      </button>
      {" "}
      {/* Mobile Video Modal */}
      <div
        id="mobileVideoModal"
        className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden items-center justify-center p-4"
      >
        <div className="w-full max-w-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white">
              Video
            </h3>
            {" "}
            <button
              id="closeMobileVideo"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            >
              <i className="ri-close-line text-xl text-white" />
            </button>
          </div>
          <div className="video-container rounded-2xl overflow-hidden">
            <iframe
              id="mobileVideoEmbed"
              title="YouTube video player"
              allowFullScreen
              className="w-full aspect-video"
            />
          </div>
        </div>
      </div>
      <script src="/_legacy/tunex/video-notes/script-03.js" />
    </LegacyPage>
  );
}
