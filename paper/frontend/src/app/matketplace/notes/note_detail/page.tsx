// Converted from ui/matketplace/notes/note_detail.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/matketplace/notes/note_detail/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Paper X — Note Detail",
};

export default function MatketplaceNotesNoteDetailPage() {
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
      <script src="https://unpkg.com/mammoth/mammoth.browser.min.js" />
      <script src="/_legacy/matketplace/notes/note_detail/script-01.js" />
      <link rel="stylesheet" href="/_legacy/matketplace/notes/note_detail/style-01.css" />
      <script src="/_legacy/matketplace/notes/note_detail/script-02.js" />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      {/* ── original <body> ── */}
      {/* GLOBAL HEADER (same as other PaperX pages) */}
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
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="./notes_marketplace.html">
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
            <a
              href="./notes_marketplace.html"
              className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15"
              title="Back"
            >
              <span className="material-symbols-rounded">
                arrow_back
              </span>
            </a>
          </div>
        </div>
        {/* Secondary bar */}
        <div className="border-t border-black/5 dark:border-white/10 bg-white/60 dark:bg-brand-900/40">
          <div className="container py-2 flex items-center gap-3 text-xs text-neutral-600 dark:text-white/70">
            <a href="./notes_marketplace.html" className="inline-flex items-center gap-1 hover:underline">
              <span className="material-symbols-rounded text-sm">
                arrow_back
              </span>
              Back to marketplace
            </a>
            {" "}
            <span className="opacity-60">
              /
            </span>
            {" "}
            <span id="crumbTitle" className="truncate">
              Loading…
            </span>
          </div>
        </div>
      </header>
      <main className="container py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* MAIN COLUMN */}
        <section className="lg:col-span-8 space-y-6">
          {/* Title + meta card */}
          <div className="glass rounded-2xl p-5 ring-1 ring-black/5 dark:ring-white/10 shadow-card">
            <div className="flex items-start gap-4">
              <div
                id="sellerAvatarWrap"
                className="shrink-0 w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/50 dark:ring-black/30 bg-brand-500/10 grid place-items-center skeleton animate-shimmer"
              />
              <div className="flex-1 min-w-0">
                <h1
                  id="noteTitle"
                  className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1 flex items-center gap-2"
                >
                  <span id="noteTitleText">
                    Loading…
                  </span>
                  {" "}
                  <span
                    id="titleTeacherBadge"
                    className="hidden inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30"
                  >
                    {" "}
                    <span className="material-symbols-rounded text-sm">
                      verified
                    </span>
                    {" "}
                    <span className="hidden sm:inline">
                      Uploaded by Teacher
                    </span>
                    {" "}
                    <span className="sm:hidden">
                      Teacher
                    </span>
                    {" "}
                  </span>
                </h1>
                <div
                  id="metaChips"
                  className="flex flex-wrap gap-2 text-[11px] text-neutral-600 dark:text-white/70"
                />
              </div>
              <div className="text-right">
                <div
                  id="priceChip"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-700 dark:text-fuchsia-200 text-sm font-semibold skeleton animate-shimmer"
                >
                  {"  "}
                </div>
                {" "}
                <div id="ratingSummary" className="text-xs text-amber-500 mt-1">
                   
                </div>
              </div>
            </div>
          </div>
          {/* Preview */}
          <div
            className="glass rounded-2xl ring-1 ring-black/5 dark:ring-white/10 shadow-card overflow-hidden"
            id="previewCard"
          >
            <div className="px-4 py-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                Preview
              </h2>
              <div className="flex items-center gap-2 text-xs">
                <button
                  id="printBtn"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-500/90 text-white hover:bg-brand-500 shadow-glow"
                >
                  <span className="material-symbols-rounded text-sm">
                    print
                  </span>
                  <span>
                    Print
                  </span>
                </button>
                {" "}
                <span id="printQuickInfo" className="hidden md:inline text-[11px] opacity-70" />
                {" "}
                <button
                  id="openInNew"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <span className="material-symbols-rounded text-sm">
                    open_in_new
                  </span>
                  Open
                </button>
                {" "}
                <button
                  id="copyLink"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <span className="material-symbols-rounded text-sm">
                    share
                  </span>
                  Share
                </button>
              </div>
            </div>
            <div
              id="previewArea"
              className="bg-white/70 dark:bg-white/5 border-t border-black/5 dark:border-white/10 grid place-items-center min-h-[170px]"
            >
              <div
                id="previewPlaceholder"
                className="w-full max-w-3xl aspect-[3/2] rounded-xl ring-1 ring-black/10 dark:ring-white/15 bg-gradient-to-br from-brand-500/10 to-brand-700/10 grid place-items-center"
              >
                <span className="material-symbols-rounded text-4xl opacity-50">
                  picture_as_pdf
                </span>
              </div>
            </div>
            <div id="thumbStrip" className="px-3 pb-3 pt-2 overflow-x-auto flex gap-2" />
          </div>
          {/* What's inside */}
          <div
            id="outlineCard"
            className="hidden glass rounded-2xl p-5 ring-1 ring-black/5 dark:ring-white/10 shadow-card"
          >
            <h2 className="text-sm font-semibold mb-3">
              What’s inside
            </h2>
            <ul id="outlineList" className="space-y-2 text-sm text-neutral-700 dark:text-white/80" />
          </div>
          {/* Description */}
          <article className="prose prose-sm dark:prose-invert max-w-none glass rounded-2xl p-5 ring-1 ring-black/5 dark:ring-white/10 shadow-card">
            <h2 className="text-sm font-semibold mb-2">
              Description
            </h2>
            <p id="noteDesc" className="whitespace-pre-wrap">
              {"Loading…"}
            </p>
          </article>
          {/* Seller card */}
          <div className="glass rounded-2xl p-5 ring-1 ring-black/5 dark:ring-white/10 shadow-card">
            <div className="flex items-start gap-3">
              <div
                id="sellerAvatar"
                className="w-12 h-12 rounded-full overflow-hidden bg-brand-500/10 grid place-items-center"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 id="sellerName" className="text-sm font-semibold">
                    —
                  </h3>
                  {" "}
                  <span
                    id="sellerBadge"
                    className="hidden text-[11px] inline-flex items-center gap-1 px-2 py-0.5 rounded-full ring-1 ring-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  >
                    <span className="material-symbols-rounded text-sm">
                      verified
                    </span>
                    <span className="hidden sm:inline">
                      Uploaded by Teacher
                    </span>
                    <span className="sm:hidden">
                      Teacher
                    </span>
                  </span>
                </div>
                <div id="sellerMeta" className="text-xs text-neutral-600 dark:text-white/70">
                   
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <a
                    id="sellerProfile"
                    href="#"
                    className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <span className="material-symbols-rounded text-sm">
                      person
                    </span>
                    Visit profile
                  </a>
                  {" "}
                  <button
                    id="contactSeller"
                    className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <span className="material-symbols-rounded text-sm">
                      mail
                    </span>
                    Contact
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Reviews */}
          <section id="reviewsSection" className="space-y-4">
            <div className="glass rounded-2xl p-5 ring-1 ring-black/5 dark:ring-white/10 shadow-card">
              <div className="flex items-center gap-4">
                <h2 className="text-sm font-semibold">
                  Reviews
                </h2>
                <div id="ratingBig" className="ml-auto text-right" />
              </div>
              <div id="ratingBars" className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3" />
              <div className="mt-4" id="reviewsList" />
              <div className="mt-4">
                <button
                  id="addReviewBtn"
                  className="text-xs bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded"
                >
                  Add / Update Review
                </button>
              </div>
            </div>
            <form
              id="reviewForm"
              className="hidden glass rounded-2xl p-5 ring-1 ring-black/5 dark:ring-white/10 shadow-card space-y-4"
            >
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium">
                  Your rating
                </label>
                {" "}
                <div
                  id="starPicker"
                  className="inline-flex items-center gap-1 text-amber-500 cursor-pointer"
                  aria-label="Pick rating"
                />
              </div>
              {" "}
              <textarea
                name="comment"
                rows={3}
                className="w-full rounded-md border px-3 py-2 text-sm bg-white/90 dark:bg-white/10"
                placeholder="Share your thoughts…"
              />
              {" "}
              <div className="flex items-center gap-4">
                <button
                  className="bg-brand-500 hover:bg-brand-600 text-white font-medium px-4 py-1.5 rounded-md text-sm"
                  type="submit"
                >
                  Submit Review
                </button>
                {" "}
                <button id="cancelReview" type="button" className="text-xs text-gray-500">
                  Cancel
                </button>
                {" "}
                <p id="reviewStatus" className="text-xs text-gray-600" />
              </div>
              {" "}
              <input type="hidden" name="rating" value="5" />
            </form>
          </section>
        </section>
        {/* ASIDE / PURCHASE */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            <div
              className="glass rounded-2xl p-5 ring-1 ring-black/5 dark:ring-white/10 shadow-card"
              id="purchaseCard"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-neutral-600 dark:text-white/70">
                    Price
                  </div>
                  <div id="pricePrimary" className="text-2xl font-extrabold">
                    —
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-neutral-600 dark:text-white/70">
                    Rating
                  </div>
                  <div id="asideRating" className="text-sm text-amber-500">
                    —
                  </div>
                </div>
              </div>
              <div
                className="mt-3 grid grid-cols-2 gap-2 text-xs text-neutral-700 dark:text-white/80"
                id="fileMeta"
              />
              <div className="mt-4 flex flex-col gap-2">
                <a
                  id="primaryCta"
                  href="#"
                  className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
                >
                  {" "}
                  <span className="material-symbols-rounded">
                    download
                  </span>
                  {" "}
                  <span id="ctaText">
                    Download
                  </span>
                  {" "}
                </a>
                {" "}
                <button
                  id="saveBtn"
                  className="inline-flex items-center justify-center gap-2 rounded-lg ring-1 ring-black/10 dark:ring-white/15 px-4 py-2 text-sm"
                >
                  <span className="material-symbols-rounded">
                    bookmark_add
                  </span>
                  {"Save to wishlist "}
                </button>
                {" "}
                <button
                  id="reportBtn"
                  className="inline-flex items-center justify-center gap-2 rounded-lg ring-1 ring-black/10 dark:ring-white/15 px-4 py-2 text-sm"
                >
                  <span className="material-symbols-rounded">
                    flag
                  </span>
                  {"Report "}
                </button>
                {" "}
                <p id="purchaseStatus" className="text-xs text-red-500 min-h-[1.1rem]" />
              </div>
            </div>
            <div className="glass rounded-2xl p-5 ring-1 ring-black/5 dark:ring-white/10 shadow-card">
              <h3 className="text-sm font-semibold mb-2">
                Details
              </h3>
              <dl
                id="detailsList"
                className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-neutral-700 dark:text-white/80"
              />
            </div>
          </div>
        </aside>
      </main>
      {/* MOBILE BOTTOM BAR */}
      <div id="mobileBar" className="lg:hidden fixed inset-x-0 bottom-2 z-40 px-3">
        <div className="glass rounded-2xl ring-1 ring-black/5 dark:ring-white/10 shadow-card p-2 flex items-center gap-3">
          <div className="text-sm font-semibold" id="mobilePrice">
            —
          </div>
          {" "}
          <a
            id="mobileCta"
            href="#"
            className="ml-auto inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            {" "}
            <span className="material-symbols-rounded">
              download
            </span>
            {" "}
            <span>
              Get
            </span>
            {" "}
          </a>
        </div>
      </div>
      <script src="/_legacy/matketplace/notes/note_detail/script-03.js" />
    </LegacyPage>
  );
}
