// Converted from ui/mediX/chatbot.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/mediX/chatbot/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Medix Chatbot — Paper X",
};

export default function MediXChatbotPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth overflow-x-hidden"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-gradient-to-b from-white via-fuchsia-50/30 to-violet-100/40 dark:from-[#161525] dark:via-[#1d1930] dark:to-[#171124] transition-colors overflow-x-hidden"}}
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
      <script src="/config.js" />
      <link rel="stylesheet" href="/_legacy/mediX/chatbot/style-01.css" />
      <script src="/_legacy/mediX/chatbot/script-01.js" />
      {/* ── original <body> ── */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full bg-white/70 dark:bg-brand-900/60 backdrop-blur supports-[backdrop-filter]:saturate-150 border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-4">
          <a href="../index.html" className="flex items-center gap-3" aria-label="Paper X Home">
            {" "}
            <img src="../assets/img/logo-light.svg" alt="Paper X" className="h-10 w-auto dark:hidden" />
            {" "}
            <img src="../assets/img/logo-dark.svg" alt="Paper X" className="h-10 w-auto hidden dark:block" />
            {" "}
          </a>
          {" "}
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700 dark:text-white/85">
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="../index.html">
              Home
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="../about.html">
              About
            </a>
            {" "}
            <button className="group inline-flex items-center gap-1 hover:text-brandlt-900 dark:hover:text-white transition">
              {"Products "}
              <span className="material-symbols-rounded text-base opacity-70 group-hover:opacity-100">
                expand_more
              </span>
            </button>
            {" "}
            <button className="group inline-flex items-center gap-1 hover:text-brandlt-900 dark:hover:text-white transition">
              {"Solutions "}
              <span className="material-symbols-rounded text-base opacity-70 group-hover:opacity-100">
                expand_more
              </span>
            </button>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="../contact.html">
              Contact
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="../help.html">
              Help
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="../index.html#pricing">
              Pricing
            </a>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <button
              id="themeToggle"
              data-theme-toggle=""
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
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
            {" "}
            <a
              href="../login.html"
              className="text-sm text-neutral-700 dark:text-white/85 hover:text-brandlt-900 dark:hover:text-white px-3 py-2 rounded-full"
            >
              Log in
            </a>
            {" "}
            <a
              href="../signup.html"
              className="inline-flex items-center justify-center rounded-full bg-brand-500 text-white text-sm font-semibold px-4 py-2.5 hover:shadow-glow transition"
            >
              Sign up
            </a>
            {" "}
            <a
              id="navProfile"
              href="../profile.html"
              title="Profile"
              className="hidden items-center justify-center w-10 h-10 rounded-full overflow-hidden border border-black/10 dark:border-white/10 bg-white/90 dark:bg-brand-900/60"
            >
              {" "}
              <img id="navProfileImg" alt="Profile" className="w-full h-full object-cover hidden" />
              {" "}
              <span id="navProfileInitial" className="text-xs font-semibold">
                ME
              </span>
              {" "}
            </a>
            {" "}
            <button
              id="signOutBtn"
              type="button"
              title="Sign out"
              aria-label="Sign out"
              className="hidden items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-3 py-1.5 text-sm text-neutral-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <span className="material-symbols-rounded text-base">
                logout
              </span>
              {" "}
              <span>
                Sign out
              </span>
            </button>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              data-theme-toggle=""
              aria-label="Toggle theme"
              className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <span className="material-symbols-rounded">
                dark_mode
              </span>
            </button>
            {" "}
            <button
              id="mobileNavToggle"
              type="button"
              aria-expanded="false"
              aria-controls="mobileNavPanel"
              className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <span className="sr-only">
                Toggle navigation
              </span>
              {" "}
              <span className="material-symbols-rounded" data-icon="">
                menu
              </span>
            </button>
          </div>
        </div>
      </header>
      <div
        id="mobileNavBackdrop"
        aria-hidden="true"
        className="hidden md:hidden fixed inset-0 z-40 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
      />
      <nav
        id="mobileNavPanel"
        aria-hidden="true"
        className="hidden md:hidden fixed inset-x-4 top-24 z-50 flex flex-col gap-5 max-h-[calc(100vh-6.5rem)] overflow-y-auto rounded-3xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-brand-900/95 shadow-card backdrop-blur supports-[backdrop-filter]:backdrop-blur-xl p-6"
      >
        <div className="flex flex-col gap-2 text-sm text-neutral-700 dark:text-white/80">
          <a
            href="../index.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Home
          </a>
          {" "}
          <a
            href="../about.html#values"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Values
          </a>
          {" "}
          <a
            href="../about.html#journey"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Journey
          </a>
          {" "}
          <a
            href="../about.html#team"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Team
          </a>
          {" "}
          <a
            href="../contact.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Contact
          </a>
          {" "}
          <a
            href="../help.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Help
          </a>
          {" "}
          <a
            href="../index.html#pricing"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Pricing
          </a>
        </div>
        <div className="flex flex-col gap-3 border-t border-black/5 dark:border-white/10 pt-4">
          <a
            href="../login.html"
            data-close-mobile-nav=""
            className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium ring-1 ring-black/10 dark:ring-white/15 text-neutral-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            Log in
          </a>
          {" "}
          <a
            href="../signup.html"
            data-close-mobile-nav=""
            className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] shadow-[0_4px_18px_-6px_rgba(158,75,138,0.6)] hover:shadow-[0_6px_24px_-8px_rgba(158,75,138,0.7)] transition"
          >
            Sign up
          </a>
          {" "}
          <a
            id="navProfileMobile"
            href="../profile.html"
            data-close-mobile-nav=""
            className="hidden inline-flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/15 px-4 py-2 text-sm text-neutral-700 dark:text-white/80 bg-white/70 dark:bg-brand-900/60"
          >
            {" "}
            <span className="material-symbols-rounded text-base">
              account_circle
            </span>
            {" "}
            <span data-profile-name="">
              My profile
            </span>
            {" "}
          </a>
          {" "}
          <button
            id="signOutBtnMobile"
            type="button"
            className="hidden inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-4 py-2 text-sm text-neutral-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            <span className="material-symbols-rounded text-base">
              logout
            </span>
            {" "}
            <span>
              Sign out
            </span>
          </button>
        </div>
      </nav>
      {/* ── Chat Container ── */}
      <div id="chatContainer" style={{ paddingTop: "72px" }}>
        {/* Welcome Screen (shown initially, hidden after first message) */}
        <div id="welcomeScreen">
          <div className="welcome-icon">
            <span className="material-symbols-rounded" style={{ fontSize: "32px", color: "#fff" }}>
              smart_toy
            </span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px", margin: "0" }}>
            Medix AI
          </h1>
          <p style={{ marginTop: "8px", fontSize: "15px", opacity: "0.5", maxWidth: "400px" }}>
            Your intelligent medical assistant. Ask questions about your uploaded documents.
          </p>
          {" "}
          <a
            href="../heart.html"
            className="suggestion-chip"
            style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none", margin: "20px auto 0" }}
          >
            {"♥ Heart — 3D anatomy, physiology labs & MBBS curriculum "}
            <span aria-hidden="true">
              ↗
            </span>
          </a>
          {" "}
          <div className="suggestion-chips">
            <button className="suggestion-chip" data-px-onclick="useSuggestion(this)" data-px="">
              📋 Summarize the key findings from my uploaded PDF
            </button>
            {" "}
            <button className="suggestion-chip" data-px-onclick="useSuggestion(this)" data-px="">
              💊 What medications are mentioned in the documents?
            </button>
            {" "}
            <button className="suggestion-chip" data-px-onclick="useSuggestion(this)" data-px="">
              🔬 Explain the diagnosis in simple terms
            </button>
            {" "}
            <button className="suggestion-chip" data-px-onclick="useSuggestion(this)" data-px="">
              📊 Compare the test results across reports
            </button>
          </div>
        </div>
        {/* Messages area (hidden initially, shown after first message) */}
        <div id="messages" style={{ display: "none" }} />
        {/* Input area */}
        <div id="inputArea">
          <div className="input-wrapper">
            <form id="chatForm" autoComplete="off">
              <div className="input-box">
                <textarea
                  id="prompt"
                  rows={1}
                  placeholder="Message Medix AI..."
                  data-px-oninput="autoGrow(this)"
                  data-px=""
                />
                {" "}
                <button id="sendBtn" type="submit" className="send-btn" aria-label="Send message">
                  <span className="material-symbols-rounded" style={{ fontSize: "20px", verticalAlign: "0" }}>
                    arrow_upward
                  </span>
                </button>
              </div>
            </form>
            <div className="input-footer">
              Medix AI can make mistakes. Verify important medical information.
            </div>
          </div>
        </div>
      </div>
      {" "}
      {/* Hidden inputs for retrieval params (defaults hardcoded, no UI shown) */}
      <input type="hidden" id="sessionId" value="" />
      {" "}
      <input type="hidden" id="topK" value="20" />
      {" "}
      <input type="hidden" id="minScore" value="0.35" />
      {" "}
      <input type="hidden" id="temp" value="0.2" />
      {" "}
      <select id="sourceIds" multiple style={{ display: "none" }} />
      {" "}
      <script src="/_legacy/mediX/chatbot/script-02.js" />
      {" "}
      <script src="/_legacy/mediX/chatbot/script-03.js" />
      {" "}
      <script src="/_legacy/mediX/chatbot/script-04.js" />
      {" "}
      <script src="/auth.js" />
    </LegacyPage>
  );
}
