// Converted from ui/tunex/index.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/tunex/index/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Coding Tracks | Tunex",
};

export default function TunexIndexPage() {
  return (
    <LegacyPage
      html={{"lang":"en"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark transition-colors","x-data":"tracksApp()"}}
      head={
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <script src="/config.js" />
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer />
      <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
      <script src="/_legacy/tunex/index/script-01.js" />
      <link rel="stylesheet" href="/_legacy/tunex/index/style-01.css" />
      {/* ── original <body> ── */}
      {/* Navbar (PaperX layout) */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur supports-[backdrop-filter]:saturate-150 border-b border-black/5 dark:border-white/10 relative">
        <div className="container flex items-center justify-between py-4">
          <a href="../dashboard.html" className="flex items-center gap-3" aria-label="Dashboard">
            {" "}
            <img src="../assets/img/tunex/tunex-logo-light.svg" alt="TuneX" className="h-8 w-auto dark:hidden" />
            {" "}
            <img
              src="../assets/img/tunex/tunex-logo-dark.svg"
              alt="TuneX"
              className="h-8 w-auto hidden dark:block"
            />
            {" "}
          </a>
          {" "}
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700 dark:text-white/85">
            <a className="hover:text-brand-700 dark:hover:text-white transition" href="../dashboard.html">
              Dashboard
            </a>
            {" "}
            <a
              className="inline-flex items-center gap-1 rounded-full bg-brandlt-200/70 px-3 py-1.5 text-brand-700 dark:bg-white/10 dark:text-white"
              href="index.html"
              aria-current="page"
            >
              {" "}
              <span>
                Coding Tracks
              </span>
              {" "}
              <span className="material-symbols-rounded text-base">
                auto_awesome
              </span>
              {" "}
            </a>
            {" "}
            <a className="hover:text-brand-700 dark:hover:text-white transition" href="notebook.html">
              Notebook
            </a>
            {" "}
            <a className="hover:text-brand-700 dark:hover:text-white transition" href="compiler.html">
              Compiler
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
      {/* Mobile navigation (drawer) */}
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
            href="../dashboard.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Dashboard
          </a>
          {" "}
          <a
            href="index.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 bg-brandlt-200/70 dark:bg-white/10 text-brand-700 dark:text-white transition"
          >
            Coding Tracks
          </a>
          {" "}
          <a
            href="notebook.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Notebook
          </a>
          {" "}
          <a
            href="compiler.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Compiler
          </a>
        </div>
      </nav>
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-black/5 dark:border-white/10 hero-aurora">
          <div aria-hidden="true" className="absolute inset-0">
            <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl dark:blur-[90px]" />
            <div className="absolute top-24 -left-32 h-80 w-80 rounded-full bg-brand-700/20 blur-3xl dark:blur-[90px]" />
          </div>
          <div className="relative container max-w-6xl py-5 md:py-7">
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-start">
              {/* Left content */}
              <div>
                <div className="max-w-3xl space-y-6">
                  <h1 className="text-2xl md:text-4xl font-extrabold leading-tight gradient-hero-text">
                    {" Centralized orchestration for coding tracks. "}
                  </h1>
                  <p className="text-lg md:text-xl text-neutral-600 dark:text-white/70">
                    {" Configure languages, levels, sections, and topics through a single TuneX console. "}
                  </p>
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-[#B06AB3] to-[#FF7FD1] px-4 py-2 text-sm font-medium text-white shadow-[0_12px_30px_rgba(158,75,138,0.35)] hover:shadow-[0_16px_36px_rgba(158,75,138,0.45)] transition"
                    {...{ "x-on:click": "openAddModal()" }}
                  >
                    <span className="material-symbols-rounded text-base">
                      add
                    </span>
                    {" Add language "}
                  </button>
                  {" "}
                  <a
                    href="notebook.html"
                    className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-neutral-700 dark:text-white/75 ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10 transition"
                  >
                    {" "}
                    <span className="material-symbols-rounded text-base">
                      menu_book
                    </span>
                    {" Open notebook "}
                  </a>
                  {" "}
                  <a
                    href="compiler.html"
                    className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-neutral-700 dark:text-white/75 ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10 transition"
                  >
                    {" "}
                    <span className="material-symbols-rounded text-base">
                      terminal
                    </span>
                    {" Open compiler "}
                  </a>
                </div>
              </div>
              {/* Right media */}
              <div className="mt-14 lg:mt-0 relative">
                <div className="relative group rounded-3xl overflow-hidden ring-1 ring-black/10 dark:ring-white/10 shadow-soft bg-black/5 dark:bg-white/5 h-44 sm:h-50 md:h-44 xl:h-60">
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster="../assets/img/placeholder-video.jpg"
                  >
                    <source src="../assets/video/coding.mp4" type="video/mp4" />
                    {" Your browser does not support the video tag. "}
                  </video>
                  {" "}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand-500/10 via-transparent to-brand-700/10 mix-blend-overlay" />
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Directory section */}
        <section className="py-4">
          <div className="container max-w-6xl">
            <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              <template
                x-for="(lang, index) in languages"
                dangerouslySetInnerHTML={{ __html: "\n                        <article class=\"group relative overflow-hidden rounded-3xl border border-black/5 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur-xl p-6 shadow-soft transition cursor-pointer\" @click=\"window.location.href = 'language.html?id=' + lang.id\" @keydown.enter.prevent=\"window.location.href = 'language.html?id=' + lang.id\" tabindex=\"0\">\n                            <div class=\"absolute inset-x-6 top-6 h-32 rounded-3xl bg-gradient-to-r from-brand-500/70 via-brandlt-300/60 to-brand-700/80 opacity-25 blur-3xl\">\n                            </div>\n\n                            <!-- Edit button top-right -->\n                            <button type=\"button\" @click.stop.prevent=\"openEditModal(lang)\" aria-label=\"Edit language\" class=\"absolute top-5 right-5 z-30 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-brand-500 via-[#B06AB3] to-[#FF7FD1] text-white shadow-[0_12px_30px_rgba(158,75,138,0.25)] hover:shadow-[0_16px_36px_rgba(158,75,138,0.35)] transition\">\n                                <span class=\"material-symbols-rounded text-[16px]\">edit</span>\n                            </button>\n\n                            <!-- Logo centered vertically on right -->\n                            <div class=\"absolute right-4 top-16 sm:top-1/2 sm:-translate-y-1/2 z-20 pointer-events-none\">\n                                <div class=\"h-16 w-16 sm:h-20 sm:w-20 rounded-2xl ring-2 ring-white/60 dark:ring-white/10 shadow-md bg-white/70 dark:bg-white/10 flex items-center justify-center overflow-hidden\">\n                                    <img :src=\"lang.logo_url\" x-show=\"lang.logo_url\" :alt=\"(lang.name || 'Language') + ' logo'\" class=\"max-h-12 max-w-12 sm:max-h-14 sm:max-w-14 object-contain\">\n                                    <div x-show=\"!lang.logo_url\" class=\"h-full w-full bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center text-[11px] font-semibold\">\n                                        LOGO\n                                    </div>\n                                </div>\n                            </div>\n\n                            <div class=\"pr-20 pt-1\">\n                                <h2 class=\"text-lg font-semibold text-neutral-900 dark:text-white leading-snug\">\n                                    <a :href=\"'language.html?id=' + lang.id\" class=\"inline-flex items-start gap-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-brand-900 group-hover:text-brand-500 transition cursor-pointer relative z-10\">\n                                        <span class=\"whitespace-normal break-words gradient-hero-text\" x-text=\"lang.name\"></span>\n                                        <span class=\"material-symbols-rounded text-[17px] opacity-0 group-hover:opacity-100 transition flex-shrink-0 mt-[2px]\">north_east</span>\n                                    </a>\n                                </h2>\n                                <p class=\"mt-4 text-sm text-neutral-600 dark:text-white/65\" x-text=\"lang.description || 'Manage levels, sections, topics, and problems for this language.'\">\n                                </p>\n                            </div>\n                        </article>\n                    " }}
                {...{ ":key": "lang.id" }}
              />
              {/* Empty State */}
              <div
                x-show={"languages.length === 0 && !loading"}
                className="col-span-full p-10 text-center space-y-4 rounded-3xl border border-black/5 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur-xl shadow-soft"
              >
                <div className="mx-auto size-12 rounded-2xl bg-brandlt-200/60 dark:bg-white/10 grid place-items-center text-brand-700 dark:text-white">
                  <span className="material-symbols-rounded">
                    code
                  </span>
                </div>
                <h3 className="text-lg font-semibold">
                  No languages yet
                </h3>
                <p className="text-sm text-neutral-600 dark:text-white/60">
                  Add your first language to start building tracks.
                </p>
                {" "}
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-[#B06AB3] to-[#FF7FD1] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(158,75,138,0.35)] hover:shadow-[0_16px_36px_rgba(158,75,138,0.45)] transition"
                  {...{ "x-on:click": "openAddModal()" }}
                >
                  <span className="material-symbols-rounded text-base">
                    add
                  </span>
                  {" Add language "}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* Add/Edit Modal (PaperX layout) */}
      <div
        x-show="showModal"
        className="fixed inset-0 z-50 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
        style={{ display: "none" }}
      >
        <div
          className="absolute inset-0 bg-brand-900/70 dark:bg-black/70 backdrop-blur-sm"
          {...{ "x-on:click": "closeModal()" }}
        />
        <div className="relative w-full max-w-xl rounded-3xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-brand-900/95 shadow-[0_24px_60px_rgba(30,30,47,0.45)]">
          <div className="flex items-start justify-between gap-4 border-b border-black/5 dark:border-white/10 px-6 py-5">
            <div>
              <h2
                className="text-xl font-semibold text-neutral-900 dark:text-white"
                x-text="isEdit ? 'Edit language' : 'Add a new language'"
              />
              <p className="mt-1 text-sm text-neutral-600 dark:text-white/65">
                This will appear throughout the learning track console.
              </p>
            </div>
            {" "}
            <button
              type="button"
              className="rounded-full border border-transparent p-2 text-neutral-500 hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60"
              {...{ "x-on:click": "closeModal()" }}
            >
              <span className="material-symbols-rounded text-lg">
                close
              </span>
            </button>
          </div>
          <form className="space-y-5 px-6 py-6" {...{ "x-on:submit.prevent": "submitForm()" }}>
            <div className="grid gap-6 md:grid-cols-3 items-start">
              <label className="block text-sm font-medium text-neutral-700 dark:text-white/85 md:col-span-2">
                {" Language name "}
                <input
                  type="text"
                  x-model="form.name"
                  required
                  className="mt-2 w-full rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  placeholder="e.g. Python"
                />
                {" "}
              </label>
              {" "}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-white/85">
                  {"Logo "}
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-2 block w-full text-xs file:mr-3 file:rounded-full file:border-0 file:bg-brand-500 file:px-3 file:py-1.5 file:text-white file:text-xs hover:file:bg-brand-700 cursor-pointer"
                    {...{ "x-on:change": "form.logo = $event.target.files[0]" }}
                  />
                  {" "}
                </label>
                {" "}
                <img
                  x-show={"isEdit && form.logo_url"}
                  className="w-20 h-20 rounded-xl object-cover ring-1 ring-black/10 dark:ring-white/15 bg-white/40 dark:bg-white/10"
                  alt="Logo preview"
                  {...{ ":src": "form.logo_url" }}
                />
                {" "}
                <p className="text-[10px] text-neutral-500 dark:text-white/40">
                  {"Optional • Upload to replace existing "}
                </p>
              </div>
            </div>
            {" "}
            <label className="block text-sm font-medium text-neutral-700 dark:text-white/85">
              {" Description "}
              <textarea
                x-model="form.description"
                rows={3}
                className="mt-2 w-full rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                placeholder="What will students learn in this track?"
              />
              {" "}
            </label>
            {" "}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-white/70 hover:border-brand-500/50 transition"
                {...{ "x-on:click": "closeModal()" }}
              >
                {" Cancel "}
              </button>
              {" "}
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-[#B06AB3] to-[#FF7FD1] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(158,75,138,0.35)] hover:shadow-[0_16px_36px_rgba(158,75,138,0.45)] transition"
              >
                <span className="material-symbols-rounded text-base">
                  save
                </span>
                {" "}
                <span x-text="isEdit ? 'Update language' : 'Create language'" />
              </button>
            </div>
          </form>
        </div>
      </div>
      <script src="/_legacy/tunex/index/script-02.js" />
      <script src="/_legacy/tunex/index/script-03.js" />
      <script src="/_legacy/tunex/index/script-04.js" />
    </LegacyPage>
  );
}
