// Converted from ui/whatsapp_msg.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/whatsapp_msg/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "PaperX — WhatsApp Messenger",
};

export default function WhatsappMsgPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen antialiased text-neutral-900 dark:text-white"}}
      head={
        <>
          <link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"}
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0,0"
        rel="stylesheet"
      />
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="/config.js" />
      <link rel="stylesheet" href="/_legacy/whatsapp_msg/style-01.css" />
      {/* ── original <body> ── */}
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-black/25 backdrop-blur">
        <div className="max-w-full mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src="assets/img/logo-light.svg" alt="PaperX" className="h-7 w-auto dark:hidden" />
            {" "}
            <img src="assets/img/logo-dark.svg" alt="PaperX" className="h-7 w-auto hidden dark:block" />
            {" "}
            <div className="min-w-0">
              <h1 className="text-base font-extrabold tracking-tight flex items-center gap-2">
                {" WhatsApp Messenger "}
                <span id="waStatus" className="status-dot offline" title="Checking..." />
              </h1>
              <p className="text-[11px] muted" id="statsLine">
                Loading users...
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="mobileMenuBtn"
              className="md:hidden h-9 w-9 rounded-full ring-1 ring-black/10 dark:ring-white/15 bg-white/75 dark:bg-white/10 grid place-items-center"
            >
              <span className="material-symbols-rounded text-[18px]">
                menu
              </span>
            </button>
            {" "}
            <button
              type="button"
              id="themeToggle"
              className="h-9 w-9 rounded-full ring-1 ring-black/10 dark:ring-white/15 bg-white/75 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 transition grid place-items-center"
              title="Toggle theme"
            >
              <span className="material-symbols-rounded text-[18px]">
                dark_mode
              </span>
            </button>
            {" "}
            <button
              type="button"
              id="refreshBtn"
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold bg-[#9E4B8A] text-white hover:opacity-90 transition"
            >
              <span className="material-symbols-rounded text-[16px]">
                refresh
              </span>
              {"Reload "}
            </button>
          </div>
        </div>
      </header>
      {/* MAIN GRID */}
      <div className="app-grid">
        {/* LEFT SIDEBAR */}
        <div className="sidebar glass" id="sidebar">
          <div className="p-2">
            <input
              id="searchInput"
              type="text"
              placeholder="Search users..."
              className="w-full rounded-xl px-3 py-2 text-xs border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#9E4B8A]/60"
            />
          </div>
          <div className="tab-bar">
            <button type="button" className="tab-btn active" data-tab="students">
              <span className="material-symbols-rounded text-[14px]">
                school
              </span>
              {" Students"}
            </button>
            {" "}
            <button type="button" className="tab-btn" data-tab="teachers">
              <span className="material-symbols-rounded text-[14px]">
                person
              </span>
              {" Teachers"}
            </button>
            {" "}
            <button type="button" className="tab-btn" data-tab="admins">
              <span className="material-symbols-rounded text-[14px]">
                admin_panel_settings
              </span>
              {" Admins"}
            </button>
            {" "}
            <button type="button" className="tab-btn" data-tab="employees">
              <span className="material-symbols-rounded text-[14px]">
                badge
              </span>
              {" Employees"}
            </button>
          </div>
          <div className="px-1 py-1 flex items-center justify-between">
            <label className="flex items-center gap-1 text-[10px] font-semibold muted cursor-pointer px-2">
              <input type="checkbox" id="selectAllCheck" className="ucheck" />
              {" Select All"}
            </label>
            {" "}
            <span id="selectedCount" className="text-[10px] font-bold muted px-2">
              0 selected
            </span>
          </div>
          <div id="tabStudents" className="tab-panel" />
          <div id="tabTeachers" className="tab-panel" style={{ display: "none" }} />
          <div id="tabAdmins" className="tab-panel" style={{ display: "none" }} />
          <div id="tabEmployees" className="tab-panel" style={{ display: "none" }} />
        </div>
        {/* MAIN CHAT AREA */}
        <div className="chat-area bg-white/40 dark:bg-black/20">
          {/* Empty state */}
          <div id="emptyState" className="empty-state">
            <span className="material-symbols-rounded">
              chat
            </span>
            {" "}
            <p className="text-sm font-semibold">
              Select a user to start chatting
            </p>
            <p className="text-xs">
              Or select multiple users for bulk messaging
            </p>
          </div>
          {/* Chat view (hidden initially) */}
          <div id="chatView" style={{ display: "none" }} className="flex flex-col h-full">
            <div className="chat-header">
              <div id="chatAvatar" className="user-avatar" style={{ background: "#9E4B8A" }}>
                ?
              </div>
              <div className="min-w-0 flex-1">
                <div id="chatName" className="text-sm font-bold truncate">
                  User
                </div>
                <div id="chatSub" className="text-[11px] muted truncate">
                  Phone
                </div>
              </div>
              {" "}
              <button
                type="button"
                id="chatCloseBtn"
                className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 grid place-items-center transition"
              >
                <span className="material-symbols-rounded text-[18px]">
                  close
                </span>
              </button>
            </div>
            <div id="chatMessages" className="chat-messages" />
            <div className="chat-input-bar">
              <textarea id="chatInput" className="chat-input" rows={1} placeholder="Type a message..." />
              {" "}
              <button type="button" id="sendBtn" className="send-btn" title="Send">
                <span className="material-symbols-rounded text-[18px]">
                  send
                </span>
              </button>
            </div>
          </div>
          {/* Bulk view (hidden initially) */}
          <div id="bulkView" style={{ display: "none" }} className="flex flex-col h-full">
            <div className="chat-header">
              <span className="material-symbols-rounded text-[22px]" style={{ color: "#9E4B8A" }}>
                campaign
              </span>
              {" "}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold">
                  Bulk Message
                </div>
                <div id="bulkRecipientInfo" className="text-[11px] muted">
                  0 recipients
                </div>
              </div>
              {" "}
              <button
                type="button"
                id="bulkCloseBtn"
                className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 grid place-items-center transition"
              >
                <span className="material-symbols-rounded text-[18px]">
                  close
                </span>
              </button>
            </div>
            <div id="bulkLog" className="chat-messages" />
            <div className="chat-input-bar">
              <textarea id="bulkInput" className="chat-input" rows={2} placeholder="Type bulk message..." />
              {" "}
              <button type="button" id="bulkSendBtn" className="send-btn" title="Send to all">
                <span className="material-symbols-rounded text-[18px]">
                  send
                </span>
              </button>
            </div>
            <div className="bulk-bar" id="bulkBar" style={{ display: "none" }}>
              <span id="bulkStatus" className="text-xs font-semibold">
                Sending...
              </span>
              {" "}
              <div className="bulk-progress">
                <div id="bulkProgressFill" className="bulk-progress-fill" style={{ width: "0%" }} />
              </div>
            </div>
          </div>
        </div>
        {/* RIGHT PANEL */}
        <div className="right-panel glass" id="rightPanel">
          <div id="detailEmpty" className="empty-state" style={{ height: "auto", padding: "60px 20px" }}>
            <span className="material-symbols-rounded">
              person_search
            </span>
            {" "}
            <p className="text-xs font-semibold">
              Click a user to see details
            </p>
          </div>
          <div id="detailView" style={{ display: "none" }}>
            <div id="detailAvatar" className="detail-avatar" style={{ background: "#9E4B8A" }}>
              ?
            </div>
            <h3 id="detailName" className="text-center text-base font-bold mb-1">
              Name
            </h3>
            <p id="detailRole" className="text-center mb-4">
              <span className="badge">
                student
              </span>
            </p>
            <div id="detailFields" />
            <div className="mt-4 flex gap-2 justify-center flex-wrap">
              <a
                id="detailCallLink"
                href="#"
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20"
              >
                {" "}
                <span className="material-symbols-rounded text-[14px]">
                  call
                </span>
                {"Call "}
              </a>
              {" "}
              <a
                id="detailEmailLink"
                href="#"
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20"
              >
                {" "}
                <span className="material-symbols-rounded text-[14px]">
                  mail
                </span>
                {"Email "}
              </a>
              {" "}
              <button
                type="button"
                id="detailChatBtn"
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold bg-[#9E4B8A]/10 text-[#9E4B8A] border border-[#9E4B8A]/20"
              >
                <span className="material-symbols-rounded text-[14px]">
                  chat
                </span>
                {"Chat "}
              </button>
            </div>
          </div>
        </div>
      </div>
      {" "}
      {/* Bulk send floating button */}
      <button
        type="button"
        id="bulkFab"
        style={{ display: "none" }}
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold bg-[#9E4B8A] text-white shadow-lg hover:shadow-xl transition"
      >
        <span className="material-symbols-rounded text-[18px]">
          campaign
        </span>
        {" Bulk Send ("}
        <span id="bulkFabCount">
          0
        </span>
        {") "}
      </button>
      {" "}
      {/* Toast */}
      <div id="toast" className="toast" />
      <script src="/_legacy/whatsapp_msg/script-01.js" />
    </LegacyPage>
  );
}
