// Converted from ui/print/shop/profile.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/print/shop/profile/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Shop Profile — PaperX",
};

export default function PrintShopProfilePage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white transition-colors overflow-x-hidden"}}
      head={
        <>
          <link rel="icon" type="image/x-icon" href="../../assets/img/favicon.svg" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link rel="stylesheet" href="../../assets/css/tailwind.css" />
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"}
        rel="stylesheet"
      />
      <script src="/config.js" />
      <link rel="stylesheet" href="/_legacy/print/shop/profile/style-01.css" />
      <link rel="stylesheet" href="/_legacy/print/shop/profile/style-02.css" />
      <link rel="stylesheet" href="/_legacy/print/shop/profile/style-03.css" />
      <script src="/_legacy/print/shop/profile/script-01.js" />
      {/* ── original <body> ── */}
      {/* Ambient gradients */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-brand-500/15 blur-[110px] dark:bg-brand-500/30" />
        <div className="absolute top-[40%] -right-24 w-[380px] h-[380px] rounded-full bg-brand-700/15 blur-[120px] dark:bg-brand-700/35" />
      </div>
      {/* App bar */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-3">
          <a href="../index.html" className="flex items-center gap-2" aria-label="Paper X Home">
            {" "}
            <img src="../assets/img/logo-light.svg" alt="Paper X" className="h-7 w-auto dark:hidden" />
            {" "}
            <img src="../assets/img/logo-dark.svg" alt="Paper X" className="h-7 w-auto hidden dark:block" />
            {" "}
          </a>
          {" "}
          <nav className="hidden md:flex items-center gap-2 text-sm">
            <a href="./jobs.html" className="rounded-full px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">
              <span className="material-symbols-rounded text-base">
                assignment
              </span>
              {" Jobs"}
            </a>
            {" "}
            <button
              id="themeToggle"
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 ring-soft hover:bg-black/5 dark:hover:bg-white/5"
              aria-label="Toggle theme"
            >
              <span id="themeIcon" className="material-symbols-rounded">
                dark_mode
              </span>
            </button>
            {" "}
            <button
              id="logout"
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 ring-soft hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span className="material-symbols-rounded text-base">
                logout
              </span>
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="container py-6 space-y-6">
        {/* Title */}
        <section className="">
          <div className="flex flex-wrap items-center gap-3 justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                <span className="gradient-hero-text">
                  Shop Profile
                </span>
              </h1>
              <p className="text-[13px] opacity-80">
                Manage your shop details, capabilities, hours, and availability.
              </p>
            </div>
            <div className="text-[12px] opacity-80 text-right">
              <span id="chipShopId" />
              {" "}
              <span id="chipStatus" className="ml-3" />
            </div>
          </div>
          {/* Status, Hours, Actions — horizontal cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <section className="rounded-xl glass-card ring-1 ring-black/5 dark:ring-white/10 p-4">
              <h2 className="font-semibold mb-3 text-sm">
                <span className="gradient-hero-text">
                  Status
                </span>
              </h2>
              <div className="flex flex-col gap-2">
                <label className="inline-flex items-center gap-2 text-[13px]">
                  <input type="checkbox" id="is_open" />
                  {" Open now"}
                </label>
                {" "}
                <label className="inline-flex items-center gap-2 text-[13px]">
                  <input type="checkbox" id="paused" />
                  {" Pause orders"}
                </label>
              </div>
              <div className="mt-3 text-[11px] opacity-75">
                Toggle to control availability instantly.
              </div>
            </section>
            <section className="rounded-xl glass-card ring-1 ring-black/5 dark:ring-white/10 p-4">
              <h2 className="font-semibold mb-3 text-sm">
                <span className="gradient-hero-text">
                  Hours
                </span>
              </h2>
              <form id="formHours" className="grid gap-2 text-[13px]">
                <label className="grid gap-1">
                  {"Open time "}
                  <input
                    id="open_time"
                    type="time"
                    className="px-3 py-1 rounded-md ring-soft bg-white/90 dark:bg-white/5"
                  />
                  {" "}
                </label>
                {" "}
                <label className="grid gap-1">
                  {"Close time "}
                  <input
                    id="close_time"
                    type="time"
                    className="px-3 py-1 rounded-md ring-soft bg-white/90 dark:bg-white/5"
                  />
                  {" "}
                </label>
              </form>
            </section>
            <section className="rounded-xl glass-card ring-1 ring-black/5 dark:ring-white/10 p-4">
              <h2 className="font-semibold mb-3 text-sm">
                <span className="gradient-hero-text">
                  Actions
                </span>
              </h2>
              <div className="grid gap-2">
                <button
                  id="saveAll"
                  className="btn-primary inline-flex items-center gap-2 text-sm justify-center"
                >
                  <span className="material-symbols-rounded text-base">
                    save
                  </span>
                  {" Save changes"}
                </button>
                {" "}
                <a
                  href="./jobs.html"
                  className="btn-secondary inline-flex items-center gap-2 text-sm justify-center"
                >
                  <span className="material-symbols-rounded text-base">
                    assignment
                  </span>
                  {" Go to Jobs"}
                </a>
              </div>
            </section>
          </div>
        </section>
        {/* Profile content grid */}
        <section className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Main content area */}
          <div className="space-y-6">
            {/* Consolidated Shop details card */}
            <section className="rounded-xl glass-card ring-1 ring-black/5 dark:ring-white/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-xl md:text-2xl">
                  <span className="gradient-hero-text">
                    Shop Details
                  </span>
                </h2>
                <div className="text-[12px] opacity-75">
                  Manage logo, contact and address
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Logo column */}
                {/* Forms column (spans two grid columns) */}
                <div className="md:col-span-2 space-y-4">
                  {/* Manage Logo section */}
                  <div>
                    <h3 className="font-semibold mb-3">
                      <span className="gradient-hero-text">
                        Manage Logo
                      </span>
                    </h3>
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-white/60 dark:bg-white/5 flex items-center justify-center ring-1 ring-black/5 dark:ring-white/10">
                        <img id="logoPreview" alt="Shop logo" className="w-full h-full object-contain hidden" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <input id="logoFile" type="file" accept="image/*" className="text-[13px]" />
                        {" "}
                        <button
                          id="uploadLogo"
                          className="btn-secondary inline-flex items-center gap-2 text-sm"
                        >
                          <span className="material-symbols-rounded text-base">
                            upload
                          </span>
                          {" Upload"}
                        </button>
                        {" "}
                        <div id="logoMsg" className="text-[12px] opacity-80" />
                      </div>
                    </div>
                  </div>
                  {/* Basic Information section */}
                  <div>
                    <h3 className="font-semibold mb-2">
                      <span className="gradient-hero-text">
                        Basic Information
                      </span>
                    </h3>
                    <form id="formBasics" className="grid sm:grid-cols-2 gap-3 text-[13px]">
                      {/* Shop name (top) then contact fields */}
                      <label className="sm:col-span-2 grid gap-1">
                        {"Shop name "}
                        <input
                          id="name"
                          className="px-3 py-1 rounded-md ring-soft bg-white/90 dark:bg-white/5"
                          required
                        />
                        {" "}
                      </label>
                      {" "}
                      <label className="grid gap-1">
                        {"Contact phone "}
                        <input
                          id="phone"
                          className="px-3 py-1 rounded-md ring-soft bg-white/90 dark:bg-white/5"
                        />
                        {" "}
                      </label>
                      {" "}
                      <label className="sm:col-span-2 grid gap-1">
                        {"Email (login) "}
                        <input
                          id="email"
                          className="px-3 py-1 rounded-md ring-soft bg-white/70 dark:bg-white/5 opacity-75"
                          disabled
                        />
                        {" "}
                      </label>
                    </form>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">
                        <span className="gradient-hero-text">
                          {"Address & Location"}
                        </span>
                      </h3>
                      {" "}
                      <button id="useLoc" className="btn-secondary inline-flex items-center gap-1 text-[13px]">
                        <span className="material-symbols-rounded text-base">
                          my_location
                        </span>
                        Use my location
                      </button>
                    </div>
                    <form id="formAddress" className="grid gap-3 text-[13px]">
                      <label className="grid gap-1">
                        {"Full address "}
                        <textarea
                          id="address"
                          rows={3}
                          className="px-3 py-1 rounded-md ring-soft bg-white/90 dark:bg-white/5"
                        />
                        {" "}
                      </label>
                      {" "}
                      <div className="grid sm:grid-cols-2 gap-3">
                        <label className="grid gap-1">
                          {"Latitude "}
                          <input
                            id="lat"
                            type="number"
                            step="0.000001"
                            className="px-3 py-1 rounded-md ring-soft bg-white/90 dark:bg-white/5"
                          />
                          {" "}
                        </label>
                        {" "}
                        <label className="grid gap-1">
                          {"Longitude "}
                          <input
                            id="lng"
                            type="number"
                            step="0.000001"
                            className="px-3 py-1 rounded-md ring-soft bg-white/90 dark:bg-white/5"
                          />
                          {" "}
                        </label>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </section>
            {/* Capabilities */}
            <section className="rounded-3xl glass-card ring-1 ring-black/5 dark:ring-white/10 p-5">
              <h2 className="font-semibold mb-3">
                <span className="gradient-hero-text">
                  Capabilities
                </span>
              </h2>
              <form id="formCaps" className="grid gap-3 text-[13px]">
                <div className="grid sm:grid-cols-3 gap-3">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" id="cap_color" />
                    {" Color printing"}
                  </label>
                  {" "}
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" id="cap_bw" />
                    {" B/W printing"}
                  </label>
                  {" "}
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" id="cap_duplex" />
                    {" Duplex"}
                  </label>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <label>
                    {"Supported sizes "}
                    <select
                      id="cap_sizes"
                      multiple
                      className="mt-1 w-full px-3 py-1 rounded-md ring-soft bg-white/90 dark:bg-white/5"
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
                      <option>
                        Legal
                      </option>
                    </select>
                    {" "}
                  </label>
                  {" "}
                  <label>
                    {"Binding "}
                    <select
                      id="cap_binding"
                      multiple
                      className="mt-1 w-full px-3 py-1 rounded-md ring-soft bg-white/90 dark:bg-white/5"
                    >
                      <option>
                        staple
                      </option>
                      <option>
                        spiral
                      </option>
                      <option>
                        tape
                      </option>
                    </select>
                    {" "}
                  </label>
                  {" "}
                  <label>
                    {"Price hint "}
                    <input
                      id="price_hint"
                      className="mt-1 w-full px-3 py-1 rounded-md ring-soft bg-white/90 dark:bg-white/5"
                      placeholder="Eg. A4 B/W from ₹1/page"
                    />
                    {" "}
                  </label>
                </div>
              </form>
            </section>
            {/* Pricing */}
            <section className="rounded-3xl glass-card ring-1 ring-black/5 dark:ring-white/10 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold">
                  <span className="gradient-hero-text">
                    Pricing (per page tiers)
                  </span>
                </h2>
                <div className="flex items-center gap-3">
                  <div className="text-[12px] opacity-80">
                    Leave min/upto blank for open-ended
                  </div>
                  {" "}
                  <button id="loadSampleTiers" className="btn-secondary text-[13px]">
                    Load sample tiers
                  </button>
                </div>
              </div>
              <div id="pricingForms" className="grid gap-5 text-[13px]">
                {/* Sections rendered by JS: bw_single, bw_duplex, color_single, color_duplex */}
              </div>
            </section>
          </div>
          {/* Right column: Status & hours - REMOVED (moved to top horizontal cards) */}
        </section>
      </main>
      {/* Toast */}
      <div id="toast" className="fixed bottom-4 left-1/2 -translate-x-1/2 hidden">
        <div className="px-4 py-2 rounded-xl bg-brand-500 text-white shadow">
          <span id="toastMsg" className="text-sm" />
        </div>
      </div>
      <script src="/_legacy/print/shop/profile/script-02.js" />
    </LegacyPage>
  );
}
