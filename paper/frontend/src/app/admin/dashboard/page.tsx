// Converted from ui/admin/dashboard.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/admin/dashboard/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "PaperX Admin — User Analytics",
};

export default function AdminDashboardPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"dark"}}
      body={{"class":"bg-gray-900 text-white min-h-screen font-sans selection:bg-brand-500 selection:text-white"}}
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"}
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"
        rel="stylesheet"
      />
      <script src="/config.js" defer />
      <script src="https://cdn.tailwindcss.com" />
      <script src="/_legacy/admin/dashboard/script-01.js" />
      <script src="https://cdn.jsdelivr.net/npm/chart.js" />
      {/* ── original <body> ── */}
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-brand-900/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-brand-500/20 p-2 text-brand-300">
                {" "}
                <span className="material-symbols-rounded">
                  analytics
                </span>
                {" "}
              </span>
              {" "}
              <h1 className="text-lg font-bold tracking-tight">
                PaperX Analytics
              </h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <a
                href="./notes_feedback.html"
                className="text-gray-300 hover:text-white underline underline-offset-4"
              >
                Notes Feedback
              </a>
              {" "}
              <span className="flex items-center gap-1">
                {" "}
                <span className="relative flex h-2 w-2">
                  {" "}
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  {" "}
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  {" "}
                </span>
                {" Live "}
              </span>
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Key Metrics Grid */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Core Metrics (Real-time)
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* DAU */}
            <div className="relative overflow-hidden rounded-2xl bg-white/5 p-6 shadow-lg border border-white/10">
              <dt className="truncate text-sm font-medium text-gray-400">
                Daily Active Users
              </dt>
              <dd className="mt-2 text-3xl font-bold tracking-tight text-white" id="metric-dau">
                -
              </dd>
              <div className="absolute bottom-0 right-0 p-4 opacity-10">
                <span className="material-symbols-rounded text-6xl">
                  group
                </span>
              </div>
            </div>
            {/* WAU */}
            <div className="relative overflow-hidden rounded-2xl bg-white/5 p-6 shadow-lg border border-white/10">
              <dt className="truncate text-sm font-medium text-gray-400">
                Weekly Active Users
              </dt>
              <dd className="mt-2 text-3xl font-bold tracking-tight text-white" id="metric-wau">
                -
              </dd>
            </div>
            {/* Avg Study Time */}
            <div className="relative overflow-hidden rounded-2xl bg-white/5 p-6 shadow-lg border border-white/10">
              <dt className="truncate text-sm font-medium text-gray-400">
                Avg Study Time
              </dt>
              <dd className="mt-2 text-3xl font-bold tracking-tight text-white" id="metric-time">
                {"- "}
                <span className="text-sm font-normal text-gray-500">
                  min
                </span>
              </dd>
            </div>
            {/* Sessions/User */}
            <div className="relative overflow-hidden rounded-2xl bg-white/5 p-6 shadow-lg border border-white/10">
              <dt className="truncate text-sm font-medium text-gray-400">
                Sessions / User
              </dt>
              <dd className="mt-2 text-3xl font-bold tracking-tight text-white" id="metric-sessions">
                -
              </dd>
            </div>
          </div>
        </section>
        {/* Feature Usage & Funnel */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Feature Usage Chart */}
          <section className="rounded-3xl bg-white/5 p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-6">
              Feature Usage (Event Volume)
            </h3>
            <div className="relative h-64 w-full">
              <canvas id="featureChart" />
            </div>
            {/* Custom Legend/Stats below */}
            <div className="mt-6 grid grid-cols-3 gap-4 text-center border-t border-white/10 pt-4">
              <div>
                <p className="text-xs text-brand-300">
                  NoteX Views
                </p>
                <p className="text-xl font-bold" id="stat-notex">
                  0
                </p>
              </div>
              <div>
                <p className="text-xs text-brand-300">
                  Blink Views
                </p>
                <p className="text-xl font-bold" id="stat-blink">
                  0
                </p>
              </div>
              <div>
                <p className="text-xs text-brand-300">
                  LabX Starts
                </p>
                <p className="text-xl font-bold" id="stat-labx">
                  0
                </p>
              </div>
            </div>
          </section>
          {/* Funnel/Conversion */}
          <section className="rounded-3xl bg-white/5 p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-6">
              Learning Funnel
            </h3>
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">
                    {"Topic Opened -> Note Viewed"}
                  </span>
                  {" "}
                  <span className="text-sm font-bold text-brand-300" id="funnel-1">
                    0%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-brand-500 transition-all duration-1000"
                    id="bar-funnel-1"
                    style={{ width: "0%" }}
                  />
                </div>
              </div>
              {/* Step 2 */}
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">
                    {"Note Viewed -> Lab Started"}
                  </span>
                  {" "}
                  <span className="text-sm font-bold text-brand-300" id="funnel-2">
                    0%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-brand-300 transition-all duration-1000"
                    id="bar-funnel-2"
                    style={{ width: "0%" }}
                  />
                </div>
              </div>
              {/* Learning Metrics Badges */}
              <h4 className="text-sm font-semibold text-gray-400 mt-8 mb-4">
                Learning Behavior
              </h4>
              <div className="flex flex-wrap gap-3">
                <div className="bg-gray-800 rounded-xl p-3 border border-white/5 grow">
                  <p className="text-xs text-gray-500">
                    Note Completion
                  </p>
                  <p className="text-lg font-bold text-white" id="learn-completion">
                    0%
                  </p>
                </div>
                <div className="bg-gray-800 rounded-xl p-3 border border-white/5 grow">
                  <p className="text-xs text-gray-500">
                    Blink Revisit
                  </p>
                  <p className="text-lg font-bold text-white" id="learn-revisit">
                    0%
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
        {/* User Activity Details */}
        <section className="mt-8 rounded-3xl bg-white/5 p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-6">
            User Activity (Last 7 Days)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-white/10 uppercase tracking-wider">
                  <th className="py-3 px-4">
                    User
                  </th>
                  <th className="py-3 px-4 text-center">
                    NoteX Views
                  </th>
                  <th className="py-3 px-4 text-center">
                    Blink Views
                  </th>
                  <th className="py-3 px-4 text-center">
                    LabX Starts
                  </th>
                  <th className="py-3 px-4 text-center">
                    Streak
                  </th>
                  <th className="py-3 px-4 text-center">
                    Sessions
                  </th>
                  <th className="py-3 px-4 text-right">
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody id="user-table-body" className="text-sm">
                {/* Rows injected via JS */}
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <script src="/_legacy/admin/dashboard/script-02.js" />
    </LegacyPage>
  );
}
