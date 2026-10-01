// Converted from ui/groupChat/whiteboard.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/groupChat/whiteboard/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Whiteboard — PaperX Meet",
  description: "Collaborative whiteboard for real-time drawing and brainstorming",
};

export default function GroupChatWhiteboardPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"bg-gradient-to-br from-slate-50 to-purple-50 dark:from-[#0a0d12] dark:to-[#1a0f1c] text-[#0d1117] dark:text-zinc-100"}}
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="/config.js" />
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"}
        rel="stylesheet"
      />
      <link
        href={"https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@300;400;600&display=swap"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/_legacy/groupChat/whiteboard/style-01.css" />
      {/* ── original <body> ── */}
      {/* Header */}
      <header className="header glass-card border-0 border-b rounded-none">
        <div className="flex items-center gap-4">
          <a
            href="group_chat.html"
            id="backBtn"
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            {" "}
            <span className="icon">
              arrow_back
            </span>
            {" "}
            <span className="hidden sm:inline">
              Back to Meeting
            </span>
            {" "}
          </a>
          {" "}
          <div className="w-px h-6 bg-black/10 dark:bg-white/10" />
          <div className="flex items-center gap-2">
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "var(--brand-gradient)" }}
            >
              {" "}
              <span className="icon text-white text-lg">
                draw
              </span>
              {" "}
            </span>
            {" "}
            <div>
              <h1 className="font-semibold text-sm">
                Collaborative Whiteboard
              </h1>
              <p id="roomName" className="text-xs opacity-60">
                Loading...
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5">
            <div id="statusDot" className="status-dot disconnected" />
            {" "}
            <span id="statusText" className="text-xs font-medium">
              Connecting...
            </span>
          </div>
          {/* Participants on whiteboard */}
          <div id="participants" className="hidden sm:flex items-center -space-x-2">
            {/* Avatars will be added here */}
          </div>
          {" "}
          <button
            data-px-onclick="Theme.toggle()"
            className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition"
            data-px=""
          >
            <span className="icon">
              dark_mode
            </span>
          </button>
        </div>
      </header>
      {/* Canvas Container */}
      <div id="canvasContainer">
        <canvas id="whiteboard" />
      </div>
      {/* Remote Cursors Container */}
      <div id="remoteCursors" />
      {/* Floating Toolbar */}
      <div className="toolbar glass-card">
        {/* Drawing Tools */}
        <button id="penTool" className="toolbar-btn active" title="Pen (P)">
          <span className="icon">
            edit
          </span>
        </button>
        {" "}
        <button id="eraserTool" className="toolbar-btn" title="Eraser (E)">
          <span className="icon">
            ink_eraser
          </span>
        </button>
        {" "}
        <div className="toolbar-divider" />
        {/* Colors */}
        <div className="flex items-center gap-2">
          <button
            className="color-btn active"
            data-color="#000000"
            style={{ background: "#000000" }}
            title="Black"
          />
          {" "}
          <button className="color-btn" data-color="#ef4444" style={{ background: "#ef4444" }} title="Red" />
          {" "}
          <button className="color-btn" data-color="#3b82f6" style={{ background: "#3b82f6" }} title="Blue" />
          {" "}
          <button className="color-btn" data-color="#22c55e" style={{ background: "#22c55e" }} title="Green" />
          {" "}
          <button className="color-btn" data-color="#f59e0b" style={{ background: "#f59e0b" }} title="Orange" />
          {" "}
          <button className="color-btn" data-color="#9E4B8A" style={{ background: "#9E4B8A" }} title="Purple" />
        </div>
        <div className="toolbar-divider" />
        {/* Brush Size */}
        <div className="flex items-center gap-2">
          <span className="icon text-sm opacity-50">
            line_weight
          </span>
          {" "}
          <input
            type="range"
            id="brushSize"
            min="2"
            max="30"
            defaultValue="4"
            className="size-slider"
            title="Brush size"
          />
          {" "}
          <span id="sizeLabel" className="text-xs font-medium w-6">
            4
          </span>
        </div>
        <div className="toolbar-divider" />
        {" "}
        {/* History */}
        <button id="undoBtn" className="toolbar-btn history-btn" title="Undo (Ctrl+Z)" disabled>
          <span className="icon">
            undo
          </span>
        </button>
        {" "}
        <button id="redoBtn" className="toolbar-btn history-btn" title="Redo (Ctrl+Y)" disabled>
          <span className="icon">
            redo
          </span>
        </button>
        {" "}
        <div className="toolbar-divider" />
        {" "}
        {/* Actions */}
        <button id="clearBtn" className="toolbar-btn" title="Clear canvas">
          <span className="icon">
            delete_sweep
          </span>
        </button>
        {" "}
        <button id="downloadBtn" className="toolbar-btn" title="Download as image">
          <span className="icon">
            download
          </span>
        </button>
      </div>
      {/* Toast */}
      <div id="toast" className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 hidden">
        <div className="glass-card px-6 py-3 rounded-xl flex items-center gap-3 shadow-xl">
          <span id="toastIcon" className="icon" style={{ color: "var(--brand-500)" }}>
            check_circle
          </span>
          {" "}
          <span id="toastText" />
        </div>
      </div>
      <script src="/_legacy/groupChat/whiteboard/script-01.js" />
    </LegacyPage>
  );
}
