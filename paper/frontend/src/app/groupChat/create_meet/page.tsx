// Converted from ui/groupChat/create_meet.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/groupChat/create_meet/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Create / Join Meet — PaperX",
  description: "Create or join a video meet room",
};

export default function GroupChatCreateMeetPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen page-bg text-[#0d1117] dark:text-zinc-100"}}
      head={
        <>
          <link rel="icon" type="image/x-icon" href="../assets/img/favicon.svg" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="/config.js" />
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/_legacy/groupChat/create_meet/style-01.css" />
      {/* ── original <body> ── */}
      {/* Navbar (same as about.html, paths adjusted) */}
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
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg:white/5"
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
              className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg:white/5 transition"
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
      {/* Mobile drawer (same as about.html, paths adjusted) */}
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
      <main className="container mx-auto px-4 pb-12" style={{ paddingTop: "110px !important" }}>
        <div className="max-w-6xl mx-auto">
          {/* Two Column Layout */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center min-h-[calc(100vh-200px)]">
            {/* LEFT Column: Video Carousel */}
            <div className="w-full max-w-sm lg:max-w-none lg:w-1/2 lg:flex-1 mx-auto">
              <div className="video-carousel-container relative">
                {/* Carousel Wrapper - Circular */}
                <div style={{ position: "relative", overflow: "hidden", borderRadius: "50%", aspectRatio: "1/1", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", background: "linear-gradient(to bottom right, rgba(158, 75, 138, 0.1), rgba(76, 42, 89, 0.1))" }}>
                  {/* Videos */}
                  <div id="videoCarousel" className="relative w-full h-full">
                    <video
                      className="carousel-video absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500"
                      src="../assets/video/group/1.mp4"
                      muted
                      loop
                      playsInline
                    />
                    {" "}
                    <video
                      className="carousel-video absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500"
                      src="../assets/video/group/2.mp4"
                      muted
                      loop
                      playsInline
                    />
                    {" "}
                    <video
                      className="carousel-video absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500"
                      src="../assets/video/group/3.mp4"
                      muted
                      loop
                      playsInline
                    />
                  </div>
                  {" "}
                  {/* Navigation Arrows */}
                  <button
                    id="prevVideo"
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur flex items-center justify-center shadow-lg hover:scale-105 transition z-10"
                  >
                    <span className="icon text-2xl">
                      chevron_left
                    </span>
                  </button>
                  {" "}
                  <button
                    id="nextVideo"
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur flex items-center justify-center shadow-lg hover:scale-105 transition z-10"
                  >
                    <span className="icon text-2xl">
                      chevron_right
                    </span>
                  </button>
                  {" "}
                  {/* Caption Overlay - Semi-transparent white semi-circle at bottom */}
                  <div style={{ position: "absolute", bottom: "0", left: "0", right: "0", zIndex: "20", textAlign: "center", overflow: "visible" }}>
                    <div style={{ background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", borderRadius: "50% 50% 0 0 / 100% 100% 0 0", padding: "45px 20px 30px 20px" }}>
                      <h3
                        id="carouselTitle"
                        style={{ color: "#1E1E2F", fontSize: "1.5rem", fontWeight: "700", margin: "0 0 8px 0", wordWrap: "break-word", overflowWrap: "break-word", whiteSpace: "normal" }}
                      >
                        {" Your meeting is safe"}
                      </h3>
                      <p
                        id="carouselDesc"
                        style={{ color: "#555", fontSize: "0.75rem", margin: "0 auto", lineHeight: "1.5", maxWidth: "90%", wordWrap: "break-word", overflowWrap: "break-word", whiteSpace: "normal" }}
                      >
                        {" No one can join a meeting unless invited or admitted by the host"}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Carousel Dots */}
                <div id="carouselDots" className="flex justify-center gap-2 mt-4">
                  <button
                    className="carousel-dot w-2.5 h-2.5 rounded-full bg-[#9E4B8A]/30 transition-all duration-300"
                    data-index="0"
                  />
                  {" "}
                  <button
                    className="carousel-dot w-2.5 h-2.5 rounded-full bg-[#9E4B8A]/30 transition-all duration-300"
                    data-index="1"
                  />
                  {" "}
                  <button
                    className="carousel-dot w-2.5 h-2.5 rounded-full bg-[#9E4B8A]/30 transition-all duration-300"
                    data-index="2"
                  />
                </div>
              </div>
            </div>
            {/* RIGHT Column: Text + Actions */}
            <div className="w-full lg:w-1/2 lg:flex-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-4">
                {" Video calls and meetings for "}
                <span className="bg-gradient-to-r from-[#9E4B8A] to-[#FF7FD1] bg-clip-text text-transparent">
                  everyone
                </span>
              </h1>
              <p className="text-lg sm:text-xl opacity-70 mb-8">
                {" Connect, collaborate and celebrate from anywhere with PaperX Meet "}
              </p>
              {/* Combined Create & Join Card */}
              <div className="glass-card p-6 sm:p-8">
                {/* Create Meeting Section */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-shrink-0">
                    <button
                      id="createRoomBtn"
                      className="btn-primary px-6 py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      <span className="icon">
                        video_call
                      </span>
                      {" New meeting "}
                    </button>
                  </div>
                  {/* Join Meeting Section */}
                  <div className="flex-1 flex gap-2 items-center">
                    <div className="flex-1 relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 icon opacity-50 pointer-events-none">
                        keyboard
                      </span>
                      {" "}
                      <input
                        type="text"
                        id="joinRoomInput"
                        placeholder="Enter a code or link"
                        className="input w-full pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2"
                        style={{ "--tw-ring-color": "rgba(158, 75, 138, 0.55)", paddingLeft: "2.5rem !important" }}
                      />
                    </div>
                    {" "}
                    <button
                      id="joinRoomBtn"
                      className="text-[#9E4B8A] dark:text-[#FF7FD1] font-semibold px-4 py-3.5 rounded-xl hover:bg-[#9E4B8A]/10 dark:hover:bg-[#FF7FD1]/10 transition whitespace-nowrap disabled:opacity-50"
                    >
                      {" Join "}
                    </button>
                  </div>
                </div>
                {/* Optional Room Name (Collapsible) */}
                <div className="border-t border-black/5 dark:border-white/10 pt-4">
                  <details className="group">
                    <summary className="flex items-center gap-2 cursor-pointer text-sm opacity-70 hover:opacity-100 transition select-none">
                      <span className="icon text-base group-open:rotate-90 transition-transform">
                        chevron_right
                      </span>
                      {" Advanced options "}
                    </summary>
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="block text-sm font-medium opacity-80 mb-2" htmlFor="roomNameInput">
                          Room name (optional)
                        </label>
                        {" "}
                        <input
                          type="text"
                          id="roomNameInput"
                          placeholder="Eg: Data Structures Doubts"
                          className="input w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2"
                          style={{ "--tw-ring-color": "rgba(158, 75, 138, 0.55)" }}
                        />
                      </div>
                    </div>
                  </details>
                </div>
                {/* Quick Links */}
                <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-sm">
                  <a
                    href="../index.html"
                    className="opacity-70 hover:opacity-100 transition flex items-center gap-2"
                  >
                    {" "}
                    <span className="icon">
                      home
                    </span>
                    {" Home "}
                  </a>
                  {" "}
                  <a
                    href="group_history.html"
                    className="opacity-70 hover:opacity-100 transition flex items-center gap-2"
                  >
                    {" "}
                    <span className="icon">
                      history
                    </span>
                    {" Call history "}
                  </a>
                </div>
              </div>
              <p className="text-sm opacity-60 mt-4">
                <span className="icon text-base align-middle">
                  info
                </span>
                {" Share the room ID with your classmates to invite them. "}
              </p>
            </div>
          </div>
        </div>
      </main>
      {/* Toast notifications */}
      <div id="toast" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 hidden">
        <div className="glass-card px-6 py-3 flex items-center gap-3 shadow-xl">
          <span id="toastIcon" className="icon text-brand-500">
            check_circle
          </span>
          {" "}
          <span id="toastText" />
        </div>
      </div>
      <script src="/_legacy/groupChat/create_meet/script-01.js" />
      <script src="/_legacy/groupChat/create_meet/script-02.js" />
      {/* Auth dynamic navbar script (same as about.html) */}
      <script src="/auth.js" />
    </LegacyPage>
  );
}
