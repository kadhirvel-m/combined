// Converted from ui/print/printers/success.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/print/printers/success/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Job Submitted — PaperX",
};

export default function PrintPrintersSuccessPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark"}}
      head={
        <>
          <link rel="icon" type="image/x-icon" href="../assets/img/favicon.svg" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link rel="stylesheet" href="../../assets/css/tailwind.css" />
      <script src="/config.js" />
      <link rel="stylesheet" href="/_legacy/print/printers/success/style-01.css" />
      <script
        src="https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js"
        integrity="sha512-+XgqVYngwR3h9fHjR0ybqgWTR6k+4qQKxHGZNXlQX7P2aWz6Y6K1i9Y2F7o3eDPxJbmx2l5QZc9r0C7R2K0H2A=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />
      {/* ── original <body> ── */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-3">
          <a href="../../index.html" className="flex items-center gap-2">
            <span className="material-symbols-rounded">
              home
            </span>
            Home
          </a>
          {" "}
          <h1 className="text-lg font-bold">
            Success
          </h1>
          {" "}
          <a href="../orders/index.html" className="text-sm hover:underline">
            My Prints
          </a>
        </div>
      </header>
      <main className="container py-10 grid place-items-center">
        <section className="glass rounded-2xl p-6 ring-1 ring-black/5 dark:ring-white/10 max-w-md w-full text-center">
          <div className="text-emerald-600 dark:text-emerald-400">
            <span className="material-symbols-rounded text-5xl">
              check_circle
            </span>
          </div>
          <h2 className="text-xl font-extrabold mt-2">
            Job Submitted
          </h2>
          <p className="text-sm opacity-80">
            Show this OTP or QR at the shop.
          </p>
          <div className="mt-4 font-mono text-2xl tracking-widest" id="otp">
            000000
          </div>
          {" "}
          <canvas id="qr" className="mt-3 mx-auto" />
          {" "}
          <div id="job" className="text-[12px] opacity-70 mt-2" />
          <div className="mt-4 flex items-center justify-center gap-2">
            <a
              id="viewJob"
              className="px-3 py-2 rounded-md bg-brand-500/90 text-white hover:bg-brand-500"
              href="#"
            >
              View Job
            </a>
            {" "}
            <a id="share" className="px-3 py-2 rounded-md ring-1 ring-black/10 dark:ring-white/15" href="#">
              Share
            </a>
          </div>
        </section>
      </main>
      <script src="/_legacy/print/printers/success/script-01.js" />
    </LegacyPage>
  );
}
