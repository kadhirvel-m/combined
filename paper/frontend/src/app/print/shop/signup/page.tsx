// Converted from ui/print/shop/signup.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/print/shop/signup/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Shop Sign Up — PaperX",
};

export default function PrintShopSignupPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(158,75,138,.18),transparent),radial-gradient(900px_500px_at_110%_10%,rgba(76,42,89,.25),transparent)] dark:bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(158,75,138,.2),transparent),radial-gradient(900px_500px_at_110%_10%,rgba(30,30,47,.7),transparent)]"}}
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
      <script src="/_legacy/print/shop/signup/script-01.js" />
      <script src="/config.js" />
      <link rel="stylesheet" href="/_legacy/print/shop/signup/style-01.css" />
      {/* ── original <body> ── */}
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 backdrop-blur border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-brand-900/60">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          <a href="../index.html" className="flex items-center gap-2 group">
            {" "}
            <span className="material-symbols-rounded">
              home
            </span>
            {" "}
            <span className="font-semibold tracking-tight group-hover:underline">
              Home
            </span>
            {" "}
          </a>
          {" "}
          <div className="flex items-center gap-3">
            <button
              id="themeToggle"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full ring-soft hover:shadow-elev-1 transition"
            >
              <span className="material-symbols-rounded" id="themeIcon">
                dark_mode
              </span>
              {" "}
              <span className="text-sm">
                Theme
              </span>
            </button>
            {" "}
            <a href="./login.html" className="text-sm hover:underline">
              Already have an account?
            </a>
          </div>
        </div>
      </header>
      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Form Card */}
        <section className="lg:col-span-7 relative">
          <div className="absolute -inset-1 rounded-3xl blur-2xl bg-gradient-to-br from-brand-500/20 to-brand-700/20 -z-10" />
          <div className="glass rounded-3xl p-6 lg:p-8 ring-1 ring-black/5 dark:ring-white/10 shadow-neon">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Create Your Print Shop
                </h1>
                <p className="text-sm opacity-80">
                  Sign up as the owner and list your capabilities. You’ll appear in students’ nearby shop search instantly.
                </p>
              </div>
              {" "}
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-brand-500/15 text-brand-500 ring-1 ring-brand-500/30">
                {" "}
                <span className="material-symbols-rounded text-sm">
                  verified
                </span>
                {" Trusted "}
              </span>
            </div>
            {/* Stepper */}
            <ol className="grid grid-cols-3 gap-2 mb-6 text-[12px]">
              <li className="flex items-center gap-2 rounded-lg px-3 py-2 bg-brand-500/10 ring-1 ring-brand-500/30 text-brand-100 dark:text-white">
                <span className="material-symbols-rounded text-base">
                  person
                </span>
                {" Owner "}
              </li>
              <li className="flex items-center gap-2 rounded-lg px-3 py-2 ring-soft">
                <span className="material-symbols-rounded text-base">
                  storefront
                </span>
                {" Shop "}
              </li>
              <li className="flex items-center gap-2 rounded-lg px-3 py-2 ring-soft">
                <span className="material-symbols-rounded text-base">
                  print
                </span>
                {" Capabilities "}
              </li>
            </ol>
            <form id="authForm" className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
              {/* Owner */}
              <div className="md:col-span-2">
                <div className="text-sm font-semibold mb-2">
                  Owner Account
                </div>
              </div>
              {" "}
              <label className="block">
                {" "}
                <span className="text-xs opacity-80">
                  Email
                </span>
                {" "}
                <input
                  name="email"
                  type="email"
                  required
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-white/90 dark:bg-white/5 ring-soft focus-ring"
                  placeholder="owner@zeroxshop.com"
                />
                {" "}
              </label>
              {" "}
              <label className="block relative">
                {" "}
                <span className="text-xs opacity-80">
                  Password
                </span>
                {" "}
                <input
                  id="password"
                  name="password"
                  type="password"
                  minLength={6}
                  required
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-white/90 dark:bg-white/5 ring-soft focus-ring pr-10"
                  placeholder="At least 6 characters"
                />
                {" "}
                <button
                  type="button"
                  id="togglePwd"
                  className="absolute right-2 bottom-2.5 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <span className="material-symbols-rounded text-base">
                    visibility
                  </span>
                </button>
                {" "}
                <span id="pwdHint" className="block text-[11px] mt-1 opacity-70">
                  {"Use 8+ chars with a number & symbol for stronger security."}
                </span>
                {" "}
              </label>
              {" "}
              {/* Shop */}
              <div className="md:col-span-2 pt-2">
                <div className="text-sm font-semibold mb-2">
                  Shop Details
                </div>
              </div>
              {" "}
              <label className="block md:col-span-2">
                {" "}
                <span className="text-xs opacity-80">
                  Shop Name
                </span>
                {" "}
                <input
                  name="shop_name"
                  required
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-white/90 dark:bg-white/5 ring-soft focus-ring"
                  placeholder="ZeroX Prints, MG Road"
                />
                {" "}
              </label>
              {" "}
              <label className="block">
                {" "}
                <span className="text-xs opacity-80">
                  Phone
                </span>
                {" "}
                <input
                  name="phone"
                  inputMode="tel"
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-white/90 dark:bg-white/5 ring-soft focus-ring"
                  placeholder="+91 9XXXXXXXXX"
                />
                {" "}
              </label>
              {" "}
              <label className="block">
                {" "}
                <span className="text-xs opacity-80">
                  Shop Email
                </span>
                {" "}
                <input
                  name="shop_email"
                  type="email"
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-white/90 dark:bg-white/5 ring-soft focus-ring"
                  placeholder="hello@zeroxprints.in"
                />
                {" "}
              </label>
              {" "}
              <label className="block md:col-span-2">
                {" "}
                <span className="text-xs opacity-80">
                  Address
                </span>
                {" "}
                <input
                  name="address"
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-white/90 dark:bg-white/5 ring-soft focus-ring"
                  placeholder="Door no., Street, Area, City, Pincode"
                />
                {" "}
              </label>
              {" "}
              {/* Capabilities */}
              <div className="md:col-span-2 pt-1">
                <div className="text-sm font-semibold mb-2">
                  Capabilities
                </div>
              </div>
              <div className="md:col-span-2 grid sm:grid-cols-3 gap-3">
                {/* Color */}
                <label className="flex items-center justify-between px-3 py-2 rounded-xl ring-soft bg-white/80 dark:bg-white/5">
                  {" "}
                  <span className="inline-flex items-center gap-2">
                    {" "}
                    <span className="material-symbols-rounded text-base">
                      palette
                    </span>
                    {" Color "}
                  </span>
                  {" "}
                  <input
                    type="checkbox"
                    name="cap_color"
                    defaultChecked
                    className="toggle toggle-sm accent-brand-500 cursor-pointer"
                  />
                  {" "}
                </label>
                {" "}
                {/* Duplex */}
                <label className="flex items-center justify-between px-3 py-2 rounded-xl ring-soft bg-white/80 dark:bg-white/5">
                  {" "}
                  <span className="inline-flex items-center gap-2">
                    {" "}
                    <span className="material-symbols-rounded text-base">
                      compare_arrows
                    </span>
                    {" Duplex "}
                  </span>
                  {" "}
                  <input
                    type="checkbox"
                    name="cap_duplex"
                    defaultChecked
                    className="toggle toggle-sm accent-brand-500 cursor-pointer"
                  />
                  {" "}
                </label>
                {" "}
                {/* Sizes (kept as <select multiple> to match your API code; styled better) */}
                <label className="block">
                  {" "}
                  <span className="text-xs opacity-80">
                    Supported Sizes
                  </span>
                  {" "}
                  <select
                    name="cap_sizes"
                    multiple
                    className="mt-1 w-full px-2 py-2 rounded-lg bg-white/90 dark:bg-white/5 ring-soft focus-ring h-[42px]"
                    defaultValue={["A4"]}
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
                  </select>
                  {" "}
                  <span className="text-[11px] opacity-70">
                    Tip: Hold Ctrl / Cmd to select multiple.
                  </span>
                  {" "}
                </label>
              </div>
              {/* Actions */}
              <div className="md:col-span-2 flex items-center gap-3 pt-2">
                <button
                  id="submit"
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white hover:bg-brand-700 active:scale-[.99] transition shadow-elev-2"
                >
                  <span className="material-symbols-rounded text-base" aria-hidden="true">
                    storefront
                  </span>
                  {" "}
                  <span>
                    Create Shop
                  </span>
                </button>
                {" "}
                <div id="status" className="text-[12px] opacity-80" />
              </div>
            </form>
          </div>
        </section>
        {/* Right: Info / Highlights */}
        <section className="lg:col-span-5">
          <div className="glass rounded-3xl p-6 lg:p-8 ring-1 ring-black/5 dark:ring-white/10">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-rounded">
                tips_and_updates
              </span>
              {" "}
              <h2 className="text-lg font-semibold">
                What happens next
              </h2>
            </div>
            <ol className="text-[13px] space-y-3 opacity-90 list-decimal list-inside">
              <li>
                We create your owner account with the email/password above.
              </li>
              <li>
                Your shop profile goes live with the capabilities you set.
              </li>
              <li>
                You’re redirected to the Jobs Board to start accepting print jobs.
              </li>
            </ol>
            <hr className="my-6 border-black/10 dark:border-white/10" />
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-white/5 ring-soft">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-rounded">
                    pin_drop
                  </span>
                  {" "}
                  <p className="text-sm font-semibold">
                    Show up in Nearby
                  </p>
                </div>
                <p className="text-[12px] opacity-80">
                  Students discover you by distance, live availability, and price.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-white/5 ring-soft">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-rounded">
                    bolt
                  </span>
                  {" "}
                  <p className="text-sm font-semibold">
                    1-Tap Print
                  </p>
                </div>
                <p className="text-[12px] opacity-80">
                  Shop receives jobs with the exact print settings. Just press print.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-white/5 ring-soft">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-rounded">
                    shield_person
                  </span>
                  {" "}
                  <p className="text-sm font-semibold">
                    OTP Pickup
                  </p>
                </div>
                <p className="text-[12px] opacity-80">
                  Secure handover with job OTP shared to the student.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-white/5 ring-soft">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-rounded">
                    payments
                  </span>
                  {" "}
                  <p className="text-sm font-semibold">
                    Bring Your Own Pricing
                  </p>
                </div>
                <p className="text-[12px] opacity-80">
                  {"Flexible per-page & binding rates (configure later in dashboard)."}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-3xl p-6 bg-brand-900 text-white overflow-hidden relative">
            <div className="absolute inset-0 opacity-10 bg-grid bg-[size:32px_32px]" />
            <div className="relative">
              <h3 className="text-xl font-bold mb-2">
                Pro tip
              </h3>
              <p className="text-sm opacity-90">
                {" Add "}
                <span className="font-semibold">
                  A3 Color
                </span>
                {" and "}
                <span className="font-semibold">
                  Spiral Binding
                </span>
                {" to appear in more student searches. "}
              </p>
            </div>
          </div>
        </section>
      </main>
      {/* Toast */}
      <div id="toast" className="fixed bottom-4 left-1/2 -translate-x-1/2 hidden">
        <div className="px-4 py-2 rounded-xl bg-brand-500 text-white shadow-elev-2">
          <span id="toastMsg" className="text-sm" />
        </div>
      </div>
      {/* Scripts */}
      <script src="/_legacy/print/shop/signup/script-02.js" />
    </LegacyPage>
  );
}
