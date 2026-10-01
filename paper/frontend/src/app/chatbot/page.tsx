// Converted from ui/chatbot.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/chatbot/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "StudyAI — Your Academic AI Assistant",
  description: "StudyAI - An advanced AI-powered academic assistant to help students learn, understand, and excel in their studies.",
};

export default function ChatbotPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth","data-theme":"light"}}
      body={{"class":"bg-futuristic h-screen flex overflow-hidden"}}
      head={
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <script src="/_legacy/chatbot/script-01.js" />
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"}
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href={"https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"}
      />
      <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js" />
      <script src="https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.min.js" />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css"
      />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js" defer />
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" defer />
      <link rel="stylesheet" href="/_legacy/chatbot/style-01.css" />
      {/* ── original <body> ── */}
      {/* Mobile Sidebar Overlay */}
      <div
        id="sidebarOverlay"
        className="fixed inset-0 bg-black/40 z-40 hidden lg:hidden"
        data-px-onclick="toggleSidebar()"
        data-px=""
      />
      {/* Sidebar */}
      <aside
        id="sidebar"
        className="glass-sidebar w-72 h-full flex flex-col z-50 fixed lg:relative -translate-x-full lg:translate-x-0 transition-transform duration-300"
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b" style={{ borderColor: "var(--outline)" }}>
          <div className="flex items-center gap-3">
            <div className="ai-avatar w-10 h-10 rounded-xl flex items-center justify-center">
              <span className="material-symbols-rounded text-white text-xl">
                psychology
              </span>
            </div>
            <div>
              <h1 className="font-bold text-lg" style={{ color: "var(--surface-contrast)" }}>
                StudyAI
              </h1>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Your Academic Assistant
              </p>
            </div>
          </div>
        </div>
        {/* New Chat Button */}
        <div className="p-3">
          <button
            id="newChatBtn"
            data-px-onclick="createNewConversation()"
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ripple"
            style={{ background: "var(--ai-gradient)", color: "white" }}
            data-px=""
          >
            <span className="material-symbols-rounded text-xl">
              add
            </span>
            {" New Chat "}
          </button>
        </div>
        {/* Search */}
        <div className="px-3 pb-2">
          <div className="relative">
            <span
              className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-lg"
              style={{ color: "var(--muted)" }}
            >
              search
            </span>
            {" "}
            <input
              type="text"
              id="searchInput"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-transparent border focus:outline-none focus:border-[var(--brand)]"
              style={{ borderColor: "var(--outline)", color: "var(--surface-contrast)" }}
            />
          </div>
        </div>
        {/* Conversations List */}
        <div id="conversationsList" className="flex-1 overflow-y-auto custom-scroll px-2 py-2 space-y-1">
          {/* Conversations will be loaded here */}
          <div id="convLoading" className="flex items-center justify-center py-8">
            <div className="flex gap-1">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        </div>
        {/* Sidebar Footer */}
        <div className="p-3 border-t space-y-2" style={{ borderColor: "var(--outline)" }}>
          <button
            data-px-onclick="toggleTheme()"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-[var(--brand-soft)] transition ripple"
            style={{ color: "var(--surface-contrast)" }}
            data-px=""
          >
            <span className="material-symbols-rounded text-xl" id="themeIcon">
              dark_mode
            </span>
            {" "}
            <span id="themeLabel">
              Dark Mode
            </span>
          </button>
          {" "}
          <a
            href="home.html"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-[var(--brand-soft)] transition ripple"
            style={{ color: "var(--surface-contrast)" }}
          >
            {" "}
            <span className="material-symbols-rounded text-xl">
              home
            </span>
            {" Back to Home "}
          </a>
        </div>
      </aside>
      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header
          className="glass px-4 py-3 flex items-center gap-3 border-b z-30"
          style={{ borderColor: "var(--outline)" }}
        >
          {/* Mobile menu toggle */}
          <button
            data-px-onclick="toggleSidebar()"
            className="lg:hidden p-2 rounded-xl hover:bg-[var(--brand-soft)] transition ripple"
            data-px=""
          >
            <span className="material-symbols-rounded text-xl" style={{ color: "var(--surface-contrast)" }}>
              menu
            </span>
          </button>
          {" "}
          {/* Conversation title */}
          <div className="flex-1 min-w-0">
            <h2 id="chatTitle" className="font-semibold truncate" style={{ color: "var(--surface-contrast)" }}>
              New Chat
            </h2>
            <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
              Powered by Gemini 2.5 Flash
            </p>
          </div>
          {/* Header actions */}
          <div className="flex items-center gap-2">
            <button
              id="shareBtn"
              data-px-onclick="shareConversation()"
              className="p-2.5 rounded-xl hover:bg-[var(--brand-soft)] transition ripple"
              title="Share"
              data-px=""
            >
              <span className="material-symbols-rounded text-xl" style={{ color: "var(--muted)" }}>
                share
              </span>
            </button>
            {" "}
            <button
              id="exportBtn"
              data-px-onclick="exportConversation()"
              className="p-2.5 rounded-xl hover:bg-[var(--brand-soft)] transition ripple"
              title="Export"
              data-px=""
            >
              <span className="material-symbols-rounded text-xl" style={{ color: "var(--muted)" }}>
                download
              </span>
            </button>
            {" "}
            <button
              id="deleteBtn"
              data-px-onclick="deleteCurrentConversation()"
              className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950 transition ripple"
              title="Delete"
              data-px=""
            >
              <span className="material-symbols-rounded text-xl text-red-500">
                delete
              </span>
            </button>
          </div>
        </header>
        {/* Messages Container */}
        <div id="messagesContainer" className="flex-1 overflow-y-auto custom-scroll px-4 py-6">
          {/* Welcome Screen (shown when no conversation) */}
          <div
            id="welcomeScreen"
            className="h-full flex flex-col items-center justify-center text-center px-4 welcome-fade"
          >
            <div className="ai-avatar w-20 h-20 rounded-2xl flex items-center justify-center mb-6">
              <span className="material-symbols-rounded text-white text-4xl">
                psychology
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--surface-contrast)" }}>
              Welcome to StudyAI
            </h2>
            <p className="text-base mb-8 max-w-md" style={{ color: "var(--muted)" }}>
              {" Your intelligent academic companion. Ask me anything about your studies, and I'll help you understand, learn, and succeed. "}
            </p>
            {/* Quick suggestions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
              <button
                data-px-onclick="quickPrompt('Explain the concept of photosynthesis with examples')"
                className="text-left p-4 rounded-xl glass hover:shadow-lg transition group"
                data-px=""
              >
                <div className="flex items-start gap-3">
                  <span className="material-symbols-rounded text-2xl text-indigo-500">
                    lightbulb
                  </span>
                  {" "}
                  <div>
                    <p className="font-medium text-sm" style={{ color: "var(--surface-contrast)" }}>
                      Explain a concept
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                      Break down complex topics into simple terms
                    </p>
                  </div>
                </div>
              </button>
              {" "}
              <button
                data-px-onclick="quickPrompt('Help me solve this calculus problem: find the derivative of x^3 + 2x^2 - 5x + 1')"
                className="text-left p-4 rounded-xl glass hover:shadow-lg transition group"
                data-px=""
              >
                <div className="flex items-start gap-3">
                  <span className="material-symbols-rounded text-2xl text-emerald-500">
                    calculate
                  </span>
                  {" "}
                  <div>
                    <p className="font-medium text-sm" style={{ color: "var(--surface-contrast)" }}>
                      Solve a problem
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                      Step-by-step solutions with explanations
                    </p>
                  </div>
                </div>
              </button>
              {" "}
              <button
                data-px-onclick="quickPrompt('Create a quiz about World War II with 5 multiple choice questions')"
                className="text-left p-4 rounded-xl glass hover:shadow-lg transition group"
                data-px=""
              >
                <div className="flex items-start gap-3">
                  <span className="material-symbols-rounded text-2xl text-amber-500">
                    quiz
                  </span>
                  {" "}
                  <div>
                    <p className="font-medium text-sm" style={{ color: "var(--surface-contrast)" }}>
                      Quiz me
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                      Test your knowledge with MCQs
                    </p>
                  </div>
                </div>
              </button>
              {" "}
              <button
                data-px-onclick={"quickPrompt('Summarize the key points of Newton\\'s Laws of Motion')"}
                className="text-left p-4 rounded-xl glass hover:shadow-lg transition group"
                data-px=""
              >
                <div className="flex items-start gap-3">
                  <span className="material-symbols-rounded text-2xl text-rose-500">
                    summarize
                  </span>
                  {" "}
                  <div>
                    <p className="font-medium text-sm" style={{ color: "var(--surface-contrast)" }}>
                      Summarize
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                      Get key points and main ideas
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
          {/* Messages will be rendered here */}
          <div id="messagesList" className="max-w-3xl mx-auto space-y-6 hidden">
            {/* Messages inserted dynamically */}
          </div>
          {/* Typing Indicator */}
          <div id="typingIndicator" className="max-w-3xl mx-auto hidden">
            <div className="flex gap-3 items-start">
              <div className="ai-avatar w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-rounded text-white text-lg">
                  psychology
                </span>
              </div>
              <div className="msg-ai px-4 py-3 flex items-center gap-2">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        </div>
        {/* Study Mode Pills */}
        <div
          id="studyModeBar"
          className="px-4 py-2 border-t overflow-x-auto hide-scrollbar flex gap-2"
          style={{ borderColor: "var(--outline)", background: "var(--surface)" }}
        >
          <button
            data-px-onclick="setStudyMode('explain')"
            className="study-pill px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1.5"
            style={{ color: "var(--surface-contrast)" }}
            data-px=""
          >
            <span className="material-symbols-rounded text-base text-indigo-500">
              lightbulb
            </span>
            {" Explain "}
          </button>
          {" "}
          <button
            data-px-onclick="setStudyMode('summarize')"
            className="study-pill px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1.5"
            style={{ color: "var(--surface-contrast)" }}
            data-px=""
          >
            <span className="material-symbols-rounded text-base text-rose-500">
              summarize
            </span>
            {" Summarize "}
          </button>
          {" "}
          <button
            data-px-onclick="setStudyMode('quiz')"
            className="study-pill px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1.5"
            style={{ color: "var(--surface-contrast)" }}
            data-px=""
          >
            <span className="material-symbols-rounded text-base text-amber-500">
              quiz
            </span>
            {" Quiz Me "}
          </button>
          {" "}
          <button
            data-px-onclick="setStudyMode('solve')"
            className="study-pill px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1.5"
            style={{ color: "var(--surface-contrast)" }}
            data-px=""
          >
            <span className="material-symbols-rounded text-base text-emerald-500">
              calculate
            </span>
            {" Solve "}
          </button>
          {" "}
          <button
            data-px-onclick="setStudyMode('compare')"
            className="study-pill px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1.5"
            style={{ color: "var(--surface-contrast)" }}
            data-px=""
          >
            <span className="material-symbols-rounded text-base text-cyan-500">
              compare_arrows
            </span>
            {" Compare "}
          </button>
          {" "}
          <button
            data-px-onclick="setStudyMode('outline')"
            className="study-pill px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1.5"
            style={{ color: "var(--surface-contrast)" }}
            data-px=""
          >
            <span className="material-symbols-rounded text-base text-purple-500">
              format_list_bulleted
            </span>
            {" Outline "}
          </button>
          {" "}
          <button
            data-px-onclick="setStudyMode('flashcards')"
            className="study-pill px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1.5"
            style={{ color: "var(--surface-contrast)" }}
            data-px=""
          >
            <span className="material-symbols-rounded text-base text-orange-500">
              style
            </span>
            {" Flashcards "}
          </button>
          {" "}
          <button
            data-px-onclick="setStudyMode('cite')"
            className="study-pill px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1.5"
            style={{ color: "var(--surface-contrast)" }}
            data-px=""
          >
            <span className="material-symbols-rounded text-base text-blue-500">
              format_quote
            </span>
            {" Cite "}
          </button>
        </div>
        {/* Input Area */}
        <div className="p-4 border-t" style={{ borderColor: "var(--outline)", background: "var(--surface)" }}>
          <div className="max-w-3xl mx-auto">
            {/* Active study mode indicator */}
            <div id="studyModeIndicator" className="hidden mb-2 flex items-center gap-2">
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
              >
                {" "}
                <span id="studyModeLabel">
                  Explain Mode
                </span>
                {" "}
              </span>
              {" "}
              <button
                data-px-onclick="clearStudyMode()"
                className="text-xs hover:underline"
                style={{ color: "var(--muted)" }}
                data-px=""
              >
                Clear
              </button>
            </div>
            <div className="flex items-end gap-3">
              {/* Attachment button */}
              <button
                id="attachBtn"
                className="p-3 rounded-xl hover:bg-[var(--brand-soft)] transition ripple flex-shrink-0"
                title="Attach file"
              >
                <span className="material-symbols-rounded text-xl" style={{ color: "var(--muted)" }}>
                  attach_file
                </span>
              </button>
              {" "}
              {/* Input field */}
              <div className="flex-1 glass rounded-2xl input-glow transition-shadow">
                <textarea
                  id="messageInput"
                  placeholder="Ask me anything about your studies..."
                  rows={1}
                  className="w-full px-4 py-3 bg-transparent resize-none focus:outline-none text-sm"
                  style={{ color: "var(--surface-contrast)", maxHeight: "150px" }}
                  data-px-oninput="autoResize(this)"
                  data-px-onkeydown="handleKeyDown(event)"
                  data-px=""
                />
              </div>
              {" "}
              {/* Voice input button */}
              <button
                id="voiceBtn"
                data-px-onclick="toggleVoiceInput()"
                className="p-3 rounded-xl hover:bg-[var(--brand-soft)] transition ripple flex-shrink-0"
                title="Voice input"
                data-px=""
              >
                <span className="material-symbols-rounded text-xl" style={{ color: "var(--muted)" }}>
                  mic
                </span>
              </button>
              {" "}
              {/* Send button */}
              <button
                id="sendBtn"
                data-px-onclick="sendMessage()"
                className="p-3 rounded-xl fab flex-shrink-0"
                style={{ background: "var(--ai-gradient)" }}
                data-px=""
              >
                <span className="material-symbols-rounded text-xl text-white">
                  send
                </span>
              </button>
            </div>
            <p className="text-xs text-center mt-3" style={{ color: "var(--muted)" }}>
              {" StudyAI can make mistakes. Consider checking important information. "}
            </p>
          </div>
        </div>
      </main>
      {/* Share Modal */}
      <div id="shareModal" className="fixed inset-0 z-50 flex items-center justify-center p-4 hidden">
        <div className="absolute inset-0 bg-black/50" data-px-onclick="closeShareModal()" data-px="" />
        <div
          className="glass rounded-2xl p-6 max-w-md w-full relative z-10"
          style={{ background: "var(--surface)" }}
        >
          <h3 className="text-lg font-bold mb-4" style={{ color: "var(--surface-contrast)" }}>
            Share Conversation
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--surface-contrast)" }}>
                Share Link
              </label>
              {" "}
              <div className="flex gap-2">
                <input
                  type="text"
                  id="shareLinkInput"
                  readOnly
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm border bg-transparent"
                  style={{ borderColor: "var(--outline)", color: "var(--surface-contrast)" }}
                />
                {" "}
                <button
                  data-px-onclick="copyShareLink()"
                  className="px-4 py-2.5 rounded-xl font-medium"
                  style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
                  data-px=""
                >
                  {" Copy "}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="anonymousShare" className="w-4 h-4 rounded accent-[var(--brand)]" />
              {" "}
              <label htmlFor="anonymousShare" className="text-sm" style={{ color: "var(--surface-contrast)" }}>
                Share anonymously (hide your name)
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              data-px-onclick="closeShareModal()"
              className="px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{ color: "var(--muted)" }}
              data-px=""
            >
              {" Cancel "}
            </button>
            {" "}
            <button
              data-px-onclick="confirmShare()"
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white"
              style={{ background: "var(--ai-gradient)" }}
              data-px=""
            >
              {" Generate Link "}
            </button>
          </div>
        </div>
      </div>
      {/* Toast notification */}
      <div
        id="toast"
        className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all duration-300 opacity-0 translate-y-4 pointer-events-none z-50"
        style={{ background: "var(--surface-contrast)", color: "var(--surface)" }}
      >
        <span id="toastMessage">
          Copied to clipboard!
        </span>
      </div>
      <script src="/_legacy/chatbot/script-02.js" />
    </LegacyPage>
  );
}
