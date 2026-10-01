// Converted from ui/learning/faculty.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/learning/faculty/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "PaperX Learning Tracks — Faculty Brief",
};

export default function LearningFacultyPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"bg-surface text-brand-900"}}
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"}
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"
        rel="stylesheet"
      />
      <script src="/_legacy/learning/faculty/script-01.js" />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="/config.js" defer />
      <script src="tracks.js" defer />
      {/* ── original <body> ── */}
      <header className="border-b border-brand-900/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <a
              href="dashboard.html"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-900"
            >
              {" "}
              <span className="material-symbols-rounded text-base">
                arrow_back
              </span>
              {" Back to dashboard "}
            </a>
            {" "}
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-brand-900">
              {"Faculty & Mentor Console"}
            </h1>
            <p className="text-sm text-brand-900/60">
              Monitor learner progress and plan interventions quickly.
            </p>
          </div>
          <div
            id="planMeta"
            className="flex flex-col items-end text-xs uppercase tracking-wider text-brand-900/50"
          />
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)]">
        <section className="space-y-6">
          <article className="rounded-3xl bg-white p-6 shadow-lg shadow-brand-900/10">
            <h2 className="text-lg font-semibold text-brand-900">
              Plan snapshot
            </h2>
            <div id="planSnapshot" className="mt-4 space-y-3 text-sm text-brand-900/70" />
          </article>
          <article className="rounded-3xl bg-white p-6 shadow-lg shadow-brand-900/10">
            <h2 className="text-lg font-semibold text-brand-900">
              AI faculty brief
            </h2>
            <div id="briefOverview" className="mt-3 text-sm text-brand-900/70">
              Generating tailored briefing…
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-brand-900">
                  Action items
                </h3>
                <ul id="briefActions" className="mt-2 space-y-2 text-sm text-brand-900/70" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-brand-900">
                  Support requests
                </h3>
                <ul id="briefSupport" className="mt-2 space-y-2 text-sm text-brand-900/70" />
              </div>
            </div>
          </article>
        </section>
        <aside className="space-y-6">
          <article className="rounded-3xl border border-brand-900/10 bg-white p-6 shadow-lg shadow-brand-900/10">
            <h2 className="text-lg font-semibold text-brand-900">
              At-risk learners
            </h2>
            <ul id="briefRisk" className="mt-4 space-y-3 text-sm text-rose-600" />
          </article>
          <article className="rounded-3xl border border-brand-900/10 bg-white p-6 shadow-lg shadow-brand-900/10">
            <h2 className="text-lg font-semibold text-brand-900">
              Upcoming milestones
            </h2>
            <ul id="briefMilestones" className="mt-4 space-y-3 text-sm text-brand-900/70" />
          </article>
        </aside>
      </main>
      <script src="/_legacy/learning/faculty/script-02.js" />
    </LegacyPage>
  );
}
