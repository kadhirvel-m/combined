// Converted from ui/clg.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/clg/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Pa[p]er X — College Setup",
  description: "Create and manage colleges, degrees, departments, and batches for Paper X.",
};

export default function ClgPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"}}
      head={
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <script src="/_legacy/clg/script-01.js" />
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/_legacy/clg/style-01.css" />
      <script src="/config.js" />
      {/* ── original <body> ── */}
      {/* Top Bar */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-soft grid place-items-center text-white font-bold">
              {" PX"}
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">
                College Creation
              </h1>
              <p className="text-xs text-slate-500">
                Define college, degrees, departments, and batches
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="themeToggle"
              className="rounded-xl px-3 py-2 text-sm ring-1 ring-slate-300 dark:ring-slate-700 hover:bg-slate-100/70 dark:hover:bg-slate-900/70"
            >
              Toggle Theme
            </button>
            {" "}
            <button
              id="loadBtn"
              className="rounded-xl px-3 py-2 text-sm ring-1 ring-slate-300 dark:ring-slate-700 hover:bg-slate-100/70 dark:hover:bg-slate-900/70"
            >
              Load Draft
            </button>
            {" "}
            <button
              id="saveBtn"
              className="rounded-xl px-3 py-2 text-sm bg-brand-600 text-white hover:bg-brand-700 shadow-soft"
            >
              Save Draft
            </button>
          </div>
        </div>
      </header>
      {/* Main */}
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Form Only (no preview/JSON) */}
        <section className="glass rounded-2xl p-6 ring-1 ring-slate-200 dark:ring-slate-800 shadow-soft">
          <h2 className="text-xl font-semibold mb-1">
            College Details
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Required fields are marked with *.
          </p>
          <form id="collegeForm" className="space-y-8">
            {/* Name & Logo */}
            <div className="grid md:grid-cols-3 gap-6 items-start">
              <div className="md:col-span-2">
                <label htmlFor="collegeName" className="block text-sm font-medium mb-2">
                  College Name *
                </label>
                {" "}
                <input
                  id="collegeName"
                  name="collegeName"
                  type="text"
                  required
                  placeholder="e.g., Sri Venkateswara College of Engineering"
                  className="w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 focus:border-brand-500 focus:ring-brand-500"
                />
                {" "}
                <p id="collegeNameErr" className="mt-1 text-xs text-rose-600 hidden">
                  {"Please enter a college name. "}
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  College Logo
                </label>
                {" "}
                <input
                  id="collegeLogo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="text-xs"
                />
                {" "}
                <img
                  id="collegeLogoPreview"
                  className="hidden w-24 h-24 object-cover rounded-lg ring-1 ring-slate-200 dark:ring-slate-700"
                />
                {" "}
                <p className="text-[10px] text-slate-500">
                  PNG/JPG/WEBP/SVG (optional)
                </p>
              </div>
            </div>
            {/* Degree Hierarchy */}
            <div>
              <h3 className="text-lg font-semibold">
                {"Degrees, Departments & Batches *"}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Add each degree offered by the college, then map its departments and batch ranges.
              </p>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                  <div className="grid gap-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="degreeName" className="block text-sm font-medium mb-2">
                        Degree name *
                      </label>
                      {" "}
                      <input
                        id="degreeName"
                        type="text"
                        placeholder="e.g., B.Tech"
                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 focus:border-brand-500 focus:ring-brand-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="degreeLevel" className="block text-sm font-medium mb-2">
                        Level (optional)
                      </label>
                      {" "}
                      <input
                        id="degreeLevel"
                        type="text"
                        placeholder="e.g., UG, PG"
                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 focus:border-brand-500 focus:ring-brand-500"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label htmlFor="degreeDuration" className="block text-sm font-medium mb-2">
                        Duration (yrs)
                      </label>
                      {" "}
                      <input
                        id="degreeDuration"
                        type="number"
                        min="1"
                        max="10"
                        placeholder="4"
                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 focus:border-brand-500 focus:ring-brand-500"
                      />
                    </div>
                    <div className="sm:col-span-6 flex flex-wrap gap-3 pt-2">
                      <button
                        type="button"
                        id="addDegreeBtn"
                        className="rounded-xl px-4 py-2 bg-brand-600 text-white hover:bg-brand-700"
                      >
                        Add degree
                      </button>
                      {" "}
                      <button
                        type="button"
                        id="addCommonDegrees"
                        className="rounded-xl px-4 py-2 ring-1 ring-slate-300 dark:ring-slate-700"
                      >
                        Add common degrees
                      </button>
                      {" "}
                      <p id="degreeNameErr" className="text-xs text-rose-600 hidden">
                        Enter a unique degree name.
                      </p>
                    </div>
                  </div>
                </div>
                <div id="degreesContainer" className="space-y-4">
                  <p className="text-sm text-slate-500">
                    No degrees added yet. Use the form above to add one.
                  </p>
                </div>
                <p id="degreeErr" className="text-xs text-rose-600 hidden">
                  Add at least one degree with departments and batch ranges.
                </p>
              </div>
            </div>
            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                className="rounded-xl px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-soft"
              >
                Create College
              </button>
              {" "}
              <button
                type="button"
                id="resetBtn"
                className="rounded-xl px-4 py-2 ring-1 ring-slate-300 dark:ring-slate-700"
              >
                Reset
              </button>
              {" "}
              <span id="formMsg" className="text-sm" />
            </div>
          </form>
        </section>
      </main>
      <footer className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-10 text-center text-xs text-slate-500">
        {" Built for "}
        <strong>
          Pa[p]er X
        </strong>
        {". Wire this page to your backend endpoint like "}
        <code>
          /api/colleges
        </code>
        {". "}
      </footer>
      <script src="/_legacy/clg/script-02.js" />
    </LegacyPage>
  );
}
