// Converted from ui/teachers/teacher_connect.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/teachers/teacher_connect/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Teacher Connect — Paper X",
};

export default function TeachersTeacherConnectPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark min-h-screen flex flex-col overflow-hidden"}}
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <link rel="stylesheet" href="/_legacy/teachers/teacher_connect/style-01.css" />
      <link rel="stylesheet" href="/_legacy/teachers/teacher_connect/style-02.css" />
      <script src="/_legacy/teachers/teacher_connect/script-01.js" />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      {/* ── original <body> ── */}
      {/* Header */}
      <header className="shrink-0 bg-white/70 dark:bg-brand-900/60 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <button
              id="openLeft"
              className="md:hidden inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15"
            >
              <span className="material-symbols-rounded">
                menu
              </span>
            </button>
            {" "}
            <a href="../index.html" className="flex items-center gap-2">
              {" "}
              <img src="../assets/img/logo-light.svg" className="h-8 dark:hidden" alt="Paper X" />
              {" "}
              <img src="../assets/img/logo-dark.svg" className="h-8 hidden dark:block" alt="Paper X" />
              {" "}
            </a>
            {" "}
            <h1 className="text-lg font-semibold tracking-tight hidden sm:block">
              Teacher Connect
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-5 text-sm text-neutral-700 dark:text-white/80">
            <a href="teacher_notes.html" className="hover:text-brandlt-900 dark:hover:text-white">
              Notes
            </a>
            {" "}
            <a href="teacher_signup.html" className="hover:text-brandlt-900 dark:hover:text-white">
              Signup
            </a>
            {" "}
            <a href="teacher_login.html" className="hover:text-brandlt-900 dark:hover:text-white">
              Login
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              data-theme-toggle=""
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
              aria-label="Toggle theme"
            >
              <span className="material-symbols-rounded text-base">
                dark_mode
              </span>
              <span className="hidden sm:block">
                Theme
              </span>
            </button>
            {" "}
            <button
              id="logoutBtn"
              title="Logout"
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium bg-rose-500/90 text-white hover:bg-rose-600"
            >
              <span className="material-symbols-rounded text-base">
                logout
              </span>
              <span className="hidden sm:block">
                Logout
              </span>
            </button>
          </div>
        </div>
      </header>
      {/* Main layout (right pane removed, expand chat) */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-[22rem_minmax(0,1fr)] min-h-0">
        {/* LEFT: People / Conversations */}
        <aside
          id="leftPane"
          className="glass ring-1 ring-black/10 dark:ring-white/15 md:border-r md:border-black/5 md:dark:border-white/10 md:static fixed inset-y-0 left-0 w-full md:w-auto z-40 hidden md:block"
        >
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    search
                  </span>
                  {" "}
                  <input
                    id="peopleSearch"
                    placeholder={"Search teachers & chats"}
                    className="w-full rounded-xl pl-11 pr-3 py-2.5 text-sm bg-white/80 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15"
                  />
                </div>
                {" "}
                <button
                  id="refreshLists"
                  className="size-10 grid place-items-center rounded-xl ring-1 ring-black/10 dark:ring-white/15"
                >
                  <span className="material-symbols-rounded">
                    sync
                  </span>
                </button>
              </div>
              {" "}
              <div
                className="mt-3 inline-flex items-center gap-1 p-1 rounded-xl ring-1 ring-black/10 dark:ring-white/15 bg-white/70 dark:bg-white/10"
                role="tablist"
              >
                <button
                  className="tabBtn px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-500/10 text-brand-700 dark:text-fuchsia-200"
                  data-tab="teachers"
                >
                  <span className="material-symbols-rounded text-sm">
                    verified
                  </span>
                  {" Teachers"}
                </button>
                {" "}
                <button className="tabBtn px-3 py-1.5 rounded-lg text-xs font-medium" data-tab="convos">
                  <span className="material-symbols-rounded text-sm">
                    chat
                  </span>
                  {" Connections"}
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto" id="listsScroll">
              <div id="teachersWrap" className="divide-y divide-black/5 dark:divide-white/10">
                <div id="teacherList" className="text-sm" />
              </div>
              <div id="convosWrap" className="hidden divide-y divide-black/5 dark:divide-white/10">
                <div id="connectionList" className="text-sm" />
              </div>
            </div>
          </div>
        </aside>
        {/* CENTER: Chat */}
        <section className="flex flex-col min-h-0">
          {/* Chat header */}
          <div
            id="convHeader"
            className="glass ring-1 ring-black/10 dark:ring-white/15 px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/10 sticky top-0 z-10"
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                id="openLeft2"
                className="md:hidden size-10 grid place-items-center rounded-full ring-1 ring-black/10 dark:ring-white/15"
              >
                <span className="material-symbols-rounded">
                  chevron_left
                </span>
              </button>
              {" "}
              <div
                id="partnerAvatar"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500/30 to-brand-500/10 ring-1 ring-black/10 dark:ring-white/15 grid place-items-center font-semibold"
              >
                {" ?"}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate" id="partnerName">
                  {"Select a teacher to start chatting "}
                </div>
                <div className="text-[11px] text-neutral-600 dark:text-white/70 flex items-center gap-2">
                  <span className="presence-dot bg-neutral-300" id="presenceDot" />
                  <span id="presenceText">
                    —
                  </span>
                </div>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <a
                href="../../collage/clg_info.html"
                className="size-9 grid place-items-center rounded-lg ring-1 ring-black/10 dark:ring-white/15"
                title="Colleges"
              >
                <span className="material-symbols-rounded">
                  school
                </span>
              </a>
            </div>
          </div>
          {/* Messages */}
          <div
            id="messages"
            className="flex-1 overflow-y-auto px-4 py-6 bg-gradient-to-b from-white/60 to-white/20 dark:from-brand-900/40 dark:to-brand-900/10 relative"
          />
          {/* Composer */}
          <form
            id="sendForm"
            className="hidden glass ring-1 ring-black/10 dark:ring-white/15 px-3 py-3 flex items-end gap-3 border-t border-black/5 dark:border-white/10 sticky bottom-0"
          >
            <button
              type="button"
              className="size-10 grid place-items-center rounded-full ring-1 ring-black/10 dark:ring-white/15"
              id="attachBtn"
              title="Attach"
            >
              <span className="material-symbols-rounded">
                attach_file
              </span>
            </button>
            {" "}
            <div className="flex-1">
              <textarea
                name="content"
                id="composer"
                placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                className="w-full resize-none rounded-xl border-0 ring-1 ring-black/10 dark:ring-white/15 bg-white/90 dark:bg-white/10 p-3 text-sm h-14 max-h-40"
              />
            </div>
            {" "}
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 text-white font-semibold px-5 py-3 text-sm hover:shadow-glow transition"
            >
              <span className="material-symbols-rounded text-base">
                send
              </span>
              <span className="hidden sm:inline">
                Send
              </span>
            </button>
          </form>
          {" "}
          {/* Jump to latest */}
          <button
            id="jumpLatest"
            className="hidden absolute bottom-28 right-6 md:right-8 z-10 px-3 py-1.5 rounded-full bg-white/90 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 text-xs"
          >
            <span className="material-symbols-rounded text-sm">
              arrow_downward
            </span>
            {" New messages"}
          </button>
        </section>
        {/* RIGHT PANE REMOVED */}
      </main>
      {/* Toasts */}
      <div id="toastHost" className="fixed inset-0 pointer-events-none flex flex-col items-end gap-2 p-4 z-50" />
      <script src="/_legacy/teachers/teacher_connect/script-02.js" />
      <script src="/_legacy/teachers/teacher_connect/script-03.js" />
    </LegacyPage>
  );
}
