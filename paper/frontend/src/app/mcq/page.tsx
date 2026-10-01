// Converted from ui/mcq.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/mcq/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "PaperX — MCQ Test",
};

export default function McqPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth","data-theme":"light"}}
      head={
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="/config.js" />
      <script src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.11/dist/dotlottie-wc.js" type="module" />
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/_legacy/mcq/style-01.css" />
      {/* ── original <body> ── */}
      {/* Loading Overlay */}
      <div id="pageLoader">
        <dotlottie-wc
          src="https://lottie.host/848055f4-11c7-4032-80e0-d51319c33bca/lF6845uqpU.lottie"
          style={{ width: "300px", height: "300px" }}
          autoplay=""
          loop=""
        />
      </div>
      <header
        className="sticky top-0 z-30 bg-white/75 dark:bg-brand-900/60 backdrop-blur border-b"
        style={{ borderColor: "var(--outline)" }}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-3">
          <a href="./notes_generator.html" className="chip">
            ← Back
          </a>
          {" "}
          <div className="ml-auto flex items-center gap-2">
            <button id="themeBtn" className="chip">
              Theme
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <section className="glass rounded-2xl p-5">
          <div className="flex items-start gap-3 flex-wrap">
            <div className="grow min-w-0">
              <p id="metaLine" className="text-xs text-[var(--muted)]" />
              <h1 id="title" className="text-2xl sm:text-3xl font-semibold">
                Loading MCQ Test…
              </h1>
              <p id="subtitle" className="text-sm mt-1 text-[var(--muted)]">
                We’re building questions from your generated notes.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span id="countBadge" className="chip">
                0 Qs
              </span>
              {" "}
              <span id="modelBadge" className="chip hidden">
                Model
              </span>
              {" "}
              <span id="truncBadge" className="chip hidden">
                Trimmed notes
              </span>
            </div>
          </div>
          <div className="mt-5 progress">
            <span id="progressBar" />
          </div>
          <div id="quizBox" className="mt-6 space-y-4">
            {/* question card injected here */}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <button id="prevBtn" className="btn">
              ◀ Prev
            </button>
            {" "}
            <div className="text-sm" id="counter">
              0 / 0
            </div>
            {" "}
            <button id="nextBtn" className="btn btn-primary">
              Next ▶
            </button>
          </div>
        </section>
        <section id="resultBox" className="glass rounded-2xl p-5 mt-6 hidden">
          <h2 className="text-xl font-semibold">
            Your Results
          </h2>
          <p id="scoreLine" className="mt-1 text-sm" />
          <div className="mt-3 flex gap-2 flex-wrap">
            <button id="restartBtn" className="btn">
              Retake
            </button>
            {" "}
            <button id="shuffleBtn" className="btn">
              Shuffle
            </button>
          </div>
          <div id="reviewList" className="mt-5 space-y-4" />
        </section>
      </main>
      <div
        id="snack"
        className="fixed left-1/2 -translate-x-1/2 bottom-5 px-4 py-2 rounded-xl border text-sm hidden"
        style={{ background: "var(--surface)", borderColor: "var(--outline)" }}
      >
        Saved
      </div>
      <script src="/_legacy/mcq/script-01.js" />
    </LegacyPage>
  );
}
