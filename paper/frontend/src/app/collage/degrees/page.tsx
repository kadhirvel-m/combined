// Converted from ui/collage/degrees.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/collage/degrees/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Paper X — Degrees",
};

export default function CollageDegreesPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark transition-colors"}}
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <link rel="stylesheet" href="/_legacy/collage/degrees/style-01.css" />
      <script src="/_legacy/collage/degrees/script-01.js" />
      <script src="/config.js" />
      <script src="helpers.js" />
      {/* ── original <body> ── */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur supports-[backdrop-filter]:saturate-150 border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-4">
          <a href="../index.html" className="flex items-center gap-3" aria-label="Paper X Home">
            {" "}
            <img src="../assets/img/logo-light.svg" alt="Paper X" className="h-10 w-auto dark:hidden" />
            {" "}
            <img src="../assets/img/logo-dark.svg" alt="Paper X" className="h-10 w-auto hidden dark:block" />
            {" "}
          </a>
          {" "}
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700 dark:text-white/85">
            <a className="hover:text-brandlt-900 dark:hover:text-white transition" href="../index.html">
              Home
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white transition" href="../about.html">
              About
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white transition" href="../contact.html">
              Contact
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white transition" href="../help.html">
              Help
            </a>
            {" "}
            <a
              className="inline-flex items-center gap-1 rounded-full bg-brandlt-200/70 px-3 py-1.5 text-brand-700 dark:bg-white/10 dark:text-white"
              href="clg_info.html"
            >
              {" "}
              <span>
                Collages
              </span>
              {" "}
              <span className="material-symbols-rounded text-base">
                hub
              </span>
              {" "}
            </a>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <button
              data-theme-toggle=""
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
              aria-label="Toggle theme"
            >
              <span className="material-symbols-rounded">
                dark_mode
              </span>
              {" "}
              <span className="hidden sm:block">
                Theme
              </span>
            </button>
            {" "}
            <a
              href="../login.html"
              className="text-sm text-neutral-700 dark:text-white/85 hover:text-brandlt-900 dark:hover:text-white px-3 py-2 rounded-full transition"
            >
              {" Log in "}
            </a>
            {" "}
            <a
              href="../signup.html"
              className="inline-flex items-center justify-center rounded-full bg-brand-500 text-white text-sm font-semibold px-4 py-2.5 hover:shadow-glow transition"
            >
              {" Sign up "}
            </a>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              data-theme-toggle=""
              aria-label="Toggle theme"
              className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <span className="material-symbols-rounded">
                dark_mode
              </span>
            </button>
            {" "}
            <button
              id="mobileNavToggle"
              type="button"
              aria-expanded="false"
              aria-controls="mobileNavPanel"
              className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <span className="sr-only">
                Toggle navigation
              </span>
              {" "}
              <span className="material-symbols-rounded" data-icon="">
                menu
              </span>
            </button>
          </div>
        </div>
      </header>
      <div
        id="mobileNavBackdrop"
        aria-hidden="true"
        className="md:hidden fixed inset-0 z-40 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
      />
      <nav
        id="mobileNavPanel"
        aria-hidden="true"
        className="md:hidden fixed inset-x-4 top-24 z-50 flex flex-col gap-5 max-h-[calc(100vh-6.5rem)] overflow-y-auto rounded-3xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-brand-900/95 shadow-[0_1.5rem_4rem_-1.5rem_rgba(30,30,47,0.75)] backdrop-blur supports-[backdrop-filter]:backdrop-blur-xl p-6"
      >
        <div className="flex flex-col gap-2 text-sm text-neutral-700 dark:text-white/80">
          <a
            href="../index.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Home
          </a>
          {" "}
          <a
            href="../about.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            About
          </a>
          {" "}
          <a
            href="../contact.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Contact
          </a>
          {" "}
          <a
            href="../help.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Help
          </a>
          {" "}
          <a
            href="clg_info.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 bg-brandlt-200/70 dark:bg-white/10 text-brand-700 dark:text-white transition"
          >
            {" Collages "}
          </a>
        </div>
        <div className="flex flex-col gap-3 border-t border-black/5 dark:border-white/10 pt-4">
          <a
            href="../login.html"
            data-close-mobile-nav=""
            className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium ring-1 ring-black/10 dark:ring-white/15 text-neutral-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            {" Log in "}
          </a>
          {" "}
          <a
            href="../signup.html"
            data-close-mobile-nav=""
            className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] shadow-[0_4px_18px_-6px_rgba(158,75,138,0.6)] hover:shadow-[0_6px_24px_-8px_rgba(158,75,138,0.7)] transition"
          >
            {" Sign up "}
          </a>
        </div>
      </nav>
      <main>
        <section className="relative overflow-hidden border-b border-black/5 dark:border-white/10 hero-aurora">
          <div aria-hidden="true" className="absolute inset-0">
            <div className="absolute -top-36 right-10 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
            <div className="absolute bottom-[-8rem] left-10 h-72 w-72 rounded-full bg-brand-700/25 blur-3xl" />
          </div>
          <div className="relative container max-w-6xl py-5 md:py-7">
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-start">
              {/* Left content */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-neutral-500 dark:text-white/70">
                  <nav
                    id="breadcrumbs"
                    aria-label="Breadcrumb"
                    className="inline-flex flex-wrap items-center gap-2 text-xs md:text-sm"
                  />
                  {" "}
                  <span className="hidden md:block h-4 w-px bg-black/10 dark:bg-white/15" />
                  {" "}
                  <a
                    id="backLink"
                    href="clg_info.html"
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 px-3 py-1.5 text-xs md:text-sm font-medium text-neutral-700 dark:text-white/70 hover:border-brand-500/50 transition"
                  >
                    {" "}
                    <span className="material-symbols-rounded text-base">
                      arrow_back
                    </span>
                    {" Back to colleges "}
                  </a>
                </div>
                <div className="space-y-3">
                  {/* Title now becomes flex container so we can inject logo beside college name dynamically */}
                  <h1
                    id="pageTitle"
                    className="text-2xl md:text-4xl font-bold gradient-hero-text flex flex-wrap items-center gap-3"
                  >
                    {" Degrees"}
                  </h1>
                  <p id="pageSubtitle" className="hidden" />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    id="addDegreeBtn"
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-[#B06AB3] to-[#FF7FD1] px-10 py-3 text-sm font-semibold text-white min-w-[14rem] shadow-[0_12px_30px_rgba(158,75,138,0.35)] hover:shadow-[0_16px_36px_rgba(158,75,138,0.45)] transition"
                  >
                    <span className="material-symbols-rounded text-base">
                      add
                    </span>
                    {" Add degree "}
                  </button>
                  {" "}
                  <p className="text-sm md:text-base text-neutral-600 dark:text-white/65">
                    {" Define the degree catalogue before mapping departments and batches. "}
                  </p>
                </div>
              </div>
              {/* Right media */}
              <div className="mt-12 lg:mt-0 relative">
                <div className="relative group rounded-3xl overflow-hidden ring-1 ring-black/10 dark:ring-white/10 shadow-soft bg-black/5 dark:bg-white/5 h-56 sm:h-60 md:h-64 xl:h-72">
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster="../assets/img/placeholder-video.jpg"
                  >
                    <source src="../assets/video/collage/deg.mp4" type="video/mp4" />
                    {" Your browser does not support the video tag. "}
                  </video>
                  {" "}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand-500/10 via-transparent to-brand-700/10 mix-blend-overlay" />
                </div>
                <p className="mt-3 text-xs text-neutral-500 dark:text-white/50">
                  Visualizing the evolving degree catalogue.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="container max-w-6xl">
            <div id="results" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" />
          </div>
        </section>
      </main>
      <div
        id="degreeModal"
        className="fixed inset-0 z-50 hidden px-4 py-12 sm:px-6 lg:px-8 flex items-center justify-center"
      >
        <div
          id="degreeModalBackdrop"
          className="absolute inset-0 bg-brand-900/70 dark:bg-black/70 backdrop-blur-sm"
        />
        <div className="relative w-full max-w-xl rounded-3xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-brand-900/95 shadow-[0_24px_60px_rgba(30,30,47,0.45)]">
          <div className="flex items-start justify-between gap-4 border-b border-black/5 dark:border-white/10 px-6 py-5">
            <div>
              <h2 id="degreeModalTitle" className="text-xl font-semibold text-neutral-900 dark:text-white">
                Add a new degree
              </h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">
                Capture the title along with optional level and duration.
              </p>
            </div>
            {" "}
            <button
              id="degreeModalClose"
              type="button"
              className="rounded-full border border-transparent p-2 text-neutral-500 hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60"
            >
              <span className="material-symbols-rounded text-lg">
                close
              </span>
            </button>
          </div>
          <form id="degreeForm" className="space-y-5 px-6 py-6">
            <label className="block text-sm font-medium text-neutral-700 dark:text-white/85">
              {" Degree name "}
              <input
                id="degreeName"
                name="name"
                type="text"
                required
                className="mt-2 w-full rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                placeholder="e.g. Bachelor of Technology"
              />
              {" "}
            </label>
            {" "}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-white/85">
                {" Level (optional) "}
                <input
                  id="degreeLevel"
                  name="level"
                  type="text"
                  className="mt-2 w-full rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  placeholder="e.g. Undergraduate"
                />
                {" "}
              </label>
              {" "}
              <label className="block text-sm font-medium text-neutral-700 dark:text-white/85">
                {" Duration (years, optional) "}
                <input
                  id="degreeDuration"
                  name="duration"
                  type="number"
                  min="1"
                  max="10"
                  className="mt-2 w-full rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  placeholder="4"
                />
                {" "}
              </label>
            </div>
            {" "}
            <label className="block text-sm font-medium text-neutral-700 dark:text-white/85">
              {" Stream "}
              <select
                id="degreeStream"
                name="stream"
                className="mt-2 w-full rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                defaultValue={"Engineering"}
              >
                <option value="Engineering">
                  Engineering
                </option>
                <option value="Medical">
                  Medical
                </option>
                <option value="Nursing">
                  Nursing
                </option>
                <option value="Arts">
                  Arts
                </option>
                <option value="Law">
                  Law
                </option>
              </select>
              {" "}
            </label>
            {" "}
            <p id="degreeModalMessage" className="hidden text-sm text-red-500" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                id="degreeDeleteBtn"
                type="button"
                className="hidden inline-flex items-center justify-center gap-2 rounded-full border border-red-300/60 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-200 px-4 py-2 text-sm font-medium hover:border-red-400/80 transition"
              >
                <span className="material-symbols-rounded text-base">
                  delete
                </span>
                {" Delete "}
              </button>
              {" "}
              <div className="flex items-center gap-3 ml-auto">
                <button
                  id="degreeModalCancel"
                  type="button"
                  className="inline-flex items-center justify-center rounded-full border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-white/70 hover:border-brand-500/50 transition"
                >
                  {" Cancel "}
                </button>
                {" "}
                <button
                  id="degreeSubmitBtn"
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-[#B06AB3] to-[#FF7FD1] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(158,75,138,0.35)] hover:shadow-[0_16px_36px_rgba(158,75,138,0.45)] transition"
                >
                  <span className="material-symbols-rounded text-base">
                    save
                  </span>
                  {" Save degree "}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      {/* Force Delete Confirmation Modal */}
      <div
        id="forceDeleteModal"
        className="fixed inset-0 z-[60] hidden px-4 py-12 sm:px-6 lg:px-8 flex items-center justify-center"
      >
        <div id="forceDeleteBackdrop" className="absolute inset-0 bg-gray-900/80 backdrop-blur-md" />
        <div className="relative w-full max-w-md rounded-3xl border border-red-200 dark:border-red-900/30 bg-white dark:bg-gray-900 shadow-[0_24px_60px_rgba(220,38,38,0.35)] overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 size-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                <span className="material-symbols-rounded text-2xl">
                  warning
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Force Delete Degree
                </h3>
                <p className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wide">
                  {" Destructive Action"}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {" This action will "}
              <strong>
                permanently delete
              </strong>
              {" the degree "}
              <span id="forceDeleteNameDisplay" className="font-bold text-gray-900 dark:text-white" />
              {" and all related data: "}
            </p>
            <ul className="mb-5 space-y-1 text-sm text-gray-500 dark:text-gray-400 list-disc list-inside bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
              <li>
                {"All Departments & Batches"}
              </li>
              <li>
                Education Records (Student History)
              </li>
              <li>
                {"Classes & Syllabus"}
              </li>
              <li>
                Marketplace Notes dependencies
              </li>
            </ul>
            {" "}
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {" Type details below to confirm "}
            </label>
            {" "}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-rounded text-gray-400 text-lg">
                  edit
                </span>
              </div>
              {" "}
              <input
                type="text"
                id="forceDeleteInput"
                className="block w-full rounded-xl border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 pl-10 pr-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-red-300 dark:placeholder-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition"
                placeholder="Type the degree name"
                autoComplete="off"
              />
            </div>
            <div
              id="forceDeleteError"
              className="hidden mt-2 text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1"
            >
              <span className="material-symbols-rounded text-sm">
                error
              </span>
              {" "}
              <span>
                Incorrect name. Please try again.
              </span>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              id="forceDeleteCancel"
              className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {" Cancel "}
            </button>
            {" "}
            <button
              type="button"
              id="forceDeleteConfirmBtn"
              disabled
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500 text-white border border-red-600 text-sm font-semibold shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 transition"
            >
              <span className="material-symbols-rounded text-base">
                delete_forever
              </span>
              {" Force Delete "}
            </button>
          </div>
        </div>
      </div>
      <footer className="border-t border-black/5 dark:border-white/10 py-10">
        <div className="container flex flex-col gap-3 text-sm text-neutral-500 dark:text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {"© "}
            <span id="y" />
            {" Paper X · College Console."}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="../about.html" className="hover:text-brand-500 dark:hover:text-white transition">
              About
            </a>
            {" "}
            <a href="../help.html" className="hover:text-brand-500 dark:hover:text-white transition">
              Help centre
            </a>
            {" "}
            <a href="../contact.html" className="hover:text-brand-500 dark:hover:text-white transition">
              Contact
            </a>
          </div>
        </div>
      </footer>
      <script src="/_legacy/collage/degrees/script-02.js" />
      <script src="/_legacy/collage/degrees/script-03.js" />
      <script src="/_legacy/collage/degrees/script-04.js" />
    </LegacyPage>
  );
}
