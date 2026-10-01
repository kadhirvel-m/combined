// Converted from ui/print/shop/dashboard.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/print/shop/dashboard/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Paper X — Shop Dashboard",
};

export default function PrintShopDashboardPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white"}}
      head={
        <>
          <link rel="icon" type="image/x-icon" href="../../assets/img/favicon.svg" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="../../assets/css/tailwind.css" />
      <link rel="stylesheet" href="/_legacy/print/shop/dashboard/style-01.css" />
      <script src="/_legacy/print/shop/dashboard/script-01.js" />
      {/* ── original <body> ── */}
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-3">
          <a href="../index.html" className="flex items-center gap-3" aria-label="Paper X Print Home">
            {" "}
            <img src="../../assets/img/logo-light.svg" alt="Paper X" className="h-8 w-auto dark:hidden" />
            {" "}
            <img src="../../assets/img/logo-dark.svg" alt="Paper X" className="h-8 w-auto hidden dark:block" />
            {" "}
          </a>
          {" "}
          <div className="hidden md:flex items-center gap-2">
            <a
              href="jobs.html"
              className="rounded-full px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10 text-sm"
            >
              {" "}
              <span className="material-symbols-rounded text-base">
                assignment
              </span>
              {" Jobs "}
            </a>
            {" "}
            <a
              href="payments.html"
              className="rounded-full px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10 text-sm"
            >
              {" "}
              <span className="material-symbols-rounded text-base">
                payments
              </span>
              {" Payments "}
            </a>
            {" "}
            <a
              href="profile.html"
              className="rounded-full px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10 text-sm"
            >
              {" "}
              <span className="material-symbols-rounded text-base">
                account_circle
              </span>
              {" Profile "}
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
              {" "}
              <span className="hidden sm:block">
                Theme
              </span>
            </button>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <a
              href="jobs.html"
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
              href="payments.html"
              className="inline-flex items-center justify-center size-10 rounded-full ring-soft hover:bg-black/5 dark:hover:bg-white/5"
              title="Payments"
            >
              {" "}
              <span className="material-symbols-rounded">
                payments
              </span>
              {" "}
            </a>
            {" "}
            <a
              href="profile.html"
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
      {/* Layout */}
      <div className="container py-6 md:py-8 grid lg:grid-cols-[280px,1fr] gap-6">
        {/* Sidebar */}
        <aside className="sidebar glass rounded-2xl ring-1 ring-black/5 dark:ring-white/10 p-3 md:p-4 self-start sticky top-24">
          <nav className="flex flex-col gap-1 text-sm">
            <a
              className="flex items-center gap-3 rounded-xl px-3 py-2 bg-brand-500/10 text-brand-700 dark:text-brand-200 ring-1 ring-brand-500/30"
              href="#overview"
            >
              {" "}
              <span className="material-symbols-rounded">
                dashboard
              </span>
              {" "}
              <span data-label="">
                Overview
              </span>
              {" "}
            </a>
            {" "}
            <a
              className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
              href="#orders"
            >
              {" "}
              <span className="material-symbols-rounded">
                receipt_long
              </span>
              <span data-label="">
                Orders
              </span>
              {" "}
            </a>
            {" "}
            <a
              className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
              href="#payments"
            >
              {" "}
              <span className="material-symbols-rounded">
                payments
              </span>
              <span data-label="">
                Payments
              </span>
              {" "}
            </a>
            {" "}
            <a
              className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
              href="#customers"
            >
              {" "}
              <span className="material-symbols-rounded">
                groups
              </span>
              <span data-label="">
                Customers
              </span>
              {" "}
            </a>
            {" "}
            <a
              className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
              href="#inventory"
            >
              {" "}
              <span className="material-symbols-rounded">
                inventory_2
              </span>
              <span data-label="">
                Inventory
              </span>
              {" "}
            </a>
            {" "}
            <a
              className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
              href="#usp"
            >
              {" "}
              <span className="material-symbols-rounded">
                auto_awesome
              </span>
              <span data-label="">
                USP
              </span>
              {" "}
            </a>
            {" "}
            <a
              className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
              href="#settings"
            >
              {" "}
              <span className="material-symbols-rounded">
                settings
              </span>
              <span data-label="">
                Settings
              </span>
              {" "}
            </a>
          </nav>
          <div className="mt-4 rounded-xl p-3 bg-white/80 dark:bg-white/10 ring-1 ring-black/5 dark:ring-white/10">
            <div className="text-[11px] uppercase tracking-wider opacity-70 mb-1">
              Shop status
            </div>
            <div className="flex items-center justify-between">
              <div id="shopStatusLabel" className="flex items-center gap-2 text-sm">
                <span id="shopStatusIcon" className="material-symbols-rounded text-emerald-500">
                  circle
                </span>
                {" "}
                <span id="shopStatusText">
                  Open
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="btnToggleOpen"
                  className="text-xs rounded-full px-3 py-1 ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Close
                </button>
                {" "}
                <button
                  id="btnTogglePause"
                  className="text-xs rounded-full px-3 py-1 ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Pause
                </button>
              </div>
            </div>
          </div>
        </aside>
        {/* Main */}
        <main className="space-y-6">
          {/* Info bar */}
          <section className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[12px] opacity-75">
              {"Last updated: "}
              <span id="lastUpdated">
                —
              </span>
              {" • Auto‑refresh 30s "}
            </div>
            <div id="fetchError" className="hidden text-[12px] text-rose-600">
              Couldn’t load data. Retrying…
            </div>
          </section>
          {/* Filters + Search */}
          <section className="glass rounded-2xl ring-1 ring-black/5 dark:ring-white/10 p-4 md:p-5">
            <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
                <label className="block text-xs font-semibold opacity-70">
                  {"Date range "}
                  <input
                    id="fltRange"
                    type="date"
                    className="mt-1 w-full rounded-xl px-3 py-2 ring-1 ring-black/10 dark:ring-white/15 bg-white/80 dark:bg-white/10"
                  />
                  {" "}
                </label>
                {" "}
                <label className="block text-xs font-semibold opacity-70">
                  {"Status "}
                  <select
                    id="fltStatus"
                    className="mt-1 w-full rounded-xl px-3 py-2 ring-1 ring-black/10 dark:ring-white/15 bg-white/80 dark:bg-white/10"
                  >
                    <option value="all">
                      All
                    </option>
                    <option value="new">
                      New
                    </option>
                    <option value="processing">
                      Processing
                    </option>
                    <option value="ready">
                      Ready
                    </option>
                    <option value="picked">
                      Picked
                    </option>
                  </select>
                  {" "}
                </label>
                {" "}
                <label className="block text-xs font-semibold opacity-70">
                  {"Channel "}
                  <select
                    id="fltChannel"
                    className="mt-1 w-full rounded-xl px-3 py-2 ring-1 ring-black/10 dark:ring-white/15 bg-white/80 dark:bg-white/10"
                  >
                    <option value="all">
                      All
                    </option>
                    <option>
                      Walk-in
                    </option>
                    <option>
                      Student app
                    </option>
                    <option>
                      WhatsApp
                    </option>
                  </select>
                  {" "}
                </label>
                {" "}
                <label className="block text-xs font-semibold opacity-70">
                  {"Payment "}
                  <select
                    id="fltPayment"
                    className="mt-1 w-full rounded-xl px-3 py-2 ring-1 ring-black/10 dark:ring-white/15 bg-white/80 dark:bg-white/10"
                  >
                    <option value="all">
                      All
                    </option>
                    <option>
                      Cash
                    </option>
                    <option>
                      UPI
                    </option>
                    <option>
                      Card
                    </option>
                  </select>
                  {" "}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                    search
                  </span>
                  {" "}
                  <input
                    id="fltSearch"
                    placeholder="Search orders, customers"
                    className="pl-10 w-64 rounded-xl px-3 py-2 ring-1 ring-black/10 dark:ring-white/15 bg-white/80 dark:bg-white/10"
                  />
                </div>
                {" "}
                <button
                  id="fltReset"
                  className="rounded-xl px-3 py-2 ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-sm"
                >
                  Reset
                </button>
              </div>
            </div>
          </section>
          {/* KPI cards */}
          <section id="overview" className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <article className="rounded-2xl p-4 glass ring-1 ring-black/5 dark:ring-white/10">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wider opacity-70">
                  Revenue
                </div>
                {" "}
                <span className="material-symbols-rounded text-emerald-500">
                  trending_up
                </span>
              </div>
              <div id="kpiRevenue" className="mt-2 text-2xl font-extrabold">
                ₹0
              </div>
              <div id="kpiRevenueDelta" className="text-[12px] opacity-70">
                —
              </div>
            </article>
            <article className="rounded-2xl p-4 glass ring-1 ring-black/5 dark:ring-white/10">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wider opacity-70">
                  Orders
                </div>
                {" "}
                <span className="material-symbols-rounded text-sky-500">
                  inbox
                </span>
              </div>
              <div id="kpiOrders" className="mt-2 text-2xl font-extrabold">
                0
              </div>
              <div id="kpiOrdersDelta" className="text-[12px] opacity-70">
                —
              </div>
            </article>
            <article className="rounded-2xl p-4 glass ring-1 ring-black/5 dark:ring-white/10">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wider opacity-70">
                  Avg Order Value
                </div>
                {" "}
                <span className="material-symbols-rounded text-violet-500">
                  payments
                </span>
              </div>
              <div id="kpiAOV" className="mt-2 text-2xl font-extrabold">
                ₹0
              </div>
              <div id="kpiAOVDelta" className="text-[12px] opacity-70">
                —
              </div>
            </article>
            <article className="rounded-2xl p-4 glass ring-1 ring-black/5 dark:ring-white/10">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wider opacity-70">
                  Pending Payouts
                </div>
                {" "}
                <span className="material-symbols-rounded text-amber-500">
                  account_balance_wallet
                </span>
              </div>
              <div id="kpiPayouts" className="mt-2 text-2xl font-extrabold">
                ₹0
              </div>
              <div id="kpiPayoutsNote" className="text-[12px] opacity-70">
                Counter payments
              </div>
            </article>
          </section>
          {/* Charts */}
          <section className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl glass ring-1 ring-black/5 dark:ring-white/10 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  Revenue trend
                </h3>
                <div className="text-[12px] opacity-70">
                  Last 14 days
                </div>
              </div>
              <div className="mt-3 h-64">
                <canvas id="chartRevenue" className="w-full h-full" />
              </div>
            </div>
            <div className="rounded-2xl glass ring-1 ring-black/5 dark:ring-white/10 p-4">
              <h3 className="text-sm font-semibold">
                Orders by status
              </h3>
              <div className="mt-3 h-56">
                <canvas id="chartStatus" className="w-full h-full" />
              </div>
            </div>
          </section>
          <section className="grid lg:grid-cols-3 gap-4">
            <div className="rounded-2xl glass ring-1 ring-black/5 dark:ring-white/10 p-4">
              <h3 className="text-sm font-semibold">
                Payment status
              </h3>
              <div className="mt-3 h-56">
                <canvas id="chartPayments" className="w-full h-full" />
              </div>
            </div>
            <div className="lg:col-span-2 rounded-2xl glass ring-1 ring-black/5 dark:ring-white/10 p-4">
              <h3 className="text-sm font-semibold">
                {"Capacity & load"}
              </h3>
              <div className="mt-3 grid sm:grid-cols-2 gap-4">
                <div className="rounded-xl p-3 bg-white/70 dark:bg-white/10 ring-1 ring-black/5 dark:ring-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {"B&W queue"}
                    </span>
                    <span className="opacity-70">
                      12 jobs
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-black/10 dark:bg-white/10">
                    <div className="h-full w-[62%] rounded-full bg-neutral-900 dark:bg-white" />
                  </div>
                </div>
                <div className="rounded-xl p-3 bg-white/70 dark:bg-white/10 ring-1 ring-black/5 dark:ring-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      Color queue
                    </span>
                    <span className="opacity-70">
                      7 jobs
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-black/10 dark:bg-white/10">
                    <div className="h-full w-[38%] rounded-full bg-fuchsia-500" />
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* Orders table */}
          <section id="orders" className="glass rounded-2xl ring-1 ring-black/5 dark:ring-white/10 p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">
                Recent orders
              </h3>
              {" "}
              <a
                href="jobs.html"
                className="text-sm inline-flex items-center gap-1 rounded-full px-3 py-1 ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10"
              >
                {" Go to Jobs "}
                <span className="material-symbols-rounded text-base">
                  chevron_right
                </span>
                {" "}
              </a>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-[12px] uppercase tracking-wide opacity-70">
                  <tr>
                    <th className="px-2 py-2">
                      Order
                    </th>
                    <th className="px-2 py-2">
                      Customer
                    </th>
                    <th className="px-2 py-2">
                      Pages
                    </th>
                    <th className="px-2 py-2">
                      Amount
                    </th>
                    <th className="px-2 py-2">
                      Status
                    </th>
                    <th className="px-2 py-2">
                      Payment
                    </th>
                    <th className="px-2 py-2">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody id="ordersTbody" className="divide-y divide-black/5 dark:divide-white/10">
                  {/* rows via JS */}
                </tbody>
              </table>
            </div>
          </section>
          {/* Payments table */}
          <section id="payments" className="glass rounded-2xl ring-1 ring-black/5 dark:ring-white/10 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                Payouts
              </h3>
              {" "}
              <button className="text-sm rounded-full px-3 py-1 ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10">
                Export CSV
              </button>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-[12px] uppercase tracking-wide opacity-70">
                  <tr>
                    <th className="px-2 py-2">
                      Payout
                    </th>
                    <th className="px-2 py-2">
                      Period
                    </th>
                    <th className="px-2 py-2">
                      Orders
                    </th>
                    <th className="px-2 py-2">
                      Total
                    </th>
                    <th className="px-2 py-2">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/10">
                  <tr>
                    <td className="px-2 py-2 font-medium">
                      #P-1042
                    </td>
                    <td className="px-2 py-2">
                      Oct 01 → Oct 07
                    </td>
                    <td className="px-2 py-2">
                      126
                    </td>
                    <td className="px-2 py-2">
                      ₹27,940
                    </td>
                    <td className="px-2 py-2">
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30">
                        Paid
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 font-medium">
                      #P-1043
                    </td>
                    <td className="px-2 py-2">
                      Oct 08 → Oct 14
                    </td>
                    <td className="px-2 py-2">
                      132
                    </td>
                    <td className="px-2 py-2">
                      ₹29,210
                    </td>
                    <td className="px-2 py-2">
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] bg-amber-500/15 text-amber-700 ring-1 ring-amber-500/30">
                        Scheduled
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          {/* Customers quick list */}
          <section id="customers" className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <article className="rounded-2xl glass ring-1 ring-black/5 dark:ring-white/10 p-4">
              <div className="flex items-center gap-3">
                <img
                  className="size-10 rounded-full object-cover"
                  src="https://i.pravatar.cc/100?img=11"
                  alt="Customer"
                  loading="lazy"
                />
                {" "}
                <div>
                  <div className="text-sm font-semibold">
                    Arun Kumar
                  </div>
                  <div className="text-[12px] opacity-70">
                    5 orders · ₹1,340
                  </div>
                </div>
              </div>
            </article>
            <article className="rounded-2xl glass ring-1 ring-black/5 dark:ring-white/10 p-4">
              <div className="flex items-center gap-3">
                <img
                  className="size-10 rounded-full object-cover"
                  src="https://i.pravatar.cc/100?img=15"
                  alt="Customer"
                  loading="lazy"
                />
                {" "}
                <div>
                  <div className="text-sm font-semibold">
                    Sneha Iyer
                  </div>
                  <div className="text-[12px] opacity-70">
                    3 orders · ₹890
                  </div>
                </div>
              </div>
            </article>
            <article className="rounded-2xl glass ring-1 ring-black/5 dark:ring-white/10 p-4">
              <div className="flex items-center gap-3">
                <img
                  className="size-10 rounded-full object-cover"
                  src="https://i.pravatar.cc/100?img=32"
                  alt="Customer"
                  loading="lazy"
                />
                {" "}
                <div>
                  <div className="text-sm font-semibold">
                    Faizan Ali
                  </div>
                  <div className="text-[12px] opacity-70">
                    7 orders · ₹2,040
                  </div>
                </div>
              </div>
            </article>
          </section>
          {/* USP highlights */}
          <section id="usp" className="grid md:grid-cols-3 gap-4">
            <article className="rounded-2xl p-5 glass ring-1 ring-black/5 dark:ring-white/10">
              <div className="size-10 grid place-content-center rounded-xl bg-brand-500/15 text-brand-600 mb-2">
                <span className="material-symbols-rounded">
                  qr_code_2
                </span>
              </div>
              <h3 className="font-semibold">
                OTP + QR pickup
              </h3>
              <p className="text-[13px] opacity-90 mt-1">
                No mix‑ups at counter. Verify in one tap.
              </p>
            </article>
            <article className="rounded-2xl p-5 glass ring-1 ring-black/5 dark:ring-white/10">
              <div className="size-10 grid place-content-center rounded-xl bg-brand-500/15 text-brand-600 mb-2">
                <span className="material-symbols-rounded">
                  home_iot_device
                </span>
              </div>
              <h3 className="font-semibold">
                No new hardware
              </h3>
              <p className="text-[13px] opacity-90 mt-1">
                Works with the printers and software you already use.
              </p>
            </article>
            <article className="rounded-2xl p-5 glass ring-1 ring-black/5 dark:ring-white/10">
              <div className="size-10 grid place-content-center rounded-xl bg-brand-500/15 text-brand-600 mb-2">
                <span className="material-symbols-rounded">
                  tune
                </span>
              </div>
              <h3 className="font-semibold">
                Crystal‑clear tickets
              </h3>
              <p className="text-[13px] opacity-90 mt-1">
                Copies, duplex, GSM, N‑up, finishing — zero confusion.
              </p>
            </article>
          </section>
          {/* Settings CTA */}
          <section
            id="settings"
            className="glass rounded-2xl ring-1 ring-black/5 dark:ring-white/10 p-5 flex items-center justify-between"
          >
            <div>
              <h3 className="text-sm font-semibold">
                Tune your shop
              </h3>
              <p className="text-[13px] opacity-80">
                Update pricing hints, timings, and capabilities.
              </p>
            </div>
            {" "}
            <a
              href="profile.html"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-brand-500 text-white text-sm font-semibold hover:bg-brand-700"
            >
              {" "}
              <span className="material-symbols-rounded text-base">
                settings
              </span>
              {" Open settings "}
            </a>
          </section>
        </main>
      </div>
      {/* Footer mini */}
      <footer className="border-t border-black/5 dark:border-white/10">
        <div className="container py-8 text-[13px] flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="opacity-80">
            {"© "}
            <span id="y" />
            {" Paper X • Shop Dashboard"}
          </div>
          <div className="flex items-center gap-3">
            <a href="../index.html" className="hover:underline">
              Print Home
            </a>
            {" "}
            <a href="jobs.html" className="hover:underline">
              Jobs
            </a>
            {" "}
            <a href="profile.html" className="hover:underline">
              Settings
            </a>
          </div>
        </div>
      </footer>
      {/* Libraries */}
      <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js" />
      {/* Config/Auth if needed later */}
      <script src="/config.js" />
      <script src="/auth.js" defer />
      <script src="/_legacy/print/shop/dashboard/script-02.js" />
      <script src="/_legacy/print/shop/dashboard/script-03.js" />
    </LegacyPage>
  );
}
