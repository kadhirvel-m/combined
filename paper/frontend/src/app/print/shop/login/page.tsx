// Converted from ui/print/shop/login.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/print/shop/login/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Shop Login — PaperX",
};

export default function PrintShopLoginPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark"}}
      head={
        <>
          <link rel="icon" type="image/x-icon" href="../../assets/img/favicon.svg" />
          <link rel="preconnect" href="https://challenges.cloudflare.com" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link rel="stylesheet" href="../../assets/css/tailwind.css" />
      <script src="/config.js" />
      <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" defer />
      <link rel="stylesheet" href="/_legacy/print/shop/login/style-01.css" />
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
            Shop Login
          </h1>
          {" "}
          <a href="./signup.html" className="text-sm hover:underline">
            Create shop
          </a>
        </div>
      </header>
      <main className="container py-10 grid place-items-center">
        <section className="glass rounded-2xl p-6 ring-1 ring-black/5 dark:ring-white/10 w-full max-w-md">
          <form id="form" className="grid gap-3 text-[13px]">
            <label>
              {"Email "}
              <input
                name="email"
                type="email"
                required
                className="mt-1 w-full px-3 py-2 rounded-md ring-1 ring-black/10 dark:ring-white/15 bg-white/90 dark:bg-white/5"
              />
            </label>
            {" "}
            <label>
              {"Password "}
              <input
                name="password"
                type="password"
                required
                className="mt-1 w-full px-3 py-2 rounded-md ring-1 ring-black/10 dark:ring-white/15 bg-white/90 dark:bg-white/5"
              />
            </label>
            {" "}
            <div id="turnstileContainer" className="mt-1" />
            {" "}
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" id="remember" defaultChecked />
              {" Remember this device"}
            </label>
            {" "}
            <button
              id="submit"
              type="submit"
              className="px-3 py-2 rounded-md bg-brand-500/90 text-white hover:bg-brand-500 inline-flex items-center gap-2"
            >
              <span className="material-symbols-rounded">
                login
              </span>
              <span>
                Sign in
              </span>
            </button>
            {" "}
            <div id="status" className="text-[12px] opacity-80" />
          </form>
        </section>
      </main>
      <script src="/_legacy/print/shop/login/script-01.js" />
    </LegacyPage>
  );
}
