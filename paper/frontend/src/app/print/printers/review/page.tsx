// Converted from ui/print/printers/review.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/print/printers/review/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Review Job at PaperX",
};

export default function PrintPrintersReviewPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-glow dark:bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(158,75,138,.22),transparent),radial-gradient(900px_500px_at_110%_10%,rgba(30,30,47,.7),transparent)]"}}
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
      <script src="/_legacy/print/printers/review/script-01.js" />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      <link rel="stylesheet" href="/_legacy/print/printers/review/style-01.css" />
      {/* ── original <body> ── */}
      {/* App Bar */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-brand-900/60 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <a
            href="#"
            data-px-onclick="history.back();return false;"
            className="inline-flex items-center gap-2"
            data-px=""
          >
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
            Review Job
          </div>
          <div className="flex items-center gap-3">
            <button
              id="themeToggle"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full ring-soft hover:shadow-elev-1 transition"
            >
              <span id="themeIcon" className="material-symbols-rounded text-base">
                dark_mode
              </span>
              {" "}
              <span className="text-sm">
                Theme
              </span>
            </button>
            {" "}
            <a href="../orders/index.html" className="text-sm hover:underline">
              My Prints
            </a>
          </div>
        </div>
      </header>
      {/* Stepper */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <ol className="grid grid-cols-3 gap-2 text-[12px]">
          <li className="flex items-center gap-2 rounded-lg px-3 py-2 bg-brand-500/10 ring-1 ring-brand-500/30">
            <span className="material-symbols-rounded text-base">
              tune
            </span>
            {" Settings "}
          </li>
          <li className="flex items-center gap-2 rounded-lg px-3 py-2 bg-brand-500/10 ring-1 ring-brand-500/30">
            <span className="material-symbols-rounded text-base">
              storefront
            </span>
            {" Shop "}
          </li>
          <li className="flex items-center gap-2 rounded-lg px-3 py-2 bg-brand-500 text-white">
            <span className="material-symbols-rounded text-base">
              check_circle
            </span>
            {" Review & Submit "}
          </li>
        </ol>
      </div>
      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Summary (sticky) */}
        <section className="lg:col-span-7">
          <div className="relative">
            <div className="absolute -inset-1 rounded-3xl blur-2xl bg-gradient-to-br from-brand-500/20 to-brand-700/20 -z-10" />
            <div className="glass rounded-3xl ring-1 ring-black/5 dark:ring-white/10 p-5 lg:p-6 shadow-neon lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold">
                  Summary
                </div>
                {" "}
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-200 ring-1 ring-brand-500/30">
                  {" "}
                  <span className="material-symbols-rounded text-sm">
                    print
                  </span>
                  {" Print Job "}
                </span>
              </div>
              {/* Shop */}
              <div id="shop" className="text-[13px] opacity-90 mb-3">
                {/* Filled by JS */}
                <div className="animate-pulse h-10 rounded-md bg-white/50 dark:bg-white/10 ring-soft" />
              </div>
              {/* Settings List */}
              <div id="settings" className="text-[13px]">
                {/* Filled by JS */}
                <div className="space-y-2">
                  <div className="animate-pulse h-5 rounded bg-white/50 dark:bg-white/10" />
                  <div className="animate-pulse h-5 rounded bg-white/50 dark:bg-white/10 w-2/3" />
                  <div className="animate-pulse h-5 rounded bg-white/50 dark:bg-white/10 w-1/2" />
                </div>
              </div>
              <hr className="my-5 border-black/10 dark:border-white/10" />
              {/* Live totals */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div id="est" className="text-[12px] opacity-80" />
                  <div id="price" className="text-sm font-semibold mt-1" />
                  <div id="priceNote" className="text-[11px] opacity-70 mt-1 hidden" />
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-70">
                    Pickup
                  </div>
                  <div id="pickupPreview" className="text-sm font-semibold">
                    -
                  </div>
                </div>
              </div>
              {/* Informational footer */}
              <div className="mt-4 text-[12px] opacity-75 flex items-start gap-2">
                <span className="material-symbols-rounded text-base">
                  info
                </span>
                {" "}
                <p>
                  You will receive an OTP after submission. Share it at pickup for a secure handover.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Right: Form */}
        <section className="lg:col-span-5">
          <div className="glass rounded-3xl ring-1 ring-black/5 dark:ring-white/10 p-5 lg:p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-rounded">
                event_available
              </span>
              {" "}
              <h2 className="text-lg font-semibold">
                {"Pickup & Contact"}
              </h2>
            </div>
            <form id="reviewForm" className="grid grid-cols-1 gap-4 text-[13px]">
              {/* Pickup Window */}
              <label className="block">
                {" "}
                <span className="text-xs opacity-80">
                  Pickup Window
                </span>
                {" "}
                <select
                  name="pickup_window"
                  id="pickup_window"
                  className="mt-1 w-full px-3 py-2 rounded-lg ring-soft bg-white/80 dark:bg-white/5 focus-ring"
                >
                  <option>
                    Now
                  </option>
                  <option>
                    Today
                  </option>
                  <option>
                    Tomorrow
                  </option>
                  <option>
                    Custom
                  </option>
                </select>
                {" "}
              </label>
              {" "}
              {/* Custom date/time (hidden until Custom) */}
              <div id="customWrap" className="grid grid-cols-2 gap-3 hidden">
                <label className="block col-span-1">
                  {" "}
                  <span className="text-xs opacity-80">
                    Date
                  </span>
                  {" "}
                  <input
                    type="date"
                    id="customDate"
                    className="mt-1 w-full px-3 py-2 rounded-lg ring-soft bg-white/80 dark:bg-white/5 focus-ring"
                  />
                  {" "}
                </label>
                {" "}
                <label className="block col-span-1">
                  {" "}
                  <span className="text-xs opacity-80">
                    Time
                  </span>
                  {" "}
                  <input
                    type="time"
                    id="customTime"
                    className="mt-1 w-full px-3 py-2 rounded-lg ring-soft bg-white/80 dark:bg-white/5 focus-ring"
                  />
                  {" "}
                </label>
              </div>
              {/* Pickup For */}
              <div className="block">
                <span className="text-xs opacity-80">
                  Pickup For
                </span>
                {" "}
                <div className="mt-1 flex items-center gap-6">
                  <label className="inline-flex items-center gap-2">
                    {" "}
                    <input type="radio" name="contact_for" id="for_me" value="me" defaultChecked />
                    {" "}
                    <span>
                      For me
                    </span>
                    {" "}
                  </label>
                  {" "}
                  <label className="inline-flex items-center gap-2">
                    {" "}
                    <input type="radio" name="contact_for" id="for_others" value="other" />
                    {" "}
                    <span>
                      For others
                    </span>
                    {" "}
                  </label>
                </div>
                <div id="meInfo" className="text-[11px] opacity-70 mt-1 hidden" />
              </div>
              <div id="contactFields" className="grid grid-cols-1 gap-4">
                {/* Name */}
                <label className="block">
                  {" "}
                  <span className="text-xs opacity-80">
                    Name
                  </span>
                  {" "}
                  <input
                    name="contact_name"
                    id="contact_name"
                    required
                    className="mt-1 w-full px-3 py-2 rounded-lg ring-soft bg-white/80 dark:bg-white/5 focus-ring"
                    placeholder="Your name"
                  />
                  {" "}
                </label>
                {" "}
                {/* Phone with lightweight mask */}
                <label className="block">
                  {" "}
                  <span className="text-xs opacity-80">
                    Phone
                  </span>
                  {" "}
                  <input
                    name="contact_phone"
                    id="contact_phone"
                    inputMode="tel"
                    maxLength={14}
                    className="mt-1 w-full px-3 py-2 rounded-lg ring-soft bg-white/80 dark:bg-white/5 focus-ring"
                    placeholder="+91 9XXXXXXXXX"
                  />
                  {" "}
                  <span className="text-[11px] opacity-70">
                    {"We'll share status updates and OTP to this number."}
                  </span>
                  {" "}
                </label>
              </div>
              {" "}
              {/* Terms */}
              <label className="flex items-start gap-2">
                {" "}
                <input type="checkbox" id="terms" className="mt-0.5" />
                {" "}
                <span>
                  {"I confirm I won't print illegal/copyright content."}
                </span>
                {" "}
              </label>
              {" "}
              {/* CTA row */}
              <div className="flex items-center justify-between pt-1">
                <div id="status" className="text-[12px] opacity-80" />
                {" "}
                <button
                  id="submit"
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white hover:bg-brand-700 active:scale-[.99] transition shadow-elev-2"
                >
                  <span className="material-symbols-rounded text-base">
                    send
                  </span>
                  {" "}
                  <span>
                    Submit Job
                  </span>
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
      {/* Toast */}
      <div id="toast" className="fixed bottom-4 left-1/2 -translate-x-1/2 hidden">
        <div className="px-4 py-2 rounded-xl bg-brand-500 text-white shadow-elev-2">
          <span id="toastMsg" className="text-sm" />
        </div>
      </div>
      <script src="/_legacy/print/printers/review/script-02.js" />
    </LegacyPage>
  );
}
