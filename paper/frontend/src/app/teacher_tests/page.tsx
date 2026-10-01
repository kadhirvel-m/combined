// Converted from ui/teacher_tests.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/teacher_tests/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Teacher Tests - PaperX",
  description: "Manage your tests with completion insights",
};

export default function TeacherTestsPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen page-bg text-[#0d1117] dark:text-zinc-100"}}
      head={
        <>
          <link rel="icon" type="image/x-icon" href="assets/img/favicon.svg" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="/config.js" />
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/_legacy/teacher_tests/style-01.css" />
      {/* ── original <body> ── */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full bg-white/70 dark:bg-brand-900/60 backdrop-blur supports-[backdrop-filter]:saturate-150 border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-4">
          <a href="./index.html" className="flex items-center gap-3" aria-label="Paper X Home">
            {" "}
            <img src="./assets/img/logo-light.svg" alt="Paper X" className="h-10 w-auto dark:hidden" />
            {" "}
            <img src="./assets/img/logo-dark.svg" alt="Paper X" className="h-10 w-auto hidden dark:block" />
            {" "}
          </a>
          {" "}
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700 dark:text-white/85">
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="./index.html">
              Home
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="./about.html">
              About
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="./teacher_profile.html">
              Profile
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="./teacher_classes_manage.html">
              Classes
            </a>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <button
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
              href="./teacher_test_builder.html"
              className="inline-flex items-center justify-center rounded-full bg-brand-500 text-white text-sm font-semibold px-4 py-2.5 hover:shadow-glow transition"
            >
              Create Test
            </a>
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
            href="./index.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Home
          </a>
          {" "}
          <a
            href="./teacher_profile.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Profile
          </a>
          {" "}
          <a
            href="./teacher_classes_manage.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Classes
          </a>
          {" "}
          <a
            href="./teacher_test_builder.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Create Test
          </a>
        </div>
      </nav>
      <main className="container mx-auto px-4 pb-12" style={{ paddingTop: "110px !important" }}>
        <div className="w-full max-w-none space-y-8">
          <section className="w-full">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4 max-w-5xl">
              {" Tests with a cleaner "}
              <span className="bg-gradient-to-r from-[#9E4B8A] to-[#FF7FD1] bg-clip-text text-transparent">
                teaching dashboard
              </span>
            </h1>
          </section>
          <div className="dashboard-columns">
            <div className="w-full lg:w-auto">
              <div className="video-carousel-container relative carousel-shell">
                <div style={{ position: "relative", overflow: "hidden", borderRadius: "50%", aspectRatio: "1/1", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", background: "linear-gradient(to bottom right, rgba(158, 75, 138, 0.1), rgba(76, 42, 89, 0.1))" }}>
                  <div id="videoCarousel" className="relative w-full h-full">
                    <video
                      className="carousel-video absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500"
                      src="./assets/video/group/1.mp4"
                      muted
                      loop
                      playsInline
                    />
                    {" "}
                    <video
                      className="carousel-video absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500"
                      src="./assets/video/group/2.mp4"
                      muted
                      loop
                      playsInline
                    />
                    {" "}
                    <video
                      className="carousel-video absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500"
                      src="./assets/video/group/3.mp4"
                      muted
                      loop
                      playsInline
                    />
                  </div>
                  {" "}
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
                  <div style={{ position: "absolute", bottom: "0", left: "0", right: "0", zIndex: "20", textAlign: "center", overflow: "visible" }}>
                    <div style={{ background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", borderRadius: "50% 50% 0 0 / 100% 100% 0 0", padding: "45px 20px 30px 20px" }}>
                      <h3
                        id="carouselTitle"
                        style={{ color: "#1E1E2F", fontSize: "1.5rem", fontWeight: "700", margin: "0 0 8px 0", wordWrap: "break-word", overflowWrap: "break-word", whiteSpace: "normal" }}
                      >
                        {" Track completion in real-time"}
                      </h3>
                      <p
                        id="carouselDesc"
                        style={{ color: "#555", fontSize: "0.75rem", margin: "0 auto", lineHeight: "1.5", maxWidth: "90%", wordWrap: "break-word", overflowWrap: "break-word", whiteSpace: "normal" }}
                      >
                        {" View progress, improve outcomes, and manage tests with confidence."}
                      </p>
                    </div>
                  </div>
                </div>
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
            <div className="w-full min-w-0">
              <div className="glass-card p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold">
                      My Tests
                    </h2>
                  </div>
                  {" "}
                  <a
                    href="./teacher_test_builder.html"
                    className="btn-primary px-5 py-3 rounded-xl font-semibold text-sm inline-flex items-center gap-2"
                  >
                    {" "}
                    <span className="icon">
                      add
                    </span>
                    {"Create "}
                  </a>
                </div>
                <div id="alert" className="hidden rounded-xl px-4 py-3 text-sm" />
                <div id="tests" className="tests-panel space-y-4 pr-1" />
              </div>
            </div>
          </div>
        </div>
      </main>
      <div id="toast" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 hidden">
        <div className="glass-card px-6 py-3 flex items-center gap-3 shadow-xl">
          <span id="toastIcon" className="icon text-brand-500">
            check_circle
          </span>
          {" "}
          <span id="toastText" />
        </div>
      </div>
      <script src="/_legacy/teacher_tests/script-01.js" />
      <script src="/auth.js" />
    </LegacyPage>
  );
}
