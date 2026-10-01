// Converted from ui/print/shop/payments.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/print/shop/payments/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Payments — Paper X",
};

export default function PrintShopPaymentsPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white"}}
      head={
        <>
          <link rel="icon" type="image/x-icon" href="../../assets/img/favicon.svg" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="../../assets/css/tailwind.css" />
      <link rel="stylesheet" href="/_legacy/print/shop/payments/style-01.css" />
      <link rel="stylesheet" href="/_legacy/print/shop/payments/style-02.css" />
      <script src="/_legacy/print/shop/payments/script-01.js" />
      {/* ── original <body> ── */}
      {/* Ambient gradients */}
      <div aria-hidden="true" className="ambient-wrap">
        <div className="ambient-blob b1" />
        <div className="ambient-blob b2" />
      </div>
      {/* App Bar */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-3">
          <a href="../index.html" className="flex items-center gap-3" aria-label="Paper X Print Home">
            {" "}
            <img src="../../assets/img/logo-light.svg" alt="Paper X" className="h-8 w-auto dark:hidden" />
            {" "}
            <img src="../../assets/img/logo-dark.svg" alt="Paper X" className="h-8 w-auto hidden dark:block" />
            {" "}
          </a>
          {" "}
          <nav className="hidden md:flex items-center gap-2 text-sm">
            <a
              href="dashboard.html"
              className="rounded-full px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <span className="material-symbols-rounded text-base">
                dashboard
              </span>
              {" Dashboard"}
            </a>
            {" "}
            <a href="jobs.html" className="rounded-full px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">
              <span className="material-symbols-rounded text-base">
                assignment
              </span>
              {" Jobs"}
            </a>
            {" "}
            <a
              href="payments.html"
              className="rounded-full px-3 py-2 bg-brand-500/10 text-brand-700 dark:text-brand-200 ring-1 ring-brand-500/30"
            >
              <span className="material-symbols-rounded text-base">
                payments
              </span>
              {" Payments"}
            </a>
            {" "}
            <a href="profile.html" className="rounded-full px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">
              <span className="material-symbols-rounded text-base">
                storefront
              </span>
              {" Shop Profile"}
            </a>
            {" "}
            <button
              id="themeToggle"
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
              aria-label="Toggle theme"
            >
              <span className="material-symbols-rounded">
                dark_mode
              </span>
              <span className="hidden sm:block">
                Theme
              </span>
            </button>
          </nav>
          <div className="md:hidden flex items-center gap-2">
            <a
              href="dashboard.html"
              className="inline-flex items-center justify-center size-10 rounded-full ring-soft hover:bg-black/5 dark:hover:bg-white/5"
              title="Dashboard"
            >
              <span className="material-symbols-rounded">
                dashboard
              </span>
            </a>
            {" "}
            <a
              href="jobs.html"
              className="inline-flex items-center justify-center size-10 rounded-full ring-soft hover:bg-black/5 dark:hover:bg-white/5"
              title="Jobs"
            >
              <span className="material-symbols-rounded">
                assignment
              </span>
            </a>
            {" "}
            <a
              href="payments.html"
              className="inline-flex items-center justify-center size-10 rounded-full ring-soft bg-brand-500/10 text-brand-600 dark:text-brand-200"
              title="Payments"
            >
              <span className="material-symbols-rounded">
                payments
              </span>
            </a>
            {" "}
            <a
              href="profile.html"
              className="inline-flex items-center justify-center size-10 rounded-full ring-soft hover:bg-black/5 dark:hover:bg-white/5"
              title="Profile"
            >
              <span className="material-symbols-rounded">
                storefront
              </span>
            </a>
            {" "}
            <button
              id="themeToggleSm"
              className="inline-flex items-center justify-center size-10 rounded-full ring-soft hover:bg-black/5 dark:hover:bg-white/5"
              aria-label="Toggle theme"
            >
              <span className="material-symbols-rounded">
                dark_mode
              </span>
            </button>
          </div>
        </div>
      </header>
      <main className="container max-w-6xl py-6 space-y-6">
        {/* Info bar */}
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-[12px] opacity-75">
            {"Last updated: "}
            <span id="lastUpdated">
              —
            </span>
            {" • Auto‑refresh 30s"}
          </div>
          <div id="fetchError" className="hidden text-[12px] text-rose-600">
            Couldn’t load payments. Retrying…
          </div>
        </section>
        {/* Filters */}
        <section className="glass-card rounded-2xl ring-soft p-3 md:p-4 filters-compact">
          <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
              <label className="block text-xs font-semibold opacity-70">
                {"Date "}
                <input
                  id="fltDate"
                  type="date"
                  className="mt-1 w-full rounded-xl px-3 py-1.5 ring-1 ring-black/10 dark:ring-white/15 bg-white/80 dark:bg-white/10"
                />
                {" "}
              </label>
              {" "}
              <label className="block text-xs font-semibold opacity-70">
                {"Status "}
                <select
                  id="fltStatus"
                  className="mt-1 w-full rounded-xl px-3 py-1.5 ring-1 ring-black/10 dark:ring-white/15 bg-white/80 dark:bg-white/10"
                >
                  <option value="all">
                    All
                  </option>
                  <option value="collected">
                    Collected
                  </option>
                  <option value="pending">
                    Pending
                  </option>
                </select>
                {" "}
              </label>
              {" "}
              <label className="block text-xs font-semibold opacity-70">
                {"Amount (>=) "}
                <input
                  id="fltMin"
                  type="number"
                  min="0"
                  placeholder="₹"
                  className="mt-1 w-full rounded-xl px-3 py-1.5 ring-1 ring-black/10 dark:ring-white/15 bg-white/80 dark:bg-white/10"
                />
                {" "}
              </label>
              {" "}
              <label className="block text-xs font-semibold opacity-70">
                {"Search "}
                <input
                  id="fltSearch"
                  placeholder="Search id or customer"
                  className="mt-1 w-full rounded-xl px-3 py-1.5 ring-1 ring-black/10 dark:ring-white/15 bg-white/80 dark:bg-white/10"
                />
                {" "}
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btnExport"
                className="rounded-xl px-3 py-1.5 ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-sm"
              >
                <span className="material-symbols-rounded text-base">
                  file_save
                </span>
                {" Export CSV"}
              </button>
              {" "}
              <button
                id="fltReset"
                className="rounded-xl px-3 py-1.5 ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </section>
        {/* KPIs */}
        <section className="payments-hero grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <article className="rounded-2xl p-4 glass-card ring-soft shadow-glow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="stat-icon stat-accent">
                  <span className="material-symbols-rounded">
                    payments
                  </span>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider opacity-70">
                    Collected today
                  </div>
                  <div id="kCollectedToday" className="mt-1 text-2xl font-extrabold">
                    ₹0
                  </div>
                </div>
              </div>
              <div id="kCollectedTodayDelta" className="text-[12px] opacity-70">
                —
              </div>
            </div>
          </article>
          <article className="rounded-2xl p-4 glass-card ring-soft shadow-glow kpi-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="stat-icon stat-accent-blue">
                  <span className="material-symbols-rounded">
                    calendar_month
                  </span>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider opacity-70">
                    This week
                  </div>
                  <div id="kWeek" className="mt-1 text-2xl font-extrabold">
                    ₹0
                  </div>
                </div>
              </div>
              <div id="kWeekDelta" className="text-[12px] opacity-70">
                —
              </div>
            </div>
          </article>
          <article className="rounded-2xl p-4 glass-card ring-soft shadow-glow kpi-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="stat-icon stat-accent-amber">
                  <span className="material-symbols-rounded">
                    hourglass
                  </span>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider opacity-70">
                    Pending
                  </div>
                  <div id="kPending" className="mt-1 text-2xl font-extrabold">
                    ₹0
                  </div>
                </div>
              </div>
              <div className="text-[12px] opacity-70">
                Across open jobs
              </div>
            </div>
          </article>
          <article className="rounded-2xl p-4 glass-card ring-soft shadow-glow kpi-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="stat-icon stat-accent-violet">
                  <span className="material-symbols-rounded">
                    monitoring
                  </span>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider opacity-70">
                    Avg ticket
                  </div>
                  <div id="kAOV" className="mt-1 text-2xl font-extrabold">
                    ₹0
                  </div>
                </div>
              </div>
              <div id="kAOVDelta" className="text-[12px] opacity-70">
                —
              </div>
            </div>
          </article>
        </section>
        {/* Charts */}
        <section className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl glass-card ring-soft p-4 panel-floating">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                Collected trend
              </h3>
              <div className="text-[12px] opacity-70">
                Last 14 days
              </div>
            </div>
            <div className="mt-3 h-64">
              <canvas id="chartTrend" className="w-full h-full" />
            </div>
          </div>
          <div className="rounded-2xl glass-card ring-soft p-4 panel-floating">
            <h3 className="text-sm font-semibold">
              Status
            </h3>
            <div className="mt-3 h-56">
              <canvas id="chartStatus" className="w-full h-full" />
            </div>
          </div>
        </section>
        <section className="grid lg:grid-cols-3 gap-4">
          <div className="rounded-2xl glass-card ring-soft p-4 panel-floating">
            <h3 className="text-sm font-semibold">
              Collected vs Pending
            </h3>
            <div className="mt-3 h-56">
              <canvas id="chartSplit" className="w-full h-full" />
            </div>
          </div>
          <div className="lg:col-span-2 rounded-2xl glass-card ring-soft p-4 table-card">
            <h3 className="text-sm font-semibold">
              Weekly summaries
            </h3>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-[12px] uppercase tracking-wide opacity-70">
                  <tr>
                    <th className="px-2 py-2">
                      Week
                    </th>
                    <th className="px-2 py-2">
                      Orders
                    </th>
                    <th className="px-2 py-2">
                      Collected
                    </th>
                    <th className="px-2 py-2">
                      Pending
                    </th>
                  </tr>
                </thead>
                <tbody id="weeklyTbody" className="divide-y divide-black/5 dark:divide-white/10" />
              </table>
            </div>
          </div>
        </section>
        {/* Tables */}
        <section className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-2xl glass-card ring-soft p-4 table-card">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">
                Collected
              </h3>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-[12px] uppercase tracking-wide opacity-70">
                  <tr>
                    <th className="px-2 py-2">
                      Order
                    </th>
                    <th className="px-2 py-2">
                      Customer
                    </th>
                    <th className="px-2 py-2">
                      Amount
                    </th>
                    <th className="px-2 py-2">
                      Date
                    </th>
                    <th className="px-2 py-2">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody id="collectedTbody" className="divide-y divide-black/5 dark:divide-white/10" />
              </table>
            </div>
          </div>
          <div className="rounded-2xl glass-card ring-soft p-4 table-card">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">
                Pending
              </h3>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-[12px] uppercase tracking-wide opacity-70">
                  <tr>
                    <th className="px-2 py-2">
                      Order
                    </th>
                    <th className="px-2 py-2">
                      Customer
                    </th>
                    <th className="px-2 py-2">
                      Est. Amount
                    </th>
                    <th className="px-2 py-2">
                      Status
                    </th>
                    <th className="px-2 py-2">
                      Created
                    </th>
                    <th className="px-2 py-2">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody id="pendingTbody" className="divide-y divide-black/5 dark:divide-white/10" />
              </table>
            </div>
          </div>
        </section>
        {/* Conversations (modal) */}
        <div id="convModal" className="fixed inset-0 z-50 hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" data-close="" />
          <div className="relative z-10 flex items-center justify-center min-h-full p-4">
            <div className="w-full max-w-2xl rounded-2xl ring-1 ring-black/5 dark:ring-white/10 shadow-2xl p-4 bg-white/95 dark:bg-brand-900/95">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">
                  Conversation
                </div>
                {" "}
                <button
                  className="px-2 py-1 rounded-md text-[12px] ring-1 ring-black/10 dark:ring-white/15"
                  data-close=""
                >
                  Close
                </button>
              </div>
              <div id="convContent" className="text-[13px] space-y-3 max-h-[60vh] overflow-auto" />
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t border-black/5 dark:border-white/10">
        <div className="container py-8 text-[13px] flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="opacity-80">
            {"© "}
            <span id="y" />
            {" Paper X • Payments"}
          </div>
          <div className="flex items-center gap-3">
            <a href="dashboard.html" className="hover:underline">
              Dashboard
            </a>
            {" "}
            <a href="jobs.html" className="hover:underline">
              Jobs
            </a>
            {" "}
            <a href="profile.html" className="hover:underline">
              Settings
            </a>
          </div>
        </div>
      </footer>
      {/* Libraries */}
      <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js" />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      <script src="/_legacy/print/shop/payments/script-02.js" />
    </LegacyPage>
  );
}
