// Converted from ui/orders/index.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/orders/index/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "My Prints — PaperX",
};

export default function OrdersIndexPage() {
  return (
    <LegacyPage
      html={{"lang":"en"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark"}}
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="/config.js" />
      {/* ── original <body> ── */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-3">
          <a href="../index.html" className="flex items-center gap-2">
            <span className="material-symbols-rounded">
              home
            </span>
            Home
          </a>
          {" "}
          <h1 className="text-lg font-bold">
            My Prints
          </h1>
          {" "}
          <span />
        </div>
      </header>
      <main className="container py-6">
        <div className="flex items-center gap-2 text-sm mb-3">
          <button data-s="" className="tab px-3 py-1.5 rounded-md bg-brand-500/90 text-white">
            Active
          </button>
          {" "}
          <button
            data-s="ready"
            className="tab px-3 py-1.5 rounded-md ring-1 ring-black/10 dark:ring-white/15"
          >
            Ready
          </button>
          {" "}
          <button
            data-s="completed"
            className="tab px-3 py-1.5 rounded-md ring-1 ring-black/10 dark:ring-white/15"
          >
            Completed
          </button>
          {" "}
          <button
            data-s="cancelled"
            className="tab px-3 py-1.5 rounded-md ring-1 ring-black/10 dark:ring-white/15"
          >
            Cancelled
          </button>
        </div>
        <div id="list" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" />
        <div id="empty" className="hidden text-sm opacity-70">
          No orders.
        </div>
      </main>
      <script src="/_legacy/orders/index/script-01.js" />
    </LegacyPage>
  );
}
