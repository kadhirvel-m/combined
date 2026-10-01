// Converted from ui/print/admin_print_shop.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/print/admin_print_shop/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Admin • Shop Detail — Paper X",
};

export default function PrintAdminPrintShopPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white"}}
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <link rel="stylesheet" href="/_legacy/print/admin_print_shop/style-01.css" />
      <script src="/_legacy/print/admin_print_shop/script-01.js" />
      {/* ── original <body> ── */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-3">
          <a href="admin_print.html" className="inline-flex items-center gap-2">
            <span className="material-symbols-rounded">
              arrow_back
            </span>
            {" "}
            <span className="font-semibold">
              Back
            </span>
          </a>
          {" "}
          <div className="text-lg font-bold">
            Shop Details
          </div>
          <div className="flex items-center gap-2" />
        </div>
      </header>
      <main className="container py-6 space-y-6">
        {/* Shop header */}
        <section className="glass rounded-2xl ring-1 ring-black/5 dark:ring-white/10 p-4">
          <div className="flex items-start gap-4">
            <div id="logoWrap" className="h-16 w-16 rounded-xl ring-soft bg-black/5 dark:bg-white/10" />
            <div className="flex-1">
              <div className="text-xl font-extrabold" id="shopName">
                —
              </div>
              <div className="text-[13px] opacity-75" id="shopAddr">
                —
              </div>
              <div className="text-[13px] opacity-75" id="shopContact">
                —
              </div>
            </div>
            <div className="text-right">
              <div className="text-[12px] opacity-70">
                Completed total
              </div>
              <div id="sumCompleted" className="text-2xl font-extrabold">
                ₹0
              </div>
              {" "}
              <button
                id="btnSettle"
                className="mt-2 inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-brand-500 text-white hover:bg-brand-700 disabled:opacity-60"
              >
                <span className="material-symbols-rounded text-base">
                  account_balance_wallet
                </span>
                {" "}
                <span>
                  Settle Payment
                </span>
              </button>
              {" "}
              <div id="settleStatus" className="text-[12px] opacity-70 mt-1" />
            </div>
          </div>
        </section>
        <section className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-2xl glass ring-1 ring-black/5 dark:ring-white/10 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                Pending Orders
              </h3>
              <div className="text-[12px] opacity-70" id="cntPending">
                —
              </div>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-[12px] uppercase tracking-wide opacity-70">
                  <tr>
                    <th className="px-2 py-2">
                      Order
                    </th>
                    <th className="px-2 py-2">
                      Name
                    </th>
                    <th className="px-2 py-2">
                      Phone
                    </th>
                    <th className="px-2 py-2">
                      Status
                    </th>
                    <th className="px-2 py-2">
                      Created
                    </th>
                    <th className="px-2 py-2 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody id="tbPending" className="divide-y divide-black/5 dark:divide-white/10" />
              </table>
            </div>
          </div>
          <div className="rounded-2xl glass ring-1 ring-black/5 dark:ring-white/10 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                Completed Orders
              </h3>
              <div className="text-[12px] opacity-70" id="cntCompleted">
                —
              </div>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-[12px] uppercase tracking-wide opacity-70">
                  <tr>
                    <th className="px-2 py-2">
                      Order
                    </th>
                    <th className="px-2 py-2">
                      Amount
                    </th>
                    <th className="px-2 py-2">
                      Completed
                    </th>
                  </tr>
                </thead>
                <tbody id="tbCompleted" className="divide-y divide-black/5 dark:divide-white/10" />
              </table>
            </div>
          </div>
        </section>
      </main>
      {/* Close Order Modal */}
      <div id="modalClose" className="fixed inset-0 z-50 hidden items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" data-close="1" />
        <div
          id="modalClosePanel"
          className="relative w-[92vw] max-w-md transition-all duration-200 ease-out opacity-0 scale-95"
        >
          <div className="rounded-2xl p-5 ring-1 ring-black/10 dark:ring-white/15 shadow-2xl bg-white/90 dark:bg-brand-900/90">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center size-10 rounded-xl bg-rose-500/15 text-rose-600 ring-1 ring-rose-500/30">
                  <span className="material-symbols-rounded">
                    close
                  </span>
                </span>
                {" "}
                <div>
                  <div className="text-lg font-extrabold">
                    Close Order
                  </div>
                  <div id="modalCloseText" className="text-[13px] opacity-80 mt-0.5">
                    —
                  </div>
                </div>
              </div>
              {" "}
              <button
                id="btnXClose"
                className="inline-flex items-center justify-center size-9 rounded-xl hover:bg-black/5 dark:hover:bg-white/10"
              >
                <span className="material-symbols-rounded">
                  close
                </span>
              </button>
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                id="btnCancelClose"
                className="rounded-xl px-3 py-2 ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10"
              >
                Cancel
              </button>
              {" "}
              <button
                id="btnConfirmClose"
                className="rounded-xl px-3 py-2 bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
              >
                <span className="material-symbols-rounded text-base">
                  done
                </span>
                {" "}
                <span>
                  Confirm Close
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Confirm Settle Modal */}
      <div id="modalSettle" className="fixed inset-0 z-50 hidden items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" data-close="1" />
        <div
          id="modalSettlePanel"
          className="relative w-[92vw] max-w-md transition-all duration-200 ease-out opacity-0 scale-95"
        >
          <div className="rounded-2xl p-5 ring-1 ring-black/10 dark:ring-white/15 shadow-2xl bg-white/90 dark:bg-brand-900/90">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center size-10 rounded-xl bg-brand-500/15 text-brand-700 dark:text-brand-200 ring-1 ring-brand-500/30">
                  <span className="material-symbols-rounded">
                    account_balance_wallet
                  </span>
                </span>
                {" "}
                <div>
                  <div className="text-lg font-extrabold">
                    Confirm Settlement
                  </div>
                  <div id="modalText" className="text-[13px] opacity-80 mt-0.5">
                    —
                  </div>
                </div>
              </div>
              {" "}
              <button
                id="btnXModal"
                className="inline-flex items-center justify-center size-9 rounded-xl hover:bg-black/5 dark:hover:bg-white/10"
              >
                <span className="material-symbols-rounded">
                  close
                </span>
              </button>
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                id="btnCancelModal"
                className="rounded-xl px-3 py-2 ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10"
              >
                Cancel
              </button>
              {" "}
              <button
                id="btnConfirmModal"
                className="rounded-xl px-3 py-2 bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60"
              >
                <span className="material-symbols-rounded text-base">
                  done
                </span>
                {" "}
                <span>
                  Confirm
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <footer className="border-t border-black/5 dark:border-white/10">
        <div className="container py-8 text-[13px] flex items-center justify-between">
          <div className="opacity-80">
            {"© "}
            <span id="y" />
            {" Paper X • Admin"}
          </div>
        </div>
      </footer>
      <script src="/config.js" />
      <script src="/_legacy/print/admin_print_shop/script-02.js" />
    </LegacyPage>
  );
}
