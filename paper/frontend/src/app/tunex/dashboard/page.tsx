// Converted from ui/tunex/dashboard.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/tunex/dashboard/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "GateX Pro Dashboard",
};

export default function TunexDashboardPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"dark"}}
      body={{"class":"font-sans antialiased text-gray-100 bg-gatex-bg transition-colors duration-300","x-data":"{ \n          darkMode: localStorage.getItem('px_theme') === 'light' ? false : true,\n          sidebarOpen: true,\n          leaderboardTab: 'global',\n          init() {\n              this.$watch('darkMode', val => {\n                  localStorage.setItem('px_theme', val ? 'dark' : 'light');\n                  document.documentElement.classList.toggle('dark', val);\n              });\n              if (!this.darkMode) document.documentElement.classList.remove('dark');\n          }\n      }","x-init":"init()"}}
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <script src="/config.js" />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer />
      <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
      <script src="https://cdn.jsdelivr.net/npm/chart.js" />
      <script src="/_legacy/tunex/dashboard/script-01.js" />
      <link rel="stylesheet" href="/_legacy/tunex/dashboard/style-01.css" />
      {/* ── original <body> ── */}
      <div className="flex h-screen overflow-hidden">
        <aside
          className="hidden md:flex flex-shrink-0 flex-col justify-between border-r border-white/5 bg-gatex-card transition-all duration-300 z-20"
          {...{ ":class": "sidebarOpen ? 'w-56' : 'w-20'" }}
        >
          <div className="h-20 flex items-center justify-center border-b border-white/5">
            {/* Collapsed View - Icon Only */}
            <img x-show="!sidebarOpen" src="../assets/img/icon.svg" alt="GateX" className="w-10 h-10" />
            {" "}
            {/* Expanded View - Full Logo */}
            <template
              x-if="sidebarOpen"
              dangerouslySetInnerHTML={{ __html: "\n                    <div class=\"mt-6 mb-4\">\n                        <!-- Dark Theme Logo -->\n                        <img x-show=\"darkMode\" src=\"../assets/img/gatex-dark-logo.svg\" alt=\"GateX\" class=\"h-10\">\n                        <!-- Light Theme Logo -->\n                        <img x-show=\"!darkMode\" src=\"../assets/img/gatex-light-logo.svg\" alt=\"GateX\" class=\"h-10\">\n                    </div>\n                " }}
            />
          </div>
          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto min-h-0">
            <p
              x-show="sidebarOpen"
              className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
            >
              {" Learning"}
            </p>
            {" "}
            <a
              href="index.html"
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gatex-primary/10 text-gatex-primary border border-gatex-primary/20"
            >
              {" "}
              <i className="ri-dashboard-fill text-lg" />
              {" "}
              <span x-show="sidebarOpen" className="font-medium text-sm">
                Dashboard
              </span>
              {" "}
            </a>
            {" "}
            <a
              href="index.html"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition"
            >
              {" "}
              <i className="ri-route-line text-lg" />
              {" "}
              <span x-show="sidebarOpen" className="font-medium text-sm">
                Coding Tracks
              </span>
              {" "}
            </a>
            {" "}
            <a
              href="compiler.html"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition"
            >
              {" "}
              <i className="ri-code-box-line text-lg" />
              {" "}
              <span x-show="sidebarOpen" className="font-medium text-sm">
                Code Playground
              </span>
              {" "}
            </a>
            {" "}
            <a
              href="notebook.html"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition"
            >
              {" "}
              <i className="ri-book-2-line text-lg" />
              {" "}
              <span x-show="sidebarOpen" className="font-medium text-sm">
                Notebooks
              </span>
              {" "}
            </a>
            {" "}
            <a
              href="solver.html?id=550e8400-e29b-41d4-a716-446655440005"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition"
            >
              {" "}
              <i className="ri-fire-line text-lg" />
              {" "}
              <span x-show="sidebarOpen" className="font-medium text-sm">
                Daily Challenges
              </span>
              {" "}
            </a>
            {" "}
            <p
              x-show="sidebarOpen"
              className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4 mb-2"
            >
              Community
            </p>
            {" "}
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition"
            >
              {" "}
              <i className="ri-trophy-line text-lg" />
              {" "}
              <span x-show="sidebarOpen" className="font-medium text-sm">
                Leaderboard
              </span>
              {" "}
            </a>
          </nav>
          {/* Explore Community Card */}
          <div x-show="sidebarOpen" className="px-3 mb-3 mt-14 flex-shrink-0">
            {/* Increased margin for larger pop-out */}
            <div className="rounded-2xl p-4 text-center relative" style={{ backgroundColor: "#9e4b8a" }}>
              {/* Decor */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 overflow-hidden" />
              {" "}
              {/* Bubu Image Pop-out */}
              <img
                src="../assets/img/bubu.png"
                alt="Community"
                className="absolute -top-20 left-1/2 -translate-x-1/2 w-24 drop-shadow-lg filter"
                style={{ maxWidth: "none" }}
              />
              {" "}
              {/* Content (pushed down slightly) */}
              <div className="mt-8">
                <h4 className="!text-white font-bold text-sm">
                  Explore Community
                </h4>
                <p className="!text-white/80 text-[10px] mb-3">
                  Support each others
                </p>
                {" "}
                <button className="w-full bg-white text-[#9e4b8a] font-bold text-xs py-2 px-4 rounded-lg hover:bg-gray-100 transition shadow-lg">
                  {" Explore "}
                </button>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-white/5 flex-shrink-0">
            <a
              href="../profile.html"
              className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition"
            >
              {" "}
              <div
                className="w-8 h-8 rounded-full ring-2 ring-gatex-primary bg-gatex-card flex items-center justify-center overflow-hidden"
                id="userAvatar"
              >
                <i className="ri-user-line text-gray-400" />
              </div>
              <div x-show="sidebarOpen" className="text-left overflow-hidden">
                <p className="text-xs font-bold text-white truncate" id="userName">
                  Loading...
                </p>
                <p className="text-[10px] text-gray-500 truncate" id="userEmail">
                  ...
                </p>
              </div>
              {" "}
            </a>
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto relative scroll-smooth bg-gatex-bg">
          <header className="h-16 flex items-center justify-between px-6 sticky top-0 z-30 glass-header border-b border-white/5">
            <div className="flex items-center gap-4">
              <button
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                {...{ "x-on:click": "sidebarOpen = !sidebarOpen" }}
              >
                <i className="ri-menu-fold-line text-xl" />
              </button>
              {" "}
              <div className="hidden md:flex items-center bg-gatex-card border border-white/5 rounded-full px-4 py-1.5 w-64">
                <i className="ri-search-line text-gray-500" />
                {" "}
                <input
                  type="text"
                  placeholder="Search concepts..."
                  className="bg-transparent border-none outline-none text-sm ml-2 text-white w-full placeholder-gray-600"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-gatex-card dark:bg-gatex-card px-3 py-1 rounded-full border border-white/5 dark:border-white/5">
                <i className="ri-vip-diamond-fill text-blue-400 text-xs" />
                {" "}
                <span className="text-xs font-bold">
                  2,450 XP
                </span>
              </div>
              {" "}
              {/* Theme Toggle Button */}
              <button
                className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 dark:hover:bg-white/10 transition-all"
                title="Toggle Theme"
                {...{ "x-on:click": "darkMode = !darkMode" }}
              >
                <i x-show="darkMode" className="ri-sun-line text-lg text-yellow-400" />
                {" "}
                <i x-show="!darkMode" className="ri-moon-line text-lg text-indigo-400" />
              </button>
              {" "}
              <button className="relative p-2 text-gray-400 hover:text-white">
                <i className="ri-notification-3-line text-lg" />
                {" "}
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-gatex-bg" />
              </button>
              {" "}
              {/* Logout Button */}
              <button
                id="logoutBtn"
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                title="Logout"
              >
                <i className="ri-logout-box-r-line text-lg" />
              </button>
            </div>
          </header>
          <div className="p-6 max-w-[1600px] mx-auto pb-20">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Progress Stats Row */}
              <div className="col-span-1 md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Completed Courses */}
                <div className="bento-card bg-gatex-card border border-white/5 rounded-2xl p-4 flex items-center gap-4 group hover:border-blue-500/30 transition-all">
                  {/* Circular Progress Pie */}
                  <div className="w-12 h-12 relative">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="rgba(59, 130, 246, 0.2)"
                        strokeWidth="3"
                      />
                      {" "}
                      <circle
                        id="completedCircle"
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="3"
                        strokeDasharray="0, 100"
                        strokeLinecap="round"
                      />
                    </svg>
                    {" "}
                    <span
                      id="completedPercentText"
                      className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-blue-400"
                    >
                      0%
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-black text-white">
                      <span id="completedCount">
                        124
                      </span>
                      <span id="totalCount" className="text-sm font-normal text-gray-500">
                        /500
                      </span>
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Problems Solved
                    </p>
                  </div>
                  {" "}
                  <svg className="w-16 h-8 text-blue-500/30" viewBox="0 0 64 32">
                    <path
                      d="M0,24 Q16,20 24,16 T40,12 T56,8 L64,4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                {/* Earned Certificates */}
                <div className="bento-card bg-gatex-card border border-white/5 rounded-2xl p-4 flex items-center gap-4 group hover:border-emerald-500/30 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <i className="ri-medal-fill text-emerald-400 text-xl" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-black text-white">
                      12
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Badges Earned
                    </p>
                  </div>
                  {" "}
                  <svg className="w-16 h-8 text-emerald-500/30" viewBox="0 0 64 32">
                    <path
                      d="M0,20 Q12,24 24,18 T48,10 T64,6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                {/* Courses in Progress */}
                <div className="bento-card bg-gatex-card border border-white/5 rounded-2xl p-4 flex items-center gap-4 group hover:border-amber-500/30 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <i className="ri-code-s-slash-line text-amber-400 text-xl" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-black text-white">
                      3
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Active Tracks
                    </p>
                  </div>
                  {" "}
                  <svg className="w-16 h-8 text-amber-500/30" viewBox="0 0 64 32">
                    <path
                      d="M0,16 Q16,20 28,14 T52,10 T64,8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                {/* Percent Completed */}
                <div className="bento-card bg-gatex-card border border-white/5 rounded-2xl p-4 flex items-center gap-4 group hover:border-orange-500/30 transition-all">
                  {/* Circular Progress Pie */}
                  <div className="w-12 h-12 relative">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="rgba(249, 115, 22, 0.2)"
                        strokeWidth="3"
                      />
                      {" "}
                      <circle
                        id="overallCircle"
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="#F97316"
                        strokeWidth="3"
                        strokeDasharray="0, 100"
                        strokeLinecap="round"
                      />
                    </svg>
                    {" "}
                    <span
                      id="overallPercentText"
                      className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-orange-400"
                    >
                      0%
                    </span>
                  </div>
                  <div className="flex-1">
                    <p id="overallPercentBig" className="text-2xl font-black text-white">
                      0%
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Percent Completed
                    </p>
                  </div>
                  {" "}
                  <svg className="w-16 h-8 text-orange-500/30" viewBox="0 0 64 32">
                    <path
                      d="M0,22 Q20,16 32,20 T56,10 T64,6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
              <div className="col-span-1 md:col-span-12 lg:col-span-8 bento-card bg-gradient-to-r from-gatex-card to-gatex-secondary rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute right-0 top-0 h-full w-1/2 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-gatex-primary blur-[100px] opacity-40 rounded-full" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider !text-white">
                      {" "}
                      <i className="ri-terminal-box-fill text-gatex-primary mr-1" />
                      {" Continue "}
                    </span>
                    {" "}
                    <span className="!text-white/60 text-xs">
                      Chapter 6/10
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold !text-white mb-2">
                    Python Fundamentals: While Loops
                  </h2>
                  <p className="!text-white/80 text-sm max-w-lg mb-8 leading-relaxed">
                    {" Master the logic of repetition. Complete the loop control quiz and solve the \"Number Guessing\" challenge. "}
                  </p>
                  <div className="flex items-center gap-4">
                    <a
                      href={"topic.html?id=c30bb135-1029-493c-82e3-5ab5edde3ae4&title=While%20Loops"}
                      className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-white/10"
                    >
                      {" Resume Learning "}
                      <i className="ri-arrow-right-line" />
                      {" "}
                    </a>
                    {" "}
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gatex-card border border-white/10 flex items-center justify-center text-[10px] text-gray-400">
                        {" +400"}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gatex-card border border-white/10 flex items-center justify-center text-xs">
                        {" XP"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Enhanced Streak Component */}
              <div className="col-span-1 md:col-span-6 lg:col-span-4 bento-card bg-gatex-card border border-white/5 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden streak-card">
                {/* Animated Background Fire Glow */}
                <div className="absolute -right-20 -top-20 w-56 h-56 bg-orange-500/20 rounded-full blur-[80px] streak-glow-bg" />
                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-red-500/10 rounded-full blur-[60px] streak-glow-secondary" />
                {/* Main Header Section */}
                <div className="flex justify-between items-start z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                        🔥 Learning Streak
                      </span>
                      {" "}
                      <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[9px] font-bold rounded-full border border-orange-500/20">
                        ON FIRE
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-300 via-orange-500 to-red-600 streak-number"
                        id="currentStreak"
                      >
                        0
                      </span>
                      {" "}
                      <span className="text-sm font-bold text-gray-300 dark:text-gray-300">
                        Days
                      </span>
                      {" "}
                      <span className="text-[10px] text-gray-500 ml-2" id="streakPersonalBest">
                        · Personal Best: 0
                      </span>
                    </div>
                  </div>
                  {/* Premium Fire Icon with Particle Effects */}
                  <div className="relative">
                    <div className="fire-container w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/30 via-red-500/20 to-transparent flex items-center justify-center backdrop-blur-sm border border-orange-500/20">
                      <i className="ri-fire-fill text-3xl text-orange-400 fire-icon-main" />
                    </div>
                    {/* Fire particles */}
                    <div className="fire-particle particle-1" />
                    <div className="fire-particle particle-2" />
                    <div className="fire-particle particle-3" />
                  </div>
                </div>
                {/* Streak Milestone Progress */}
                <div className="mt-4 z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                      Next Milestone
                    </span>
                    {" "}
                    <span className="text-[10px] text-orange-400 font-bold" id="nextMilestoneText">
                      ...
                    </span>
                  </div>
                  <div className="relative h-2 bg-gatex-bg rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20" />
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 rounded-full streak-progress-bar"
                      id="streakProgressBar"
                      style={{ width: "0%" }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent streak-shimmer" />
                    </div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-gray-600" id="prevMilestoneLabel">
                      0 🔥
                    </span>
                    {" "}
                    <span className="text-[9px] text-orange-500 font-bold" id="currentStreakLabel">
                      0
                    </span>
                    {" "}
                    <span className="text-[9px] text-gray-600" id="nextMilestoneLabel">
                      10 🏆
                    </span>
                  </div>
                </div>
                {/* Weekly Calendar - Enhanced */}
                <div className="mt-5 z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                      This Week
                    </span>
                    {" "}
                    <span className="text-[9px] text-gray-500" id="weekProgressText">
                      ...
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-2" id="streakCalendarGrid">
                    {/* Calendar populated by JS */}
                  </div>
                </div>
              </div>
              {/* Track Mastery (moved here) */}
              <div className="col-span-1 md:col-span-6 lg:col-span-4 bento-card bg-gatex-card border border-white/5 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold">
                    Track Mastery
                  </h3>
                  {" "}
                  <button className="text-xs text-gatex-primary hover:text-white">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">
                        Python
                      </span>
                      {" "}
                      <span className="text-white font-bold">
                        85%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gatex-bg rounded-full overflow-hidden">
                      <div className="h-full bg-gatex-primary w-[85%] rounded-full shadow-[0_0_10px_#9E4B8A]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">
                        Algorithms
                      </span>
                      {" "}
                      <span className="text-white font-bold">
                        42%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gatex-bg rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[42%] rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">
                        Data Structures
                      </span>
                      {" "}
                      <span className="text-white font-bold">
                        60%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gatex-bg rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 w-[60%] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Skill Analysis (moved here) */}
              <div className="col-span-1 md:col-span-6 lg:col-span-4 bento-card bg-gatex-card border border-white/5 rounded-3xl p-6 flex flex-col items-center">
                <h3 className="text-white font-bold text-sm w-full mb-2">
                  Skill Analysis
                </h3>
                <div className="w-full h-48 relative">
                  <canvas id="radarChart" />
                </div>
                <div className="flex gap-4 mt-2 text-[10px] text-gray-500">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gatex-accent" />
                    {" Current"}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-600" />
                    {" Avg Topper"}
                  </div>
                </div>
              </div>
              <div className="col-span-1 md:col-span-6 lg:col-span-4 row-span-2 bento-card bg-gatex-card border border-white/5 rounded-3xl p-0 flex flex-col h-full overflow-hidden">
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                  <h3 className="font-bold text-white">
                    Leaderboard
                  </h3>
                  <div className="flex bg-gatex-bg p-1 rounded-lg">
                    <button
                      className="px-3 py-1 text-xs font-bold rounded transition"
                      {...{ "x-on:click": "leaderboardTab = 'friends'", ":class": "leaderboardTab === 'friends' ? 'bg-gatex-card text-white shadow' : 'text-gray-500'" }}
                    >
                      Friends
                    </button>
                    {" "}
                    <button
                      className="px-3 py-1 text-xs font-bold rounded transition"
                      {...{ "x-on:click": "leaderboardTab = 'global'", ":class": "leaderboardTab === 'global' ? 'bg-gatex-card text-white shadow' : 'text-gray-500'" }}
                    >
                      Global
                    </button>
                  </div>
                </div>
                <div x-show="leaderboardTab === 'global'" className="flex-1 overflow-y-auto p-2 space-y-1">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-yellow-500 font-black text-lg w-4">
                        1
                      </div>
                      <div className="relative">
                        <img
                          src="https://i.pravatar.cc/150?u=11"
                          className="w-10 h-10 rounded-full border-2 border-yellow-500"
                        />
                        {" "}
                        <div className="absolute -top-2 -right-1 bg-yellow-500 text-black text-[8px] font-bold px-1 rounded">
                          {" KING"}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          Sarah Jenkins
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Streak: 45 days
                        </p>
                      </div>
                    </div>
                    {" "}
                    <span className="text-xs font-bold text-yellow-500">
                      5200 XP
                    </span>
                  </div>
                  <template
                    x-for="i in 5"
                    dangerouslySetInnerHTML={{ __html: "\n                                <div class=\"flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition group cursor-pointer\">\n                                    <div class=\"flex items-center gap-3\">\n                                        <div class=\"text-gray-500 font-bold text-sm w-4\" x-text=\"i + 1\"></div>\n                                        <img :src=\"`https://i.pravatar.cc/150?u=${i + 20}`\" class=\"w-8 h-8 rounded-full grayscale group-hover:grayscale-0 transition\">\n                                        <p class=\"text-sm font-medium text-gray-300 group-hover:text-white\" x-text=\"['David Kim', 'Elena R.', 'Marcus T.', 'Priya S.', 'Tom H.'][i-1]\">\n                                        </p>\n                                    </div>\n                                    <span class=\"text-xs font-bold text-gray-500 group-hover:text-gatex-success transition\">+120\n                                        XP</span>\n                                </div>\n                            " }}
                  />
                </div>
                <div className="p-4 bg-gatex-primary/10 border-t border-gatex-primary/20 mt-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-gatex-primary font-bold">
                        #420
                      </span>
                      {" "}
                      <img
                        src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                        className="w-8 h-8 rounded-full ring-1 ring-gatex-primary"
                      />
                      {" "}
                      <span className="text-sm font-bold text-white">
                        You
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-white">
                        2,450 XP
                      </span>
                      {" "}
                      <span className="text-[10px] text-green-400">
                        ▲ 12 ranks
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Activity Analysis (moved here) */}
              <div className="col-span-1 md:col-span-12 lg:col-span-8 bento-card bg-gatex-card border border-white/5 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      Activity Analysis
                    </h3>
                    <p className="text-xs text-gray-500">
                      Correlation: Time Spent vs. Questions Solved
                    </p>
                  </div>
                  <div className="flex bg-gatex-bg p-1 rounded-lg border border-white/5">
                    <button className="px-3 py-1 text-xs font-medium rounded text-white bg-white/10 shadow-sm">
                      Week
                    </button>
                    {" "}
                    <button className="px-3 py-1 text-xs font-medium rounded text-gray-500 hover:text-white">
                      Month
                    </button>
                  </div>
                </div>
                <div className="h-64 w-full relative">
                  <canvas id="activityChart" />
                </div>
              </div>
              {/* Class Schedule Removed */}
              {/* Hours Activity Component */}
              <div className="col-span-1 md:col-span-6 lg:col-span-5 bento-card bg-gatex-card border border-white/5 rounded-3xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      Hours Activity
                    </h3>
                    <p className="text-green-400 text-xs mt-1">
                      <i className="ri-arrow-up-line" />
                      {" +3% Increase than last week "}
                    </p>
                  </div>
                  {" "}
                  <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition">
                    <i className="ri-equalizer-line text-gray-400" />
                  </button>
                </div>
                {/* Hours Chart */}
                <div className="relative h-40">
                  <canvas id="hoursChart" />
                </div>
              </div>
              {/* Course Stats Cards */}
              <div className="col-span-1 md:col-span-6 lg:col-span-3 flex flex-col gap-4">
                {/* Courses Completed */}
                <div className="bento-card bg-gradient-to-br from-emerald-500/10 to-gatex-card border border-emerald-500/20 rounded-3xl p-5 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-5xl font-black text-emerald-400">
                        11
                      </span>
                      {" "}
                      <p className="text-gray-400 text-xs mt-2">
                        Courses
                        <br />
                        Completed
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <i className="ri-check-double-line text-emerald-400 text-xl" />
                    </div>
                  </div>
                </div>
                {/* Courses In Progress */}
                <div className="bento-card bg-gradient-to-br from-amber-500/10 to-gatex-card border border-amber-500/20 rounded-3xl p-5 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-5xl font-black text-amber-400">
                        04
                      </span>
                      {" "}
                      <p className="text-gray-400 text-xs mt-2">
                        Courses in
                        <br />
                        Progress
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <i className="ri-loader-4-line text-amber-400 text-xl" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Task Schedule Calendar */}
              <div className="col-span-1 md:col-span-6 lg:col-span-4 bento-card bg-gatex-card border border-white/5 rounded-3xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-gray-400 text-xs">
                      Task Schedule
                    </p>
                    <h3 className="text-white font-bold text-lg" id="scheduleHeaderDate">
                      ...
                    </h3>
                  </div>
                  {" "}
                  <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition">
                    <i className="ri-arrow-right-up-line text-gray-400" />
                  </button>
                </div>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs" id="scheduleCalendarGrid">
                  {/* Day Headers */}
                  <span className="text-gray-500 py-1">
                    S
                  </span>
                  {" "}
                  <span className="text-gray-500 py-1">
                    M
                  </span>
                  {" "}
                  <span className="text-gray-500 py-1">
                    T
                  </span>
                  {" "}
                  <span className="text-gray-500 py-1">
                    W
                  </span>
                  {" "}
                  <span className="text-gray-500 py-1">
                    T
                  </span>
                  {" "}
                  <span className="text-gray-500 py-1">
                    F
                  </span>
                  {" "}
                  <span className="text-gray-500 py-1">
                    S
                  </span>
                  {/* Days populated by JS */}
                </div>
              </div>
            </div>
            <footer className="text-center py-6 text-gray-600 text-xs border-t border-white/5 bg-gatex-bg">
              <p>
                © 2025 GateX Learning Technologies
              </p>
            </footer>
          </div>
        </main>
      </div>
      <script src="/_legacy/tunex/dashboard/script-02.js" />
      {/* API Configuration */}
      {/* removed: <script src="../scripts/cloud.js"> (file does not exist in ui/) */}
      <script src="/_legacy/tunex/dashboard/script-03.js" />
    </LegacyPage>
  );
}
