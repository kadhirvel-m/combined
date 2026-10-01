// Converted from ui/print/index.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/print/index/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Paper X — Print Network (Home)",
};

export default function PrintIndexPage() {
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
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"}
        rel="stylesheet"
      />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      <link rel="stylesheet" href="/_legacy/print/index/style-01.css" />
      <script src="/_legacy/print/index/script-01.js" />
      {/* ── original <body> ── */}
      {/* Announcement ribbon */}
      <div className="w-full text-xs text-neutral-700 dark:text-white/85 bg-brandlt-100/70 dark:bg-brand-700/20 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center gap-2 py-2">
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-brandlt-200 dark:bg-brand-500/20 ring-1 ring-brandlt-300 dark:ring-brand-500/40">
            Beta
          </span>
          {" "}
          <p className="truncate">
            Free during beta • No KYC • Keep cash-at-counter
          </p>
          {" "}
          <span className="ml-auto">
            →
          </span>
        </div>
      </div>
      {/* NAV */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-3">
          <a href="../index.html" className="flex items-center gap-3" aria-label="Paper X Home">
            {" "}
            <img src="../assets/img/logo-light.svg" alt="Paper X" className="h-8 w-auto dark:hidden" />
            {" "}
            <img src="../assets/img/logo-dark.svg" alt="Paper X" className="h-8 w-auto hidden dark:block" />
            {" "}
          </a>
          {" "}
          <nav className="hidden md:flex items-center gap-2 text-sm">
            <a
              href="./printers/shops.html"
              className="rounded-full px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
            >
              Find Shops
            </a>
            {" "}
            <a
              href="../orders/index.html"
              className="rounded-full px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
            >
              My Prints
            </a>
            {" "}
            <a
              href="shop/jobs.html"
              className="rounded-full px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
            >
              Jobs Dashboard
            </a>
            {" "}
            <a
              href="shop/profile.html"
              className="rounded-full px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
            >
              {" "}
              <span className="material-symbols-rounded text-base">
                account_circle
              </span>
              {" Shop Profile "}
            </a>
            {" "}
            <a
              href="shop/signup.html"
              className="rounded-full px-3 py-2 bg-brand-500/90 text-white hover:bg-brand-600"
            >
              List Your Shop
            </a>
            {" "}
            <button
              id="themeToggle"
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 ring-soft hover:bg-black/5 dark:hover:bg-white/5"
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
              href="../shop/jobs.html"
              className="inline-flex items-center justify-center size-10 rounded-full ring-soft hover:bg-black/5 dark:hover:bg-white/5"
              title="Jobs"
            >
              {" "}
              <span className="material-symbols-rounded">
                assignment
              </span>
              {" "}
            </a>
            {" "}
            <a
              href="shop/profile.html"
              className="inline-flex items-center justify-center size-10 rounded-full ring-soft hover:bg-black/5 dark:hover:bg-white/5"
              title="Profile"
            >
              {" "}
              <span className="material-symbols-rounded">
                account_circle
              </span>
              {" "}
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
      {/* HERO */}
      <section className="relative overflow-hidden py-10 md:py-16">
        {/* decorative orbs */}
        <div className="pointer-events-none absolute -top-24 -right-24 size-[420px] rounded-full bg-brand-500/20 blur-3xl dark:blur-[90px]" />
        <div className="pointer-events-none absolute top-24 -left-24 size-[360px] rounded-full bg-brand-700/20 blur-3xl dark:blur-[90px]" />
        <div className="container">
          <div className="relative">
            {/* Main Hero Content */}
            <div className="glass rounded-[40px] ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
              <div className="grid lg:grid-cols-[1fr_1fr] gap-0">
                {/* Left: Hero Text */}
                <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center relative">
                  <div className="absolute top-6 right-6 lg:hidden">
                    <span className="inline-flex items-center gap-2 badge px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30 text-[11px] font-semibold">
                      {" "}
                      <span className="relative flex h-2 w-2">
                        {" "}
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        {" "}
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        {" "}
                      </span>
                      {" BETA • FREE "}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-5xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] gradient-hero-text">
                    {" Bring walk‑ins online. Get more orders. "}
                  </h1>
                  <p className="mt-5 text-base md:text-lg text-neutral-700 dark:text-white/70 max-w-xl">
                    {" List your shop, accept print jobs from students nearby, and hand over with OTP & QR. "}
                    <span className="font-semibold text-brand-600 dark:text-brand-400">
                      No new hardware needed.
                    </span>
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <a
                      href="shop/signup.html"
                      className="inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold hover:from-brand-600 hover:to-brand-700 shadow-[0_8px_22px_rgba(158,75,138,0.35)] hover:shadow-[0_12px_28px_rgba(158,75,138,0.45)] transition-all"
                    >
                      {" "}
                      <span className="material-symbols-rounded text-base">
                        rocket_launch
                      </span>
                      {" Start free "}
                    </a>
                    {" "}
                    <a
                      href="shop/login.html"
                      className="inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10 font-medium transition-all"
                    >
                      {" "}
                      <span className="material-symbols-rounded text-base">
                        login
                      </span>
                      {" Owner login "}
                    </a>
                  </div>
                  {/* Stats Bar */}
                  <div className="mt-10 pt-8 border-t border-black/5 dark:border-white/10">
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <div className="text-3xl font-extrabold text-brand-500">
                          0%
                        </div>
                        <div className="text-xs opacity-70 mt-1">
                          New hardware
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-extrabold text-brand-500">
                          OTP
                        </div>
                        <div className="text-xs opacity-70 mt-1">
                          Secure pickup
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-extrabold text-brand-500">
                          5–10km
                        </div>
                        <div className="text-xs opacity-70 mt-1">
                          Local reach
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Right: Animation + Feature Cards */}
                <div className="p-6 md:p-8 lg:p-10 bg-gradient-to-br from-brand-500/5 to-brand-700/10 dark:from-brand-500/10 dark:to-brand-700/20 border-l border-black/5 dark:border-white/10 flex flex-col justify-center">
                  <div className="hidden lg:flex justify-end mb-6">
                    <span className="inline-flex items-center gap-2 badge px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30 text-[11px] font-semibold">
                      {" "}
                      <span className="relative flex h-2 w-2">
                        {" "}
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        {" "}
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        {" "}
                      </span>
                      {" BETA • FREE "}
                    </span>
                  </div>
                  {/* Animation/Image Placeholder */}
                  <div className="relative h-56 rounded-2xl overflow-hidden ring-2 ring-yellow-400/50 bg-gradient-to-br from-brand-900/20 to-brand-800/30 flex items-center justify-center mb-6">
                    <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                      <source src="../assets/video/print-shop-demo.mp4" type="video/mp4" />
                      <source src="../assets/video/print-shop-demo.webm" type="video/webm" />
                    </video>
                  </div>
                  <div className="space-y-3">
                    {/* Jobs Board Card */}
                    <div className="group rounded-3xl ring-1 ring-black/5 dark:ring-white/10 p-5 bg-white/80 dark:bg-white/5 hover:ring-brand-500/30 hover:bg-brand-500/5 transition-all cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="size-10 rounded-2xl bg-brand-500/15 text-brand-600 grid place-content-center flex-shrink-0">
                          <span className="material-symbols-rounded text-lg">
                            assignment
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm mb-1">
                            Jobs Board
                          </div>
                          <div className="text-[12px] opacity-80 leading-relaxed">
                            {"View jobs with print settings • Apply & print • Mark ready"}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Grid of 2 smaller cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="group rounded-3xl ring-1 ring-black/5 dark:ring-white/10 p-4 bg-white/80 dark:bg-white/5 hover:ring-brand-500/30 hover:bg-brand-500/5 transition-all cursor-pointer">
                        <div className="size-8 rounded-xl bg-brand-500/15 text-brand-600 grid place-content-center mb-3">
                          <span className="material-symbols-rounded text-base">
                            qr_code_2
                          </span>
                        </div>
                        <div className="font-semibold text-xs mb-1">
                          OTP Ticket
                        </div>
                        <div className="text-[11px] opacity-80 leading-snug">
                          {"Secure pickup verification "}
                        </div>
                      </div>
                      <div className="group rounded-3xl ring-1 ring-black/5 dark:ring-white/10 p-4 bg-white/80 dark:bg-white/5 hover:ring-brand-500/30 hover:bg-brand-500/5 transition-all cursor-pointer">
                        <div className="size-8 rounded-xl bg-brand-500/15 text-brand-600 grid place-content-center mb-3">
                          <span className="material-symbols-rounded text-base">
                            store
                          </span>
                        </div>
                        <div className="font-semibold text-xs mb-1">
                          Shop Profile
                        </div>
                        <div className="text-[11px] opacity-80 leading-snug">
                          {"Capabilities & timings"}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Bottom Actions */}
                  <div className="mt-6 pt-6 border-t border-black/5 dark:border-white/10 flex flex-wrap gap-2">
                    <a
                      href="shop/jobs.html"
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 transition-all"
                    >
                      {" "}
                      <span className="material-symbols-rounded text-sm">
                        assignment
                      </span>
                      {" Jobs Board "}
                    </a>
                    {" "}
                    <a
                      href="./printers/shops.html"
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 ring-1 ring-black/10 dark:ring-white/15 text-xs font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-all"
                    >
                      {" "}
                      <span className="material-symbols-rounded text-sm">
                        storefront
                      </span>
                      {" Student view "}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* VALUE FOR SHOP OWNERS */}
      <section className="py-14 border-y border-black/5 dark:border-white/10">
        <div className="container">
          <header className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight gradient-hero-text">
              Why shop owners love Paper X Print
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-white/70">
              More orders, less chaos, same printers.
            </p>
          </header>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <article className="rounded-2xl p-5 glass ring-1 ring-black/5 dark:ring-white/10">
              <div className="size-10 grid place-content-center rounded-xl bg-brand-500/15 text-brand-600 mb-2">
                <span className="material-symbols-rounded">
                  groups
                </span>
              </div>
              <h3 className="font-semibold">
                Reach nearby students
              </h3>
              <p className="text-[13px] opacity-90 mt-1">
                Appear in local search with distance, timings, and capabilities.
              </p>
            </article>
            <article className="rounded-2xl p-5 glass ring-1 ring-black/5 dark:ring-white/10">
              <div className="size-10 grid place-content-center rounded-xl bg-brand-500/15 text-brand-600 mb-2">
                <span className="material-symbols-rounded">
                  task_alt
                </span>
              </div>
              <h3 className="font-semibold">
                Clear job tickets
              </h3>
              <p className="text-[13px] opacity-90 mt-1">
                Copies, duplex, GSM, N‑up, finishing — everything in one view.
              </p>
            </article>
            <article className="rounded-2xl p-5 glass ring-1 ring-black/5 dark:ring-white/10">
              <div className="size-10 grid place-content-center rounded-xl bg-brand-500/15 text-brand-600 mb-2">
                <span className="material-symbols-rounded">
                  lock
                </span>
              </div>
              <h3 className="font-semibold">
                Secure handover
              </h3>
              <p className="text-[13px] opacity-90 mt-1">
                OTP + QR confirms pickup. No confusion, no duplicates.
              </p>
            </article>
            <article className="rounded-2xl p-5 glass ring-1 ring-black/5 dark:ring-white/10">
              <div className="size-10 grid place-content-center rounded-xl bg-brand-500/15 text-brand-600 mb-2">
                <span className="material-symbols-rounded">
                  schedule
                </span>
              </div>
              <h3 className="font-semibold">
                Open / Pause anytime
              </h3>
              <p className="text-[13px] opacity-90 mt-1">
                Control availability when you’re busy or closed.
              </p>
            </article>
            <article className="rounded-2xl p-5 glass ring-1 ring-black/5 dark:ring-white/10">
              <div className="size-10 grid place-content-center rounded-xl bg-brand-500/15 text-brand-600 mb-2">
                <span className="material-symbols-rounded">
                  payments
                </span>
              </div>
              <h3 className="font-semibold">
                Cash‑at‑counter
              </h3>
              <p className="text-[13px] opacity-90 mt-1">
                {"No online payments/KYC right now — keep your existing flow. "}
              </p>
            </article>
            <article className="rounded-2xl p-5 glass ring-1 ring-black/5 dark:ring-white/10">
              <div className="size-10 grid place-content-center rounded-xl bg-brand-500/15 text-brand-600 mb-2">
                <span className="material-symbols-rounded">
                  print
                </span>
              </div>
              <h3 className="font-semibold">
                Works with any printer
              </h3>
              <p className="text-[13px] opacity-90 mt-1">
                No integrations needed. Use your usual print software.
              </p>
            </article>
          </div>
          <div className="mt-8 flex items-center justify-center gap-3">
            <a
              href="./printers/shops.html"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 bg-brand-500 text-white font-semibold hover:bg-brand-700"
            >
              {" "}
              <span className="material-symbols-rounded text-base">
                storefront
              </span>
              {" Find shops "}
            </a>
            {" "}
            <a
              href="../orders/index.html"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 ring-soft hover:bg-black/5 dark:hover:bg-white/10"
            >
              {" "}
              <span className="material-symbols-rounded text-base">
                receipt_long
              </span>
              {" My prints "}
            </a>
          </div>
        </div>
      </section>
      {/* BEFORE vs AFTER (comparison table) */}
      <section className="py-16 border-y border-black/5 dark:border-white/10">
        <div className="container max-w-6xl">
          <header className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight gradient-hero-text">
              Before vs After Paper X
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-white/70">
              See how your counter changes, day one.
            </p>
          </header>
          <div className="overflow-hidden rounded-3xl glass ring-1 ring-black/5 dark:ring-white/10">
            <div className="grid md:grid-cols-2">
              <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-black/5 dark:border-white/10">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold mb-4">
                  <span className="material-symbols-rounded">
                    cancel
                  </span>
                  {" Before"}
                </div>
                {/* Before Image */}
                <div className="relative h-64 rounded-2xl overflow-hidden ring-2 ring-rose-400/30 mb-4">
                  <img
                    src="../assets/img/about pic/before.png"
                    alt="Before Paper X - Manual print shop chaos"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <ul className="mt-3 text-[13px] space-y-2 opacity-90 text-center">
                  <li>
                    • Students wait in line to explain print settings
                  </li>
                  <li>
                    • Wrong copies/duplex due to miscommunication
                  </li>
                  <li>
                    • Lost slips or mixed stacks at pickup
                  </li>
                  <li>
                    • No visibility on rush hours; chaos
                  </li>
                </ul>
              </div>
              <div className="p-6 md:p-8 bg-emerald-50/70 dark:bg-emerald-400/10">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold mb-4">
                  <span className="material-symbols-rounded">
                    check_circle
                  </span>
                  {" After "}
                </div>
                {/* After Image */}
                <div className="relative h-64 rounded-2xl overflow-hidden ring-2 ring-emerald-400/30 mb-4">
                  <img
                    src="../assets/img/about pic/after.png"
                    alt="After Paper X - Organized digital workflow"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <ul className="mt-3 text-[13px] space-y-2 opacity-90 text-center">
                  <li>
                    • Jobs come pre‑configured (copies, duplex, GSM, finishing)
                  </li>
                  <li>
                    {"• You print and mark "}
                    <em>
                      Ready
                    </em>
                    {" in Jobs Board"}
                  </li>
                  <li>
                    • Pickup via OTP/QR — no mix‑ups
                  </li>
                  <li>
                    • Pause/Open your listing to control flow
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* HOW IT WORKS (owners) */}
      <section className="py-16">
        <div className="container max-w-6xl">
          <header className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight gradient-hero-text">
              How it works for shop owners
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-white/70">
              {"Four steps to start getting online orders. "}
            </p>
          </header>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <li className="glass rounded-2xl ring-1 ring-black/5 dark:ring-white/10 p-5">
              <div className="flex items-center gap-3">
                <span className="size-8 grid place-content-center rounded-full bg-brand-500 text-white text-sm font-bold">
                  1
                </span>
                {" "}
                <h3 className="font-semibold">
                  Create your account
                </h3>
              </div>
              <p className="mt-2 text-[13px] opacity-90">
                Add shop name, address, phone, email, and capabilities.
              </p>
            </li>
            <li className="glass rounded-2xl ring-1 ring-black/5 dark:ring-white/10 p-5">
              <div className="flex items-center gap-3">
                <span className="size-8 grid place-content-center rounded-full bg-brand-700 text-white text-sm font-bold">
                  2
                </span>
                {" "}
                <h3 className="font-semibold">
                  {"Set pricing & hours"}
                </h3>
              </div>
              <p className="mt-2 text-[13px] opacity-90">
                {"Configure per‑page hints, bindings, GSM; toggle Open/Pause. "}
              </p>
            </li>
            <li className="glass rounded-2xl ring-1 ring-black/5 dark:ring-white/10 p-5">
              <div className="flex items-center gap-3">
                <span className="size-8 grid place-content-center rounded-full bg-brand-500 text-white text-sm font-bold">
                  3
                </span>
                {" "}
                <h3 className="font-semibold">
                  Process jobs
                </h3>
              </div>
              <p className="mt-2 text-[13px] opacity-90">
                See queued jobs, print, and mark “Ready”.
              </p>
            </li>
            <li className="glass rounded-2xl ring-1 ring-black/5 dark:ring-white/10 p-5">
              <div className="flex items-center gap-3">
                <span className="size-8 grid place-content-center rounded-full bg-brand-700 text-white text-sm font-bold">
                  4
                </span>
                {" "}
                <h3 className="font-semibold">
                  Hand over with OTP
                </h3>
              </div>
              <p className="mt-2 text-[13px] opacity-90">
                {"Verify OTP/QR and mark \"Picked\". Done."}
              </p>
            </li>
          </ol>
          <div className="mt-12 flex items-center justify-center gap-3">
            <a
              href="shop/signup.html"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 bg-brand-500 text-white font-semibold hover:bg-brand-700"
            >
              {" "}
              <span className="material-symbols-rounded text-base">
                rocket_launch
              </span>
              {" Start as shop owner "}
            </a>
          </div>
        </div>
      </section>
      {/* FAQ */}
      <section className="py-14">
        <div className="container max-w-5xl">
          <header className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight gradient-hero-text">
              FAQs
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-white/70">
              Everything you need to know.
            </p>
          </header>
          <div className="grid md:grid-cols-2 gap-4">
            <article className="glass rounded-2xl ring-1 ring-black/5 dark:ring-white/10 p-5">
              <h3 className="font-semibold">
                Do I need special hardware?
              </h3>
              <p className="text-[13px] opacity-90 mt-1">
                No. Use your current printers and workflow. Paper X only organizes jobs.
              </p>
            </article>
            <article className="glass rounded-2xl ring-1 ring-black/5 dark:ring-white/10 p-5">
              <h3 className="font-semibold">
                How do students pay?
              </h3>
              <p className="text-[13px] opacity-90 mt-1">
                Right now, they pay at your counter. Online payments/KYC are out of scope for beta.
              </p>
            </article>
            <article className="glass rounded-2xl ring-1 ring-black/5 dark:ring-white/10 p-5">
              <h3 className="font-semibold">
                Is pickup secure?
              </h3>
              <p className="text-[13px] opacity-90 mt-1">
                Yes. Each job generates an OTP and QR; you verify before handover.
              </p>
            </article>
            <article className="glass rounded-2xl ring-1 ring-black/5 dark:ring-white/10 p-5">
              <h3 className="font-semibold">
                What about illegal/copyright prints?
              </h3>
              <p className="text-[13px] opacity-90 mt-1">
                Students must accept terms stating they won’t print illegal/copyright content.
              </p>
            </article>
          </div>
        </div>
      </section>
      {/* FOOTER MINI */}
      <footer className="border-t border-black/5 dark:border-white/10">
        <div className="container py-8 text-[13px] flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="opacity-80">
            {"© "}
            <span id="y" />
            {" Paper X • Print Network"}
          </div>
          <div className="flex items-center gap-3">
            <a href="../index.html" className="hover:underline">
              Main site
            </a>
            {" "}
            <a href="shop/login.html" className="hover:underline">
              Owner login
            </a>
            {" "}
            <a href="shop/signup.html" className="hover:underline">
              Sign up
            </a>
          </div>
        </div>
      </footer>
      <script src="/_legacy/print/index/script-02.js" />
    </LegacyPage>
  );
}
