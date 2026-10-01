// Converted from ui/tunex/language.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/tunex/language/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Manage Levels | Tunex",
};

export default function TunexLanguagePage() {
  return (
    <LegacyPage
      html={{"lang":"en"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-gray-100 bg-hero-light dark:bg-hero-dark transition-colors","x-data":"languageApp()"}}
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
      <script src="/_legacy/tunex/language/script-01.js" />
      <link rel="stylesheet" href="/_legacy/tunex/language/style-01.css" />
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
        <div className="flex flex-col gap-3 border-t border-black/5 dark:border-white/10 pt-4">
          <button
            data-close-mobile-nav=""
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-[#B06AB3] to-[#FF7FD1] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_18px_-6px_rgba(158,75,138,0.6)] hover:shadow-[0_6px_24px_-8px_rgba(158,75,138,0.7)] transition"
            {...{ "x-on:click": "openAddModal()" }}
          >
            <span className="material-symbols-rounded text-base">
              add
            </span>
            {" Add Level "}
          </button>
        </div>
      </nav>
      <main className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">
          {/* Left portrait box (reserved space) */}
          <aside className="lg:sticky lg:top-24">
            <div className="bg-gatex-card border border-white/10 rounded-2xl overflow-hidden">
              <div className="aspect-[3/4] bg-gatex-bg/40 relative overflow-hidden">
                <img
                  x-show="portraitLogoUrl()"
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="Language"
                  {...{ ":src": "portraitLogoUrl()" }}
                />
                {" "}
                <div
                  x-show="!portraitLogoUrl()"
                  className="absolute inset-0 flex items-center justify-center text-6xl text-gatex-accent bg-white/5"
                >
                  <i className="ri-code-s-slash-line" />
                </div>
              </div>
              <div className="p-4">
                <div
                  className="text-sm font-semibold gradient-hero-text"
                  x-text="language?.name || 'Language'"
                />
              </div>
            </div>
          </aside>
          {/* Right content (existing layout, unchanged inside) */}
          <section>
            {/* Header & Add Button */}
            <div className="flex justify-between items-end mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <img
                    x-show="language?.logo_url"
                    className="w-8 h-8 object-cover rounded-md"
                    {...{ ":src": "language?.logo_url" }}
                  />
                  {" "}
                  <h2 className="text-3xl font-extrabold gradient-hero-text" x-text="language?.name" />
                </div>
                <p
                  className="text-neutral-600 dark:text-gray-400 text-sm max-w-2xl"
                  x-text="language?.description"
                />
              </div>
              {" "}
              <button
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-[#B06AB3] to-[#FF7FD1] px-4 py-2 text-sm font-medium text-white shadow-[0_12px_30px_rgba(158,75,138,0.35)] hover:shadow-[0_16px_36px_rgba(158,75,138,0.45)] transition"
                {...{ "x-on:click": "openAddModal()" }}
              >
                <span className="material-symbols-rounded text-base">
                  add
                </span>
                {" Add Level "}
              </button>
            </div>
            {/* Levels List */}
            <div className="space-y-4">
              <template
                x-for="(level, index) in levels"
                dangerouslySetInnerHTML={{ __html: "\n                        <div class=\"bg-gatex-card border border-white/5 rounded-xl p-5 hover:border-gatex-primary/50 transition group flex items-center justify-between\">\n                            <a :href=\"'level.html?id=' + level.id + '&amp;langName=' + (language?.name || '')\" class=\"flex-grow flex items-center justify-between mr-4\">\n                                <div class=\"flex items-center gap-4\">\n                                    <span class=\"w-8 h-8 rounded-lg bg-gatex-primary hover:bg-gatex-secondary text-white flex items-center justify-center text-sm font-mono shadow shadow-gatex-primary/20 transition\" x-text=\"index + 1\"></span>\n                                    <div>\n                                        <h3 class=\"font-bold text-lg group-hover:text-gatex-primary transition\" x-text=\"level.title\"></h3>\n                                        <p class=\"text-xs text-gray-500 mt-1\">Order Index: <span x-text=\"level.order_index\"></span></p>\n                                    </div>\n                                </div>\n                            </a>\n                            <div class=\"flex items-center gap-3\">\n                                <!-- Edit Button -->\n                                <button @click=\"openEditModal(level)\" class=\"p-2 bg-gatex-primary hover:bg-gatex-secondary rounded-lg text-white transition shadow shadow-gatex-primary/20 z-20\">\n                                    <i class=\"ri-pencil-line\"></i>\n                                </button>\n                                <i class=\"ri-arrow-right-s-line text-xl text-gray-600 group-hover:text-white transition\"></i>\n                            </div>\n                        </div>\n                    " }}
                {...{ ":key": "level.id" }}
              />
            </div>
            {/* Empty State */}
            <div
              x-show={"levels.length === 0 && !loading"}
              className="text-center py-20 bg-gatex-card/50 rounded-2xl border border-white/5 border-dashed"
            >
              <i className="ri-bar-chart-groupped-line text-4xl mb-3 block opacity-30" />
              {" "}
              <p className="text-gray-500">
                No levels yet. Add Beginner, Intermediate, etc.
              </p>
            </div>
            {/* Add/Edit Modal */}
            <div
              x-show="showModal"
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              style={{ display: "none" }}
            >
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                {...{ "x-on:click": "closeModal()" }}
              />
              <div className="bg-gatex-card border border-white/10 rounded-2xl p-6 w-full max-w-md relative z-10 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold" x-text="isEdit ? 'Edit Level' : 'Add Level'" />
                  {" "}
                  <button
                    x-show="isEdit"
                    className="text-red-500 hover:text-red-400 text-sm flex items-center gap-1"
                    {...{ "x-on:click": "deleteLevel()" }}
                  >
                    <i className="ri-delete-bin-line" />
                    {" Delete "}
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Title
                    </label>
                    {" "}
                    <input
                      type="text"
                      x-model="form.title"
                      className="w-full bg-gatex-bg border border-white/10 rounded-lg px-4 py-2 focus:border-gatex-primary outline-none transition"
                      placeholder="e.g., Beginner"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Order Index
                    </label>
                    {" "}
                    <input
                      type="number"
                      x-model="form.order_index"
                      className="w-full bg-gatex-bg border border-white/10 rounded-lg px-4 py-2 focus:border-gatex-primary outline-none transition"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    className="px-4 py-2 rounded-lg hover:bg-white/5 text-sm"
                    {...{ "x-on:click": "closeModal()" }}
                  >
                    Cancel
                  </button>
                  {" "}
                  <button
                    className="bg-gatex-primary hover:bg-gatex-secondary text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    x-text="isEdit ? 'Update' : 'Create'"
                    {...{ "x-on:click": "submitForm()" }}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <script src="/_legacy/tunex/language/script-02.js" />
      <script src="/_legacy/tunex/language/script-03.js" />
      <script src="/_legacy/tunex/language/script-04.js" />
    </LegacyPage>
  );
}
