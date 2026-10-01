// Converted from ui/print/printers/configure.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/print/printers/configure/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Configure & Preview — PaperX",
};

export default function PrintPrintersConfigurePage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(158,75,138,.18),transparent),radial-gradient(900px_500px_at_110%_10%,rgba(76,42,89,.25),transparent)] dark:bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(158,75,138,.22),transparent),radial-gradient(900px_500px_at_110%_10%,rgba(30,30,47,.7),transparent)]"}}
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
      <script src="/_legacy/print/printers/configure/script-01.js" />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      <link rel="stylesheet" href="/_legacy/print/printers/configure/style-01.css" />
      {/* ── original <body> ── */}
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-brand-900/60 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="./shops.html" className="inline-flex items-center gap-2">
            {" "}
            <span className="material-symbols-rounded">
              arrow_back
            </span>
            <span className="font-semibold">
              Back
            </span>
            {" "}
          </a>
          {" "}
          <div className="text-lg font-bold">
            {"Configure & Preview"}
          </div>
          {" "}
          <a href="../orders/index.html" className="text-sm hover:underline">
            My Prints
          </a>
        </div>
      </header>
      {/* Stepper */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <ol className="grid grid-cols-3 gap-2 text-[12px]">
          <li className="flex items-center gap-2 rounded-lg px-3 py-2 bg-brand-500 text-white">
            <span className="material-symbols-rounded text-base">
              tune
            </span>
            {" Configure "}
          </li>
          <li className="flex items-center gap-2 rounded-lg px-3 py-2 bg-brand-500/10 ring-1 ring-brand-500/30">
            <span className="material-symbols-rounded text-base">
              visibility
            </span>
            {" Preview "}
          </li>
          <li className="flex items-center gap-2 rounded-lg px-3 py-2 bg-brand-500/10 ring-1 ring-brand-500/30">
            <span className="material-symbols-rounded text-base">
              check_circle
            </span>
            {" Review "}
          </li>
        </ol>
      </div>
      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Settings */}
        <section className="lg:col-span-6">
          <div className="glass rounded-3xl p-5 ring-1 ring-black/5 dark:ring-white/10 shadow-neon">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">
                Settings
              </div>
              {" "}
              <button
                id="applyDefaults"
                type="button"
                className="text-[12px] px-2 py-1 rounded-md ring-soft hover:bg-black/5 dark:hover:bg-white/5"
              >
                {" Reset "}
              </button>
            </div>
            {/* Presets */}
            <div className="mb-4">
              <div className="text-[12px] opacity-75 mb-1">
                Quick presets
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="preset px-2 py-1 rounded-full text-[12px] ring-soft hover:bg-black/5 dark:hover:bg-white/5"
                  data-preset="eco"
                >
                  Eco B/W
                </button>
                {" "}
                <button
                  type="button"
                  className="preset px-2 py-1 rounded-full text-[12px] ring-soft hover:bg-black/5 dark:hover:bg-white/5"
                  data-preset="handout"
                >
                  Lecture Handout
                </button>
                {" "}
                <button
                  type="button"
                  className="preset px-2 py-1 rounded-full text-[12px] ring-soft hover:bg-black/5 dark:hover:bg-white/5"
                  data-preset="poster"
                >
                  Color Poster
                </button>
                {" "}
                <button
                  type="button"
                  className="preset px-2 py-1 rounded-full text-[12px] ring-soft hover:bg-black/5 dark:hover:bg-white/5"
                  data-preset="booklet"
                >
                  Booklet
                </button>
              </div>
            </div>
            <form id="cfg" className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[13px]">
              <label className="col-span-2 md:col-span-1 inline-flex flex-col">
                {" "}
                <span className="inline-flex items-center gap-2">
                  <span className="material-symbols-rounded">
                    content_copy
                  </span>
                  {" Copies"}
                </span>
                {" "}
                <input
                  name="copies"
                  type="number"
                  min="1"
                  max="50"
                  defaultValue="1"
                  className="mt-1 w-24 px-3 py-2 rounded-lg ring-soft bg-white/80 dark:bg-white/5 focus-ring"
                />
                {" "}
              </label>
              {" "}
              <label className="col-span-2 md:col-span-1 inline-flex flex-col">
                {" "}
                <span className="inline-flex items-center gap-2">
                  <span className="material-symbols-rounded">
                    palette
                  </span>
                  {" Color Mode"}
                </span>
                {" "}
                <select
                  name="color_mode"
                  className="mt-1 w-full px-3 py-2 rounded-lg ring-soft bg-white/80 dark:bg-white/5 focus-ring"
                >
                  <option value="bw">
                    {"Black & White"}
                  </option>
                  <option value="color">
                    Color
                  </option>
                </select>
                {" "}
              </label>
              {" "}
              <label className="col-span-2 md:col-span-1 inline-flex flex-col">
                {" "}
                <span className="inline-flex items-center gap-2">
                  <span className="material-symbols-rounded">
                    swap_vert
                  </span>
                  {" Duplex"}
                </span>
                {" "}
                <select
                  name="duplex"
                  className="mt-1 w-full px-3 py-2 rounded-lg ring-soft bg-white/80 dark:bg-white/5 focus-ring"
                >
                  <option value="off">
                    Off
                  </option>
                  <option value="long">
                    On (long side)
                  </option>
                </select>
                {" "}
              </label>
              {" "}
              <div className="col-span-2 md:col-span-2 relative" id="nupPicker">
                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-2">
                    {" "}
                    <span className="material-symbols-rounded">
                      view_quilt
                    </span>
                    {" "}
                    <span>
                      Pages per sheet
                    </span>
                    {" "}
                  </label>
                  {" "}
                  <button
                    type="button"
                    id="nupPickerBtn"
                    className="text-[12px] inline-flex items-center gap-1 px-2 py-1 rounded-md ring-soft hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <span className="material-symbols-rounded text-base">
                      expand_more
                    </span>
                    {" "}
                    <span id="nupSelectedLabel">
                      1 per sheet
                    </span>
                  </button>
                </div>
                {" "}
                <select name="n_up" id="n_up_select" className="hidden">
                  <option>
                    1
                  </option>
                  <option>
                    2
                  </option>
                  <option>
                    4
                  </option>
                  <option>
                    6
                  </option>
                  <option>
                    9
                  </option>
                </select>
                {" "}
                <div
                  id="nupPanel"
                  className="hidden absolute z-20 mt-2 w-[min(28rem,100%)] right-0 p-3 rounded-xl bg-white/95 dark:bg-brand-900/80 ring-1 ring-black/10 dark:ring-white/15 shadow-elev-2"
                >
                  <div className="text-[12px] opacity-70 mb-2">
                    Choose how many pages to place on each sheet.
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      data-value="1"
                      className="nupTile group rounded-lg ring-soft p-3 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <div className="grid grid-cols-1 gap-1 h-20">
                        <div className="bg-white dark:bg-white/10 rounded ring-1 ring-black/10 dark:ring-white/15" />
                      </div>
                      <div className="mt-2 text-center text-[12px] opacity-80">
                        1 per sheet
                      </div>
                    </button>
                    {" "}
                    <button
                      type="button"
                      data-value="2"
                      className="nupTile group rounded-lg ring-soft p-3 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <div className="grid grid-cols-2 gap-1 h-20">
                        <div className="bg-white dark:bg-white/10 rounded ring-1 ring-black/10 dark:ring-white/15" />
                        <div className="bg-white dark:bg-white/10 rounded ring-1 ring-black/10 dark:ring-white/15" />
                      </div>
                      <div className="mt-2 text-center text-[12px] opacity-80">
                        2 per sheet
                      </div>
                    </button>
                    {" "}
                    <button
                      type="button"
                      data-value="4"
                      className="nupTile group rounded-lg ring-soft p-3 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <div className="grid grid-cols-2 gap-1 h-20">
                        <div className="bg-white dark:bg-white/10 rounded ring-1 ring-black/10 dark:ring-white/15" />
                        <div className="bg-white dark:bg-white/10 rounded ring-1 ring-black/10 dark:ring-white/15" />
                        <div className="bg-white dark:bg-white/10 rounded ring-1 ring-black/10 dark:ring-white/15" />
                        <div className="bg-white dark:bg-white/10 rounded ring-1 ring-black/10 dark:ring-white/15" />
                      </div>
                      <div className="mt-2 text-center text-[12px] opacity-80">
                        4 per sheet
                      </div>
                    </button>
                    {" "}
                    <button
                      type="button"
                      data-value="6"
                      className="nupTile group rounded-lg ring-soft p-3 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <div className="grid grid-cols-3 gap-1 h-20">
                        <div className="bg-white dark:bg-white/10 rounded ring-1 ring-black/10 dark:ring-white/15" />
                        <div className="bg-white dark:bg-white/10 rounded ring-1 ring-black/10 dark:ring-white/15" />
                        <div className="bg-white dark:bg-white/10 rounded ring-1 ring-black/10 dark:ring-white/15" />
                        <div className="bg-white dark:bg-white/10 rounded ring-1 ring-black/10 dark:ring-white/15" />
                        <div className="bg-white dark:bg-white/10 rounded ring-1 ring-black/10 dark:ring-white/15" />
                        <div className="bg-white dark:bg-white/10 rounded ring-1 ring-black/10 dark:ring-white/15" />
                      </div>
                      <div className="mt-2 text-center text-[12px] opacity-80">
                        6 per sheet
                      </div>
                    </button>
                    {" "}
                    <button
                      type="button"
                      data-value="9"
                      className="nupTile group rounded-lg ring-soft p-3 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <div className="grid grid-cols-3 gap-1 h-20">
                        <div className="bg-white dark:bg-white/10 rounded ring-1 ring-black/10 dark:ring-white/15" />
                        <div className="bg-white dark:bg-white/10 rounded ring-1 ring-black/10 dark:ring-white/15" />
                        <div className="bg-white dark:bg-white/10 rounded ring-1 ring-black/10 dark:ring-white/15" />
                        <div className="bg-white dark:bg-white/10 rounded ring-1 ring-black/10 dark:ring-white/15" />
                        <div className="bg-white dark:bg-white/10 rounded ring-1 ring-black/10 dark:ring-white/15" />
                        <div className="bg-white dark:bg-white/10 rounded ring-1 ring-black/10 dark:ring-white/15" />
                        <div className="bg-white dark:bg-white/10 rounded ring-1 ring-black/10 dark:ring-white/15" />
                        <div className="bg-white dark:bg-white/10 rounded ring-1 ring-black/10 dark:ring-white/15" />
                        <div className="bg-white dark:bg-white/10 rounded ring-1 ring-black/10 dark:ring-white/15" />
                      </div>
                      <div className="mt-2 text-center text-[12px] opacity-80">
                        9 per sheet
                      </div>
                    </button>
                  </div>
                  <div className="mt-3 text-[11px] opacity-70 flex items-center gap-2">
                    <span className="material-symbols-rounded text-base">
                      info
                    </span>
                    Higher pages per sheet reduce paper usage but make text smaller.
                  </div>
                </div>
              </div>
              {" "}
              <label className="col-span-2 md:col-span-1 inline-flex flex-col">
                {" "}
                <span className="inline-flex items-center gap-2">
                  <span className="material-symbols-rounded">
                    description
                  </span>
                  {" Paper Size"}
                </span>
                {" "}
                <select
                  name="paper_size"
                  className="mt-1 w-full px-3 py-2 rounded-lg ring-soft bg-white/80 dark:bg-white/5 focus-ring"
                >
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
              </label>
              {" "}
              <div className="col-span-2 relative" id="oriPicker">
                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-2">
                    {" "}
                    <span className="material-symbols-rounded">
                      screen_rotation
                    </span>
                    {" "}
                    <span>
                      Orientation
                    </span>
                    {" "}
                  </label>
                  {" "}
                  <button
                    type="button"
                    id="oriPickerBtn"
                    className="text-[12px] inline-flex items-center gap-1 px-2 py-1 rounded-md ring-soft hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <span className="material-symbols-rounded text-base">
                      expand_more
                    </span>
                    {" "}
                    <span id="oriSelectedLabel">
                      Vertical (default)
                    </span>
                  </button>
                </div>
                {" "}
                <select
                  name="orientation"
                  id="orientation_select"
                  className="hidden"
                  defaultValue={"vertical"}
                >
                  <option value="vertical">
                    Vertical (default)
                  </option>
                  <option value="horizontal">
                    Horizontal
                  </option>
                </select>
                {" "}
                <div
                  id="oriPanel"
                  className="hidden absolute z-20 mt-2 w-[min(24rem,100%)] right-0 p-3 rounded-xl bg-white/95 dark:bg-brand-900/80 ring-1 ring-black/10 dark:ring-white/15 shadow-elev-2"
                >
                  <div className="text-[12px] opacity-70 mb-2">
                    Choose page orientation for preview.
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Vertical */}
                    <button
                      type="button"
                      data-value="vertical"
                      className="oriTile group rounded-lg ring-soft p-3 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <div className="grid place-items-center h-20">
                        <div className="w-10 h-14 bg-white dark:bg-white/10 rounded ring-1 ring-black/10 dark:ring-white/15" />
                      </div>
                      <div className="mt-2 text-center text-[12px] opacity-80">
                        Vertical
                      </div>
                    </button>
                    {" "}
                    {/* Horizontal */}
                    <button
                      type="button"
                      data-value="horizontal"
                      className="oriTile group rounded-lg ring-soft p-3 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <div className="grid place-items-center h-20">
                        <div className="w-14 h-10 bg-white dark:bg-white/10 rounded ring-1 ring-black/10 dark:ring-white/15" />
                      </div>
                      <div className="mt-2 text-center text-[12px] opacity-80">
                        Horizontal
                      </div>
                    </button>
                  </div>
                  <div className="mt-3 text-[11px] opacity-70 flex items-center gap-2">
                    <span className="material-symbols-rounded text-base">
                      info
                    </span>
                    Vertical is portrait; Horizontal rotates to landscape.
                  </div>
                </div>
              </div>
              {" "}
              <label>
                {"Finishing "}
                <select
                  name="finishing"
                  className="mt-1 w-full px-3 py-2 rounded-lg ring-soft bg-white/80 dark:bg-white/5 focus-ring"
                >
                  <option>
                    none
                  </option>
                  <option>
                    staple
                  </option>
                  <option>
                    spiral
                  </option>
                </select>
                {" "}
              </label>
              {" "}
              <fieldset className="col-span-2">
                <legend className="mb-1">
                  Page Range
                </legend>
                {" "}
                <div className="flex flex-col gap-2">
                  <label className="inline-flex items-center gap-2">
                    {" "}
                    <input type="radio" name="range_mode" value="all" defaultChecked />
                    {" "}
                    <span>
                      All pages
                    </span>
                    {" "}
                  </label>
                  {" "}
                  <label className="flex items-center gap-2">
                    {" "}
                    <input type="radio" name="range_mode" value="range" />
                    {" "}
                    <span>
                      Page range
                    </span>
                    {" "}
                    <input
                      name="page_range"
                      placeholder="e.g. 1-4,7"
                      className="flex-1 px-3 py-2 rounded-lg ring-soft bg-white/80 dark:bg-white/5 focus-ring"
                      disabled
                    />
                    {" "}
                  </label>
                  {" "}
                  <label className="flex items-center gap-2">
                    {" "}
                    <input type="radio" name="range_mode" value="single" />
                    {" "}
                    <span>
                      Single page
                    </span>
                    {" "}
                    <input
                      name="single_page"
                      type="number"
                      min="1"
                      className="w-28 px-3 py-2 rounded-lg ring-soft bg-white/80 dark:bg-white/5 focus-ring"
                      disabled
                    />
                    {" "}
                  </label>
                  {" "}
                  <span id="rangeHint" className="block text-[11px] opacity-70" />
                </div>
              </fieldset>
              {" "}
              <label>
                {"Fit/Scale "}
                <select
                  name="scale"
                  className="mt-1 w-full px-3 py-2 rounded-lg ring-soft bg-white/80 dark:bg-white/5 focus-ring"
                >
                  <option value="fit">
                    Fit to page
                  </option>
                  <option value="actual">
                    Actual size
                  </option>
                  <option value="shrink">
                    Shrink only
                  </option>
                </select>
                {" "}
              </label>
              {" "}
              <label className="inline-flex items-center gap-2">
                {" "}
                <input type="checkbox" name="collate" defaultChecked />
                {" Collate "}
              </label>
              {" "}
              <label className="col-span-2">
                {"Notes to shop "}
                <textarea
                  name="notes_to_shop"
                  rows={3}
                  className="mt-1 w-full px-3 py-2 rounded-lg ring-soft bg-white/80 dark:bg-white/5 focus-ring"
                  placeholder="e.g., print slides 2-up with margin, staple top-left"
                />
                {" "}
              </label>
            </form>
            {/* Summary + Continue */}
            <div className="mt-4 flex items-center justify-between text-[13px]">
              <div id="summary" className="opacity-80" />
              {" "}
              <a
                id="continue"
                href="#"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white hover:bg-brand-700 active:scale-[.99] transition shadow-elev-2"
              >
                {" "}
                <span className="material-symbols-rounded text-base">
                  arrow_forward
                </span>
                {" "}
                <span>
                  Continue → Review
                </span>
                {" "}
              </a>
            </div>
            <div className="mt-2 text-[11px] opacity-70">
              {"Tip: Press "}
              <b>
                Ctrl/⌘ + Enter
              </b>
              {" to continue."}
            </div>
          </div>
        </section>
        {/* Right: Preview */}
        <section className="lg:col-span-6">
          <div className="glass rounded-3xl p-5 ring-1 ring-black/5 dark:ring-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">
                Preview
              </div>
              <div className="text-[12px] opacity-75" id="shopCapsHint">
                Loading shop…
              </div>
            </div>
            {/* Selected document info (populated when noteId present) */}
            <div id="selDocWrap" className="mb-2 text-[13px] hidden">
              <span className="opacity-70">
                Selected:
              </span>
              {" "}
              <span id="selDocTitle" className="font-medium" />
              {" "}
              <a id="selDocOpen" href="#" target="_blank" className="ml-2 text-brand-600 hover:underline">
                Open
              </a>
            </div>
            {/* Preview shell (drop real PDF viewer here later) */}
            <div
              id="preview"
              className="min-h-[280px] grid place-items-center bg-white/70 dark:bg-white/5 rounded-xl ring-1 ring-black/10 dark:ring-white/15"
            >
              <div className="text-center opacity-70 text-sm">
                <span className="material-symbols-rounded text-4xl">
                  picture_as_pdf
                </span>
                {" "}
                <div>
                  Preview placeholder
                </div>
                <div id="previewMeta" className="mt-1 text-[12px]" />
              </div>
            </div>
            {/* Hints */}
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-white/5 ring-soft">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-rounded">
                    palette
                  </span>
                  {" "}
                  <p className="text-sm font-semibold">
                    Color mode
                  </p>
                </div>
                <p className="text-[12px] opacity-80">
                  {"Choose Color or Black & White. Auto-detect is disabled."}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-white/5 ring-soft">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-rounded">
                    compare_arrows
                  </span>
                  {" "}
                  <p className="text-sm font-semibold">
                    {"Pages/Sheet & Duplex"}
                  </p>
                </div>
                <p className="text-[12px] opacity-80">
                  Pages per sheet places multiple pages per side; duplex prints both sides — both reduce sheets.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <script src="/_legacy/print/printers/configure/script-02.js" />
      <script src="/_legacy/print/printers/configure/script-03.js" />
    </LegacyPage>
  );
}
