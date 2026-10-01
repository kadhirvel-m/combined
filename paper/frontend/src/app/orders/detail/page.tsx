// Converted from ui/orders/detail.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/orders/detail/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Job Details — PaperX",
};

export default function OrdersDetailPage() {
  return (
    <LegacyPage
      html={{"lang":"en"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark"}}
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="/config.js" />
      <script
        src="https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js"
        integrity="sha384-Dr98ddmUw2QkdCarNQ+OL7xLty7cSxgR0T7v1tq4UErS/qLV0132sBYTolRAFuOV"
        crossOrigin="anonymous"
      />
      {/* ── original <body> ── */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-3">
          <a href="./index.html" className="flex items-center gap-2">
            <span className="material-symbols-rounded">
              arrow_back
            </span>
            Back
          </a>
          {" "}
          <h1 className="text-lg font-bold">
            Job
          </h1>
          {" "}
          <span />
        </div>
      </header>
      <main className="container py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 glass rounded-2xl p-4 ring-1 ring-black/5 dark:ring-white/10">
          <div id="summary" className="text-sm" />
          <div id="events" className="mt-3 space-y-1 text-[13px]" />
        </section>
        <section className="lg:col-span-4 glass rounded-2xl p-4 ring-1 ring-black/5 dark:ring-white/10 text-center">
          <div className="text-xs opacity-70">
            OTP
          </div>
          <div id="otp" className="font-mono text-2xl tracking-widest">
            ------
          </div>
          {" "}
          <canvas id="qr" className="mt-2 mx-auto" />
          {" "}
          <div className="mt-3 flex items-center justify-center gap-2">
            <button id="show" className="px-3 py-2 rounded-md ring-1 ring-black/10 dark:ring-white/15">
              Show OTP
            </button>
            {" "}
            <button id="directions" className="px-3 py-2 rounded-md ring-1 ring-black/10 dark:ring-white/15">
              Directions
            </button>
          </div>
        </section>
      </main>
      <script src="/_legacy/orders/detail/script-01.js" />
    </LegacyPage>
  );
}
