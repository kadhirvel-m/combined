// Converted from ui/tales/romantasy.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/tales/romantasy/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Paper X — Romantasy Realms · HoloGrid",
  description: "A modern, futuristic romantasy explorer built for speed.",
};

export default function TalesRomantasyPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"x-data":"romantasyApp()","x-init":"init()","class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark theme-fade"}}
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0&display=swap"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <link rel="stylesheet" href="/_legacy/tales/romantasy/style-01.css" />
      <script src="/_legacy/tales/romantasy/script-01.js" />
      <script src="/config.js" />
      <script src="https://cdn.jsdelivr.net/npm/@alpinejs/trap@3.x.x/dist/cdn.min.js" defer />
      <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer />
      {/* ── original <body> ── */}
      {/* Left Neon Rail */}
      <aside className="fixed left-4 top-1/2 -translate-y-1/2 z-30 hidden md:block">
        <div className="flex flex-col items-center gap-4">
          <button
            aria-label="Grid"
            {...{ "x-on:click": "viewMode='grid'", ":class": "'w-3.5 h-3.5 rounded-full bg-white/70 rail-dot '+(viewMode==='grid'?'ring-2 ring-accent-400':'opacity-60')" }}
          />
          {" "}
          <button
            aria-label="Mosaic"
            {...{ "x-on:click": "viewMode='mosaic'", ":class": "'w-3.5 h-3.5 rounded-full bg-white/70 rail-dot '+(viewMode==='mosaic'?'ring-2 ring-accent-400':'opacity-60')" }}
          />
          {" "}
          <button
            aria-label="List"
            {...{ "x-on:click": "viewMode='list'", ":class": "'w-3.5 h-3.5 rounded-full bg-white/70 rail-dot '+(viewMode==='list'?'ring-2 ring-accent-400':'opacity-60')" }}
          />
          {" "}
          <div className="w-px h-20 bg-gradient-to-b from-white/40 to-transparent" />
          {" "}
          <button
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 flex flex-col items-center"
            {...{ "x-on:click": "toggleTheme()", ":aria-label": "isDark ? 'Switch to light mode' : 'Switch to dark mode'" }}
          >
            <span className="material-symbols-rounded" x-text="isDark ? 'light_mode' : 'dark_mode'" />
            {" "}
            <span className="mt-0.5 text-[9px] font-medium" x-text="isDark ? 'Light' : 'Dark'" />
          </button>
        </div>
      </aside>
      {/* Header (adapted from main site navbar) */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-[#0f0f18]/70 backdrop-blur supports-[backdrop-filter]:saturate-150 border-b border-black/5 dark:border-white/10 relative">
        <div className="container flex items-center justify-between py-3 md:py-4">
          <a href="../../ui/index.html" className="flex items-center gap-3" aria-label="Paper X Home">
            {" "}
            <img src="../assets/img/logo-light.svg" alt="Paper X" className="h-9 w-auto dark:hidden" />
            {" "}
            <img src="../assets/img/logo-dark.svg" alt="Paper X" className="h-9 w-auto hidden dark:block" />
            {" "}
            <span className="text-xs md:text-sm font-medium tracking-wider text-neutral-700 dark:text-white/70">
              Romantasy
            </span>
            {" "}
          </a>
          {" "}
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <input
                x-model="search"
                placeholder="Search realms…"
                className="w-56 md:w-72 rounded-full bg-black/5 dark:bg-white/10 pl-10 pr-4 py-2 text-sm placeholder:text-neutral-500 dark:placeholder:text-white/50 outline-none ring-1 ring-black/10 dark:ring-white/10 focus:ring-accent-400/60"
              />
              {" "}
              <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 dark:text-white/60">
                search
              </span>
            </div>
            {" "}
            <button
              className="hidden md:inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full ring-1 transition select-none ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-white/70"
              {...{ "x-on:click": "viewMode='grid'", ":class": "viewMode==='grid'? 'bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] text-white shadow-glow ring-brand-500/40 hover:from-[#A65592] hover:via-[#BB76BC] hover:to-[#FF8AD5]' : ''" }}
            >
              Grid
            </button>
            {" "}
            <button
              className="hidden md:inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full ring-1 transition select-none ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-white/70"
              {...{ "x-on:click": "viewMode='mosaic'", ":class": "viewMode==='mosaic'? 'bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] text-white shadow-glow ring-brand-500/40 hover:from-[#A65592] hover:via-[#BB76BC] hover:to-[#FF8AD5]' : ''" }}
            >
              Mosaic
            </button>
            {" "}
            <button
              className="hidden md:inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full ring-1 transition select-none ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-neutral-700 dark:text-white/70"
              {...{ "x-on:click": "viewMode='list'", ":class": "viewMode==='list'? 'bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] text-white shadow-glow ring-brand-500/40 hover:from-[#A65592] hover:via-[#BB76BC] hover:to-[#FF8AD5]' : ''" }}
            >
              List
            </button>
            {" "}
            <button
              aria-label="Toggle theme"
              className="inline-flex items-center justify-center h-10 w-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10 transition"
              {...{ "x-on:click": "toggleTheme()" }}
            >
              <span className="material-symbols-rounded" x-text="isDark ? 'light_mode' : 'dark_mode'" />
            </button>
          </div>
        </div>
      </header>
      {/* Hero Prism Panel */}
      <section className="container pt-8 md:pt-14 pb-6">
        <div className="grid md:grid-cols-[1.35fr,1fr] gap-6 items-stretch">
          <div className="clip-hero rounded-2xl holo-edge bg-white/[.04] ring-1 ring-white/10 p-6 md:p-8">
            <h1 className="gradient-hero-text text-5xl md:text-7xl font-extrabold leading-[1.02]">
              Romantasy Realms
            </h1>
            <p className="mt-4 md:mt-6 text-neutral-700 dark:text-white/70 max-w-xl">
              Pick a realm, break a vow, remix fate. Minimal motion, maximal vibe. Built for performance on low‑end machines.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button {...({ "x-on:click": "activeFilter='all'", ":class": "chip('all')" } as Record<string, string>)}>
                All
              </button>
              {" "}
              <template
                x-for="f in filters"
                dangerouslySetInnerHTML={{ __html: "<button @click=\"activeFilter=f\" x-text=\"f\" :class=\"chip(f)\"></button>" }}
                {...{ ":key": "f" }}
              />
            </div>
          </div>
          <div className="rounded-2xl holo-edge bg-white/[.04] ring-1 ring-white/10 p-0 overflow-hidden">
            {/* Feature Highlight: top pick */}
            <div className="relative h-full">
              <img
                src="../assets/img/img1.png"
                className="absolute inset-0 w-full h-full object-cover"
                alt="feature"
                loading="lazy"
                {...{ "decoding": "async" }}
              />
              {" "}
              <div className="absolute inset-0 media-overlay" />
              <div className="absolute inset-x-0 bottom-0 p-6 z-10 flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-widest text-white">
                  Featured
                </span>
                {" "}
                <h3 className="text-2xl font-bold text-white">
                  Sample Featured Story
                </h3>
                <p className="text-sm text-white max-w-md line-clamp-3">
                  A brief sample tagline showing how a feature card looks with static content.
                </p>
                {" "}
                <button className="inline-flex items-center gap-1 mt-2 rounded-full bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] text-white font-semibold text-sm px-4 py-2 shadow-glow hover:from-[#A65592] hover:via-[#BB76BC] hover:to-[#FF8AD5] transition">
                  {"Open "}
                  <span className="material-symbols-rounded text-sm">
                    north_east
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* HoloGrid Lanes */}
      <main className="container pb-16">
        <div
          x-show="viewMode==='grid'"
          className="grid md:grid-cols-12 gap-6"
          {...{ "x-transition.opacity.duration.150ms": "" }}
        >
          {/* Lane A (wide) */}
          <section className="md:col-span-7 space-y-6">
            <template
              x-for="s in filteredStories().slice(0,4)"
              dangerouslySetInnerHTML={{ __html: "\n                    <article @click=\"openStory(s)\" class=\"cursor-pointer rounded-2xl holo-edge bg-white/[.04] ring-1 ring-white/10 overflow-hidden\">\n                        <div class=\"grid grid-cols-3 gap-0\">\n                            <figure class=\"col-span-1 aspect-[4/3] overflow-hidden\"><img :src=\"s.cover\" class=\"w-full h-full object-cover\" loading=\"lazy\" decoding=\"async\" alt=\"cover\">\n                            </figure>\n                            <div class=\"col-span-2 p-5 flex flex-col\">\n                                <h3 class=\"text-xl font-bold\" x-text=\"s.title\"></h3>\n                                <p class=\"mt-1 text-sm text-neutral-700 dark:text-white/70 line-clamp-2\" x-text=\"s.tagline\"></p>\n                                <div class=\"mt-auto pt-4\">\n                                    <div class=\"h-1.5 rounded-full bg-white/10 overflow-hidden\">\n                                        <div class=\"h-full bg-accent-300\" :style=\"'width:'+s.progress+'%'\"></div>\n                                    </div>\n                                    <div class=\"mt-1 text-[11px] text-white/50 flex justify-between\"><span x-text=\"s.progress+'%'\"></span><span x-text=\"s.chapters+' ch'\"></span></div>\n                                </div>\n                            </div>\n                        </div>\n                    </article>\n                " }}
              {...{ ":key": "s.id" }}
            />
          </section>
          {/* Lane B (stack + tiles) */}
          <section className="md:col-span-5 space-y-6">
            <template
              x-for="s in filteredStories().slice(4,6)"
              dangerouslySetInnerHTML={{ __html: "\n                    <article @click=\"openStory(s)\" class=\"cursor-pointer rounded-2xl holo-edge bg-white/[.04] ring-1 ring-white/10 overflow-hidden\">\n                        <div class=\"relative aspect-[16/9]\">\n                            <img :src=\"s.cover\" class=\"absolute inset-0 w-full h-full object-cover\" loading=\"lazy\" decoding=\"async\" alt=\"cover\">\n                            <div class=\"absolute inset-0 media-overlay\"></div>\n                            <div class=\"absolute bottom-0 p-5 media-overlay\">\n                                <h3 class=\"text-lg font-bold\" x-text=\"s.title\"></h3>\n                                <p class=\"tagline-text text-xs line-clamp-2\" x-text=\"s.tagline\"></p>\n                            </div>\n                        </div>\n                    </article>\n                " }}
              {...{ ":key": "s.id" }}
            />
            <div className="grid grid-cols-2 gap-6">
              <template
                x-for="s in filteredStories().slice(6,10)"
                dangerouslySetInnerHTML={{ __html: "\n                        <article @click=\"openStory(s)\" class=\"cursor-pointer rounded-2xl holo-edge bg-white/[.04] ring-1 ring-white/10 overflow-hidden\">\n                            <figure class=\"aspect-[4/3]\"><img :src=\"s.cover\" class=\"w-full h-full object-cover\" loading=\"lazy\" decoding=\"async\" alt=\"cover\"></figure>\n                            <div class=\"p-4\">\n                                <h4 class=\"font-semibold text-sm\" x-text=\"s.title\"></h4>\n                                <p class=\"text-[12px] text-white/60 line-clamp-2\" x-text=\"s.tagline\"></p>\n                            </div>\n                        </article>\n                    " }}
                {...{ ":key": "s.id" }}
              />
            </div>
          </section>
        </div>
        {/* Mosaic */}
        <section
          x-show="viewMode==='mosaic'"
          className="grid [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))] auto-rows-[200px] gap-6"
          {...{ "x-transition.opacity.duration.150ms": "" }}
        >
          <template
            x-for="s in filteredStories()"
            dangerouslySetInnerHTML={{ __html: "\n                <article @click=\"openStory(s)\" :class=\"'cursor-pointer rounded-2xl holo-edge bg-white/[.04] ring-1 ring-white/10 overflow-hidden '+span(s)\">\n                    <figure class=\"relative w-full h-full\">\n                        <img :src=\"s.cover\" class=\"absolute inset-0 w-full h-full object-cover\" loading=\"lazy\" decoding=\"async\" alt=\"cover\">\n                        <div class=\"absolute inset-0 media-overlay\"></div>\n                        <div class=\"absolute bottom-0 p-3 media-overlay\">\n                            <h4 class=\"font-semibold\" x-text=\"s.title\"></h4>\n                            <p class=\"tagline-text text-[12px] line-clamp-2\" x-text=\"s.tagline\"></p>\n                        </div>\n                    </figure>\n                </article>\n            " }}
            {...{ ":key": "s.id" }}
          />
        </section>
        {/* List */}
        <section
          x-show="viewMode==='list'"
          className="flex flex-col gap-4"
          {...{ "x-transition.opacity.duration.150ms": "" }}
        >
          <template
            x-for="s in filteredStories()"
            dangerouslySetInnerHTML={{ __html: "\n                <article @click=\"openStory(s)\" class=\"cursor-pointer rounded-xl holo-edge bg-white/[.04] ring-1 ring-white/10 overflow-hidden flex\">\n                    <figure class=\"w-56 aspect-[4/3] overflow-hidden\"><img :src=\"s.cover\" class=\"w-full h-full object-cover\" loading=\"lazy\" decoding=\"async\" alt=\"cover\"></figure>\n                    <div class=\"p-4 pr-6 flex-1\">\n                        <h4 class=\"text-lg font-semibold\" x-text=\"s.title\"></h4>\n                        <p class=\"text-sm text-neutral-700 dark:text-white/70 line-clamp-2 max-w-3xl\" x-text=\"s.tagline\"></p>\n                        <div class=\"mt-3 w-64\">\n                            <div class=\"h-1.5 rounded-full bg-white/10 overflow-hidden\">\n                                <div class=\"h-full bg-accent-300\" :style=\"'width:'+s.progress+'%'\"></div>\n                            </div>\n                        </div>\n                    </div>\n                </article>\n            " }}
            {...{ ":key": "s.id" }}
          />
        </section>
        {/* Empty */}
        <p x-show="filteredStories().length===0" className="text-center text-white/60 mt-12">
          No realms match. Try a different filter.
        </p>
      </main>
      {/* Favorites drawer removed as per request */}
      {/* Modal */}
      <div
        x-cloak=""
        x-show="modalOpen"
        className="fixed inset-0 z-40 flex items-center justify-center p-4"
        {...{ "x-transition.opacity": "" }}
      >
        <div className="absolute inset-0 bg-black/60" {...{ "x-on:click": "closeModal" }} />
        <div
          className="relative w-full max-w-3xl rounded-2xl overflow-hidden ring-1 ring-black/10 dark:ring-white/15 bg-white dark:bg-[#0f0f18]"
          {...{ "x-trap.noscroll.inert": "modalOpen", "x-transition.scale": "" }}
        >
          <div className="flex flex-col md:flex-row">
            <div className="relative md:w-1/2 aspect-[4/5] overflow-hidden">
              <img
                className="absolute inset-0 w-full h-full object-cover object-center"
                {...{ ":src": "activeStory?.cover", ":alt": "activeStory?.title + ' cover large'" }}
              />
              {" "}
              <div className="absolute inset-0 media-overlay" />
            </div>
            <div className="md:w-1/2 p-6 md:p-8 text-neutral-800 dark:text-white">
              <div className="flex items-start justify-between gap-4">
                <h2
                  className="text-2xl font-extrabold leading-tight"
                  x-text="activeStory?.title || 'Story Title'"
                >
                  {" Story Title"}
                </h2>
                {" "}
                <button
                  className="rounded-full p-2 bg-white/10 hover:bg-white/20"
                  {...{ "x-on:click": "closeModal" }}
                >
                  <span className="material-symbols-rounded">
                    close
                  </span>
                </button>
              </div>
              <p
                className="mt-3 text-sm text-white/80"
                x-text="activeStory?.description || 'Sample description placeholder for this story detailing its premise and key emotional hooks.'"
              />
              <div className="mt-5 grid grid-cols-3 gap-3 text-center text-[11px] font-medium">
                <div className="rounded-xl bg-white/10 p-3">
                  <span className="block text-base font-bold" x-text="activeStory?.chapters" />
                  Chapters
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <span className="block text-base font-bold" x-text="activeStory?.progress + '%' " />
                  Progress
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <span className="block text-base font-bold" x-text="activeStory?.rating" />
                  Rating
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-glow text-white bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] hover:from-[#A65592] hover:via-[#BB76BC] hover:to-[#FF8AD5] transition"
                  {...{ "x-on:click": "toggleFav(activeStory)" }}
                >
                  <span
                    className="material-symbols-rounded text-base"
                    x-text="activeStory?.fav? 'favorite':'favorite_border'"
                  />
                  {" "}
                  <span x-text="activeStory?.fav? 'Favorited':'Favorite'" />
                </button>
                {" "}
                <button
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ring-1 ring-white/20"
                  {...{ "x-on:click": "queueStory(activeStory)" }}
                >
                  <span className="material-symbols-rounded text-base">
                    playlist_add
                  </span>
                  {" Queue"}
                </button>
                {" "}
                <button className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-brand-700 hover:bg-brand-500 transition">
                  <span className="material-symbols-rounded text-base">
                    auto_stories
                  </span>
                  {" Continue"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="py-10 text-center text-[11px] text-white/50">
        Arcane narrative © Paper X Demo
      </footer>
      <script src="/_legacy/tales/romantasy/script-02.js" />
    </LegacyPage>
  );
}
