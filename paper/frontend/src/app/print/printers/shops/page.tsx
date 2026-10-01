// Converted from ui/print/printers/shops.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/print/printers/shops/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Find a Print Shop — PaperX",
};

export default function PrintPrintersShopsPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(158,75,138,.18),transparent),radial-gradient(900px_500px_at_110%_10%,rgba(76,42,89,.25),transparent)] dark:bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(158,75,138,.2),transparent),radial-gradient(900px_500px_at_110%_10%,rgba(30,30,47,.7),transparent)]"}}
      head={
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <script src="https://cdn.tailwindcss.com" />
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"}
        rel="stylesheet"
      />
      <script src="/_legacy/print/printers/shops/script-01.js" />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      <link rel="stylesheet" href="/_legacy/print/printers/shops/style-01.css" />
      {/* ── original <body> ── */}
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="../index.html" className="flex items-center gap-3" aria-label="Paper X Home">
            {" "}
            <img src="../../assets/img/logo-light.svg" alt="Paper X" className="h-8 w-auto dark:hidden" />
            {" "}
            <img src="../../assets/img/logo-dark.svg" alt="Paper X" className="h-8 w-auto hidden dark:block" />
            {" "}
          </a>
          {" "}
          <nav className="hidden md:flex text-sm opacity-80 items-center gap-4">
            <a className="hover:underline" href="../matketplace/notes/notes_marketplace.html">
              Notes
            </a>
            {" "}
            <a className="hover:underline" href="../orders/index.html">
              My Prints
            </a>
          </nav>
          {" "}
          <button
            id="themeToggle"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full ring-soft hover:shadow-elev-1 transition"
          >
            <span id="themeIcon" className="material-symbols-rounded text-base">
              dark_mode
            </span>
            {" "}
            <span className="text-sm">
              Theme
            </span>
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Hero / Title row */}
        <section className="rounded-3xl surface surface-elev ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
          <div className="relative p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm">
                <a
                  href="#"
                  data-px-onclick="history.back();return false;"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full chip hover:bg-black/10 dark:hover:bg-white/10"
                  data-px=""
                >
                  {" "}
                  <span className="material-symbols-rounded text-sm">
                    arrow_back
                  </span>
                  {"Back "}
                </a>
                {" "}
                <span className="hidden sm:inline opacity-60">
                  /
                </span>
                {" "}
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
                  Find a Print Shop
                </h1>
              </div>
              <div className="hidden md:flex items-center gap-2 opacity-80 text-[12px]">
                <span className="chip">
                  <span className="material-symbols-rounded text-sm">
                    shield
                  </span>
                  Trusted partners
                </span>
                {" "}
                <span className="chip">
                  <span className="material-symbols-rounded text-sm">
                    bolt
                  </span>
                  Fast turnaround
                </span>
              </div>
            </div>
            <p className="mt-2 text-sm opacity-80 max-w-2xl">
              Search nearby print partners, filter by size, color, and binding, and configure your print in a few clicks.
            </p>
          </div>
        </section>
        {/* Layout: Filters (left) + Results (right) */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Filters panel */}
          <aside className="md:col-span-4 lg:col-span-3">
            <div className="rounded-3xl surface surface-elev ring-1 ring-black/5 dark:ring-white/10 sticky top-20">
              <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
                <h2 className="font-semibold">
                  Filters
                </h2>
                {" "}
                <span id="status" className="text-[12px] opacity-70" />
              </div>
              <form id="filters" className="p-4 grid grid-cols-1 gap-3 text-[13px]">
                {/* Search / location */}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <span className="material-symbols-rounded absolute left-2 top-1/2 -translate-y-1/2 opacity-60 text-base">
                      search
                    </span>
                    {" "}
                    <input
                      type="text"
                      id="q"
                      placeholder="Pin/Area or College name"
                      className="w-full pl-8 pr-3 py-2 rounded-md ring-soft bg-white/80 dark:bg-white/5 focus-ring"
                    />
                  </div>
                  {" "}
                  <button
                    type="button"
                    id="useLoc"
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-md ring-soft hover:shadow-elev-1"
                  >
                    <span className="material-symbols-rounded text-base">
                      my_location
                    </span>
                    <span className="hidden sm:inline">
                      Use
                    </span>
                  </button>
                </div>
                {" "}
                {/* Radius */}
                <label className="text-[12px] opacity-70">
                  Radius
                </label>
                {" "}
                <select
                  id="radius"
                  className="w-full px-3 py-2 rounded-md ring-soft bg-white/80 dark:bg-white/5 focus-ring"
                  defaultValue={"5"}
                >
                  <option value="2">
                    2 km
                  </option>
                  <option value="5">
                    5 km
                  </option>
                  <option value="10">
                    10 km
                  </option>
                  <option value="20">
                    20 km
                  </option>
                </select>
                {" "}
                {/* Size */}
                <label className="text-[12px] opacity-70 mt-2">
                  Paper Size
                </label>
                {" "}
                <select
                  id="size"
                  className="w-full px-3 py-2 rounded-md ring-soft bg-white/80 dark:bg-white/5 focus-ring"
                >
                  <option value="">
                    Any size
                  </option>
                  <option>
                    A4
                  </option>
                  <option>
                    A3
                  </option>
                  <option>
                    Letter
                  </option>
                </select>
                {" "}
                {/* Binding */}
                <label className="text-[12px] opacity-70 mt-2">
                  Binding
                </label>
                {" "}
                <select
                  id="binding"
                  className="w-full px-3 py-2 rounded-md ring-soft bg-white/80 dark:bg-white/5 focus-ring"
                >
                  <option value="">
                    Any
                  </option>
                  <option>
                    staple
                  </option>
                  <option>
                    spiral
                  </option>
                </select>
                {" "}
                {/* Toggles */}
                <div className="flex flex-col gap-2 pt-1">
                  <label className="inline-flex items-center gap-2">
                    {" "}
                    <input type="checkbox" id="open_now" />
                    {" Open now "}
                  </label>
                  {" "}
                  <label className="inline-flex items-center gap-2">
                    {" "}
                    <input type="checkbox" id="color" />
                    {" Color "}
                  </label>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-brand-500 text-white hover:bg-brand-700 shadow-elev-1"
                  >
                    <span className="material-symbols-rounded text-base">
                      tune
                    </span>
                    {"Apply "}
                  </button>
                  {" "}
                  <button
                    type="button"
                    id="clearFilters"
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-md ring-soft hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <span className="material-symbols-rounded text-base">
                      close
                    </span>
                    {"Clear "}
                  </button>
                </div>
                {/* Active filter chips */}
                <div id="chips" className="hidden flex-wrap gap-2 pt-2" />
              </form>
            </div>
          </aside>
          {/* Results area */}
          <section id="resultsWrap" className="md:col-span-8 lg:col-span-9 space-y-4">
            {/* Results toolbar */}
            <div className="rounded-2xl surface ring-1 ring-black/5 dark:ring-white/10 p-3 flex flex-wrap items-center gap-3 justify-between">
              <div className="flex items-center gap-2 text-[12px] opacity-80">
                <span className="chip">
                  <span className="material-symbols-rounded text-sm">
                    map
                  </span>
                  Nearby
                </span>
                {" "}
                <span className="chip">
                  <span className="material-symbols-rounded text-sm">
                    layers
                  </span>
                  All partners
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-[12px] opacity-70">
                  Sort
                </label>
                {" "}
                <select
                  id="sort"
                  title="Sort"
                  className="px-3 py-2 rounded-md ring-soft bg-white/80 dark:bg-white/5 focus-ring"
                >
                  <option value="">
                    Default
                  </option>
                  <option value="distance">
                    Nearest
                  </option>
                  <option value="price">
                    Lowest Price
                  </option>
                  <option value="rating">
                    Top Rated
                  </option>
                </select>
              </div>
            </div>
            {/* Results grid */}
            <div id="skeletonGrid" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Skeleton cards */}
              <div className="rounded-3xl surface ring-1 ring-black/5 dark:ring-white/10 p-5 animate-pulse h-36" />
              <div className="rounded-3xl surface ring-1 ring-black/5 dark:ring-white/10 p-5 animate-pulse h-36" />
              <div className="rounded-3xl surface ring-1 ring-black/5 dark:ring-white/10 p-5 animate-pulse h-36" />
            </div>
            <div id="shopList" className="hidden grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" />
            <div id="emptyState" className="hidden">
              <div className="rounded-3xl p-10 text-center surface ring-1 ring-black/5 dark:ring-white/10">
                <div className="mx-auto w-12 h-12 rounded-full bg-white/60 dark:bg-white/10 grid place-items-center mb-3">
                  <span className="material-symbols-rounded">
                    travel_explore
                  </span>
                </div>
                <h3 className="font-semibold">
                  No shops matched your filters
                </h3>
                <p className="text-sm opacity-75">
                  Try expanding the radius or clearing a filter.
                </p>
              </div>
            </div>
          </section>
        </section>
      </main>
      {/* Toast */}
      <div id="toast" className="fixed bottom-4 left-1/2 -translate-x-1/2 hidden">
        <div className="px-4 py-2 rounded-xl bg-brand-500 text-white shadow-elev-2">
          <span id="toastMsg" className="text-sm" />
        </div>
      </div>
      <script src="/_legacy/print/printers/shops/script-02.js" />
    </LegacyPage>
  );
}
