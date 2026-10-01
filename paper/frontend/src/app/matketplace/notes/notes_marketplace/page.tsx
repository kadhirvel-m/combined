// Converted from ui/matketplace/notes/notes_marketplace.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/matketplace/notes/notes_marketplace/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Paper X — Notes Marketplace",
};

export default function MatketplaceNotesNotesMarketplacePage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark"}}
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="../../assets/css/tailwind.css" />
      <link rel="stylesheet" href="/_legacy/matketplace/notes/notes_marketplace/style-01.css" />
      <script src="/_legacy/matketplace/notes/notes_marketplace/script-01.js" />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      {/* ── original <body> ── */}
      {/* HEADER (unchanged structure/styles) */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-3">
          <a href="../../index.html" className="flex items-center gap-3" aria-label="Paper X Home">
            {" "}
            <img src="../../assets/img/logo-light.svg" alt="Paper X" className="h-9 w-auto dark:hidden" />
            {" "}
            <img src="../../assets/img/logo-dark.svg" alt="Paper X" className="h-9 w-auto hidden dark:block" />
            {" "}
          </a>
          {" "}
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700 dark:text-white/85">
            <a
              className="hover:text-brandlt-900 dark:hover:text-white font-medium"
              href="./notes_marketplace.html"
            >
              Marketplace
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="./upload_note.html">
              Upload
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="../../collage/clg_info.html">
              Colleges
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="../../help.html">
              Help
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="../../staff_profile.html">
              Profile
            </a>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <button
              data-theme-toggle=""
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span className="material-symbols-rounded text-base">
                dark_mode
              </span>
            </button>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <button
              data-theme-toggle=""
              className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span className="material-symbols-rounded">
                dark_mode
              </span>
            </button>
            {" "}
            <button
              id="openFilters"
              className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
              aria-label="Open filters"
            >
              <span className="material-symbols-rounded">
                tune
              </span>
            </button>
          </div>
        </div>
      </header>
      {/* HERO / SEARCH + STATS BAR */}
      <section className="border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-brand-900/50 backdrop-blur">
        <div className="container py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mx-auto max-w-5xl leading-[1.08] gradient-hero-text">
                {" Notes Marketplace"}
              </h1>
              <p className="text-sm text-neutral-600 dark:text-white/60 mt-1">
                Discover peer‑reviewed notes, past papers, and quick revision packs.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-white/60">
              <span
                id="statCount"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full ring-1 ring-black/10 dark:ring-white/15 bg-white/70 dark:bg-white/5"
              >
                0 items
              </span>
              {" "}
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full ring-1 ring-black/10 dark:ring-white/15 bg-white/70 dark:bg-white/5">
                <span className="material-symbols-rounded text-sm">
                  verified
                </span>
                {" Peer rated"}
              </span>
            </div>
          </div>
          <div className="mt-5">
            {/* All filters in one row */}
            <div id="inlineFilters" className="flex flex-col md:flex-row gap-2 items-center flex-wrap">
              <div className="flex-1 md:flex-none md:w-64 relative">
                <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  search
                </span>
                {" "}
                <input
                  id="q"
                  placeholder="Search by title, keywords…"
                  className="w-full rounded-xl pl-11 pr-4 py-3 text-sm ring-1 ring-black/10 dark:ring-white/15 bg-white/90 dark:bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              {" "}
              <select
                id="collegeFilter"
                className="w-32 rounded-lg border px-3 py-2 text-sm bg-white/90 dark:bg-brand-900/40"
              >
                <option value="">
                  College
                </option>
              </select>
              {" "}
              <select
                id="degreeFilter"
                disabled
                className="w-32 rounded-lg border px-3 py-2 text-sm bg-white/90 dark:bg-brand-900/40"
              >
                <option value="">
                  Degree
                </option>
              </select>
              {" "}
              <select
                id="deptFilter"
                disabled
                className="w-32 rounded-lg border px-3 py-2 text-sm bg-white/90 dark:bg-brand-900/40"
              >
                <option value="">
                  Department
                </option>
              </select>
              {" "}
              <select
                id="batchFilter"
                disabled
                className="w-28 rounded-lg border px-3 py-2 text-sm bg-white/90 dark:bg-brand-900/40"
              >
                <option value="">
                  Batch
                </option>
              </select>
              {" "}
              <select
                id="semFilter"
                disabled
                className="w-24 rounded-lg border px-3 py-2 text-sm bg-white/90 dark:bg-brand-900/40"
              >
                <option value="">
                  Semester
                </option>
              </select>
              {" "}
              <input
                id="minPrice"
                type="number"
                min="0"
                placeholder="Min ₹"
                className="w-20 rounded-lg border px-2 py-2 text-sm bg-white/90 dark:bg-brand-900/40"
              />
              {" "}
              <input
                id="maxPrice"
                type="number"
                min="0"
                placeholder="Max ₹"
                className="w-20 rounded-lg border px-2 py-2 text-sm bg-white/90 dark:bg-brand-900/40"
              />
              {" "}
              <button
                id="applyFilters"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] shadow-[0_10px_30px_rgba(158,75,138,0.28)] hover:shadow-[0_16px_36px_rgba(158,75,138,0.35)] transition min-w-[90px]"
              >
                <span className="material-symbols-rounded text-base">
                  filter_alt
                </span>
                {"Apply "}
              </button>
              {" "}
              <button
                id="clearAll"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] shadow-[0_10px_30px_rgba(158,75,138,0.28)] hover:shadow-[0_16px_36px_rgba(158,75,138,0.35)] transition min-w-[90px]"
              >
                <span className="material-symbols-rounded text-base">
                  clear
                </span>
                Clear
              </button>
              {" "}
              <a
                href="./upload_note.html"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] shadow-[0_10px_30px_rgba(158,75,138,0.28)] hover:shadow-[0_16px_36px_rgba(158,75,138,0.35)] transition min-w-[90px] md:ml-auto"
              >
                <span className="material-symbols-rounded text-base">
                  upload
                </span>
                Upload
              </a>
            </div>
          </div>
        </div>
      </section>
      <main className="container py-8 space-y-6">
        {/* filters moved inline beside search */}
        {/* Controls row: view + sort */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="hidden md:flex items-center gap-2" role="tablist" aria-label="Scopes">
            <button
              data-scope=""
              value="all"
              className="scope-btn px-3 py-1.5 text-xs font-medium rounded-full bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15"
            >
              All
            </button>
            {" "}
            <button
              data-scope=""
              value="free"
              className="scope-btn px-3 py-1.5 text-xs font-medium rounded-full ring-1 ring-black/10 dark:ring-white/15"
            >
              Free
            </button>
            {" "}
            <button
              data-scope=""
              value="top"
              className="scope-btn px-3 py-1.5 text-xs font-medium rounded-full ring-1 ring-black/10 dark:ring-white/15"
            >
              Top rated
            </button>
            {" "}
            <button
              data-scope=""
              value="new"
              className="scope-btn px-3 py-1.5 text-xs font-medium rounded-full ring-1 ring-black/10 dark:ring-white/15"
            >
              New
            </button>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div
              className="hidden sm:flex items-center gap-1 rounded-lg ring-1 ring-black/10 dark:ring-white/15 p-1 bg-white/70 dark:bg-white/10"
              role="tablist"
              aria-label="View"
            >
              <button
                id="viewGrid"
                className="px-2.5 py-1.5 rounded-md bg-brand-500/10 text-brand-700 dark:text-fuchsia-200"
                title="Grid view"
              >
                <span className="material-symbols-rounded text-base">
                  grid_view
                </span>
              </button>
              {" "}
              <button id="viewList" className="px-2.5 py-1.5 rounded-md" title="List view">
                <span className="material-symbols-rounded text-base">
                  view_agenda
                </span>
              </button>
            </div>
            {" "}
            <label className="flex items-center gap-2 text-xs text-neutral-600 dark:text-white/70">
              {" "}
              <span className="hidden sm:inline">
                Sort
              </span>
              {" "}
              <select
                id="sortBy"
                className="text-sm rounded-lg ring-1 ring-black/10 dark:ring-white/15 bg-white/70 dark:bg-white/10 py-2 px-3"
              >
                <option value="relevance">
                  Relevance
                </option>
                <option value="newest">
                  Newest
                </option>
                <option value="rating">
                  Rating
                </option>
                <option value="price_low">
                  Price: Low → High
                </option>
                <option value="price_high">
                  Price: High → Low
                </option>
              </select>
              {" "}
            </label>
          </div>
        </div>
        <section className="space-y-6">
          {/* RESULTS */}
          <div className="space-y-4">
            <div
              id="alertBar"
              className="hidden text-xs rounded-lg p-3 ring-1 ring-black/10 dark:ring-white/15 bg-white/70 dark:bg-white/10"
            />
            <div
              id="notesGrid"
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
              role="list"
            />
            <div
              id="notesList"
              className="hidden divide-y divide-black/5 dark:divide-white/10 rounded-xl ring-1 ring-black/10 dark:ring-white/15 bg-white/70 dark:bg-white/5"
            />
            <div
              id="emptyState"
              className="hidden text-sm text-neutral-500 dark:text-white/60 py-16 text-center"
            >
              <div className="mx-auto w-20 h-20 rounded-2xl bg-white/70 dark:bg-white/10 flex items-center justify-center ring-1 ring-black/10 dark:ring-white/15 mb-4">
                <span className="material-symbols-rounded">
                  hourglass_empty
                </span>
              </div>
              {" No notes match your filters. "}
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 pt-2" id="pager" hidden>
              <button
                id="prevPage"
                className="px-3 py-1.5 text-sm rounded-md ring-1 ring-black/10 dark:ring-white/15"
              >
                Prev
              </button>
              {" "}
              <span id="pageInfo" className="text-xs text-neutral-600 dark:text-white/60">
                Page 1
              </span>
              {" "}
              <button
                id="nextPage"
                className="px-3 py-1.5 text-sm rounded-md ring-1 ring-black/10 dark:ring-white/15"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>
      {/* MOBILE FILTER DRAWER */}
      <div id="filterDrawer" className="fixed inset-0 z-50 hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-black/40" id="closeFilters" />
        <div className="absolute right-0 top-0 bottom-0 w-full max-w-md glass shadow-card ring-1 ring-black/10 dark:ring-white/15 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">
              Filters
            </h3>
            {" "}
            <button
              id="closeFiltersBtn"
              className="size-10 grid place-items-center rounded-full ring-1 ring-black/10 dark:ring-white/15"
            >
              <span className="material-symbols-rounded">
                close
              </span>
            </button>
          </div>
          <div id="drawerFilters" className="space-y-5" />
          <div className="mt-6 flex gap-2">
            <button
              id="drawerClear"
              className="flex-1 px-4 py-2 rounded-lg ring-1 ring-black/10 dark:ring-white/15"
            >
              Clear
            </button>
            {" "}
            <button id="drawerApply" className="flex-1 px-4 py-2 rounded-lg bg-brand-500 text-white">
              Apply
            </button>
          </div>
        </div>
      </div>
      {/* TEMPLATES */}
      <template
        id="noteCardTpl"
        dangerouslySetInnerHTML={{ __html: "\n        <article class=\"note-card group rounded-2xl border border-black/5 dark:border-white/10 shadow-card bg-white/80 dark:bg-[#1f1f2d]/70 backdrop-blur flex flex-col hover:shadow-lg transition\" role=\"listitem\">\n            <div class=\"relative rounded-t-2xl overflow-hidden h-2\"></div>\n            <div class=\"p-4 flex flex-col gap-3 flex-1\">\n                <div class=\"flex items-start gap-2\">\n                    <h3 class=\"font-semibold text-sm leading-5 line-clamp-2 title text-neutral-900 dark:text-neutral-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors\">\n                    </h3>\n                    <span class=\"ml-auto priceChip\"></span>\n                    <a class=\"detailsIconLink inline-flex items-center justify-center size-7 rounded-md ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10 transition\" href=\"#\" title=\"Open details\" aria-label=\"Open note details\">\n                        <span class=\"material-symbols-rounded text-[18px] leading-none\">open_in_new</span>\n                    </a>\n                </div>\n                <p class=\"text-xs text-gray-600 dark:text-gray-300 line-clamp-3 desc\"></p>\n                <div class=\"flex flex-wrap gap-1 text-[10px] meta\"></div>\n                <div class=\"flex flex-wrap gap-1 academicChips\"></div>\n                <div class=\"mt-auto pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between\">\n                    <div class=\"seller hidden flex items-center gap-2\">\n                        <span class=\"relative inline-flex items-center justify-center\">\n                            <img data-avatar=\"\" class=\"w-7 h-7 rounded-full object-cover bg-gray-200 dark:bg-gray-700 hidden ring-1 ring-black/5 dark:ring-white/10\" alt=\"Seller avatar\">\n                            <span data-initial=\"\" class=\"w-7 h-7 rounded-full bg-gradient-to-br from-brand-500/30 to-brand-500/10 text-brand-700 dark:text-fuchsia-200 flex items-center justify-center text-[11px] font-semibold ring-1 ring-black/5 dark:ring-white/10\"></span>\n                        </span>\n                        <a data-profile-link-name=\"\" class=\"text-[11px] font-medium text-gray-700 dark:text-gray-300 hover:underline truncate max-w-[7.5rem]\"></a>\n                    </div>\n                    <span class=\"text-[11px] rating text-amber-500\"></span>\n                </div>\n            </div>\n        </article>\n    " }}
      />
      <template
        id="noteRowTpl"
        dangerouslySetInnerHTML={{ __html: "\n        <article class=\"p-4 flex items-start gap-4\" role=\"listitem\">\n            <div class=\"flex-1 min-w-0\">\n                <div class=\"flex items-start gap-2\">\n                    <h3 class=\"font-semibold text-sm line-clamp-1 title text-neutral-900 dark:text-neutral-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors\">\n                    </h3>\n                    <span class=\"ml-auto priceChip\"></span>\n                </div>\n                <p class=\"text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mt-1 desc\"></p>\n                <div class=\"flex items-center gap-2 text-[11px] text-gray-500 flex-wrap mt-2 meta\"></div>\n            </div>\n            <div class=\"flex flex-col items-end gap-2\">\n                <span class=\"text-[11px] rating text-amber-500\"></span>\n                <a class=\"text-xs font-medium text-brand-700 dark:text-fuchsia-200 hover:underline detailsLink\" href=\"#\">Details</a>\n            </div>\n        </article>\n    " }}
      />
      <template
        id="skeletonCardTpl"
        dangerouslySetInnerHTML={{ __html: "\n        <div class=\"rounded-xl ring-1 ring-black/10 dark:ring-white/15 p-4 bg-white/70 dark:bg-white/5\">\n            <div class=\"h-4 w-2/3 skeleton animate-shimmer rounded mb-2\"></div>\n            <div class=\"h-3 w-full skeleton animate-shimmer rounded mb-1\"></div>\n            <div class=\"h-3 w-5/6 skeleton animate-shimmer rounded mb-4\"></div>\n            <div class=\"h-3 w-1/3 skeleton animate-shimmer rounded\"></div>\n        </div>\n    " }}
      />
      {/* SCRIPTS */}
      <script src="/_legacy/matketplace/notes/notes_marketplace/script-02.js" />
    </LegacyPage>
  );
}
