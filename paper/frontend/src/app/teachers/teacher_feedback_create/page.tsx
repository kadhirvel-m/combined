// Converted from ui/teachers/teacher_feedback_create.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/teachers/teacher_feedback_create/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Create Feedback Form — Paper X",
};

export default function TeachersTeacherFeedbackCreatePage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark"}}
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="/config.js" />
      <link rel="stylesheet" href="/_legacy/teachers/teacher_feedback_create/style-01.css" />
      <script src="/_legacy/teachers/teacher_feedback_create/script-01.js" />
      {/* ── original <body> ── */}
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-brand-900/70 backdrop-blur-xl border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <a
              href="teacher_feedback_list.html"
              className="inline-flex items-center gap-2 text-neutral-600 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white transition"
            >
              {" "}
              <span className="material-symbols-rounded">
                arrow_back
              </span>
              {" "}
            </a>
            {" "}
            <div className="h-6 w-px bg-black/10 dark:bg-white/10" />
            {" "}
            <a href="../teacher_profile.html" className="flex items-center gap-2 shrink-0">
              {" "}
              <img src="../assets/img/logo-light.svg" className="h-8 w-auto dark:hidden" alt="Paper X" />
              {" "}
              <img src="../assets/img/logo-dark.svg" className="h-8 w-auto hidden dark:block" alt="Paper X" />
              {" "}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <button
              data-theme-toggle=""
              className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition"
              aria-label="Toggle theme"
            >
              <span className="material-symbols-rounded text-xl">
                dark_mode
              </span>
            </button>
            {" "}
            <button
              id="saveBtn"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <span className="material-symbols-rounded text-base">
                save
              </span>
              {" Save Draft "}
            </button>
            {" "}
            <button
              id="publishBtn"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 text-white text-sm font-semibold shadow-glow hover:shadow-[0_12px_36px_rgba(158,75,138,0.45)] transition"
            >
              <span className="material-symbols-rounded text-base">
                publish
              </span>
              {" Publish "}
            </button>
          </div>
        </div>
      </header>
      <main className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-700/20">
              {" "}
              <span className="material-symbols-rounded text-brand-600 dark:text-brand-400">
                rate_review
              </span>
              {" "}
            </span>
            {" "}
            <h1 className="text-2xl md:text-3xl font-bold">
              Create Feedback Form
            </h1>
          </div>
          <p className="text-neutral-600 dark:text-white/60 text-sm max-w-xl">
            Build surveys with various question types. Use AI to generate questions automatically or add them manually.
          </p>
        </div>
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          {/* Left: Form Builder */}
          <div className="space-y-5">
            {/* Form Details Card */}
            <div className="glass-panel rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-black/5 dark:border-white/10 flex items-center gap-3">
                <span className="material-symbols-rounded text-brand-500">
                  description
                </span>
                {" "}
                <h2 className="font-semibold">
                  Form Details
                </h2>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-white/60 mb-2 uppercase tracking-wide">
                    {"Form Title "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>
                  {" "}
                  <input
                    id="formTitle"
                    type="text"
                    placeholder="e.g., Course Feedback - Data Structures"
                    className="input-field w-full px-4 py-3.5 rounded-xl bg-white/60 dark:bg-white/5 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-white/60 mb-2 uppercase tracking-wide">
                    Description
                  </label>
                  {" "}
                  <textarea
                    id="formDesc"
                    rows={3}
                    placeholder="Brief description of what this feedback is for..."
                    className="input-field w-full px-4 py-3.5 rounded-xl bg-white/60 dark:bg-white/5 outline-none resize-none text-sm"
                  />
                </div>
                {" "}
                <label className="flex items-center gap-3 cursor-pointer group">
                  {" "}
                  <input
                    type="checkbox"
                    id="anonDisplay"
                    defaultChecked
                    className="w-5 h-5 accent-brand-500 rounded"
                  />
                  {" "}
                  <div>
                    <span className="text-sm font-medium group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                      {"Show \"Anonymous\" badge to students"}
                    </span>
                    {" "}
                    <p className="text-xs text-neutral-500 dark:text-white/40">
                      Students see anonymous UI, but names are stored
                    </p>
                  </div>
                  {" "}
                </label>
              </div>
            </div>
            {/* Questions Section */}
            <div className="glass-panel rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-rounded text-brand-500">
                    quiz
                  </span>
                  {" "}
                  <h2 className="font-semibold">
                    Questions
                  </h2>
                  {" "}
                  <span
                    id="questionCount"
                    className="text-xs px-2 py-1 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300 font-medium"
                  >
                    0
                  </span>
                </div>
                {" "}
                {/* AI Generate Button */}
                <button
                  id="aiGenerateBtn"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-lg hover:shadow-xl transition"
                  style={{ background: "linear-gradient(135deg, #9E4B8A, #4C2A59)", color: "#ffffff" }}
                >
                  <span
                    className="material-symbols-rounded text-sm ai-sparkle filled"
                    style={{ color: "#ffffff" }}
                  >
                    auto_awesome
                  </span>
                  {" Generate with AI "}
                </button>
              </div>
              <div className="p-6">
                {/* Questions Container */}
                <div id="questionsContainer" className="space-y-4">
                  {/* Questions will be added here */}
                </div>
                {/* Empty State */}
                <div id="emptyQuestions" className="text-center py-14">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-500/10 flex items-center justify-center">
                    <span className="material-symbols-rounded text-3xl text-brand-500">
                      quiz
                    </span>
                  </div>
                  <h3 className="font-semibold mb-1">
                    No questions yet
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-white/50 mb-5">
                    Add questions from the panel or use AI to generate them
                  </p>
                  {" "}
                  <button
                    data-px-onclick="document.getElementById('aiGenerateBtn').click()"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow hover:shadow-lg transition"
                    style={{ background: "linear-gradient(135deg, #9E4B8A, #4C2A59)", color: "#ffffff" }}
                    data-px=""
                  >
                    <span
                      className="material-symbols-rounded text-base filled ai-sparkle"
                      style={{ color: "#ffffff" }}
                    >
                      auto_awesome
                    </span>
                    {" Generate with AI "}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Right: Question Types Sidebar */}
          <div className="lg:sticky lg:top-24 space-y-5 h-fit">
            {/* Add Question Panel */}
            <div className="glass-panel rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-black/5 dark:border-white/10">
                <h3 className="font-semibold text-sm">
                  Add Question
                </h3>
                <p className="text-xs text-neutral-500 dark:text-white/50 mt-0.5">
                  Click to add to your form
                </p>
              </div>
              <div className="p-4 grid grid-cols-2 gap-2">
                <button data-px-onclick="addQuestion('text')" className="type-btn" data-px="">
                  <span className="material-symbols-rounded text-2xl text-brand-500">
                    short_text
                  </span>
                  {" "}
                  <span className="text-xs font-medium">
                    Short Text
                  </span>
                </button>
                {" "}
                <button data-px-onclick="addQuestion('textarea')" className="type-btn" data-px="">
                  <span className="material-symbols-rounded text-2xl text-brand-500">
                    notes
                  </span>
                  {" "}
                  <span className="text-xs font-medium">
                    Long Text
                  </span>
                </button>
                {" "}
                <button data-px-onclick="addQuestion('rating')" className="type-btn" data-px="">
                  <span className="material-symbols-rounded text-2xl text-brand-500 filled">
                    star
                  </span>
                  {" "}
                  <span className="text-xs font-medium">
                    Star Rating
                  </span>
                </button>
                {" "}
                <button data-px-onclick="addQuestion('scale')" className="type-btn" data-px="">
                  <span className="material-symbols-rounded text-2xl text-brand-500">
                    linear_scale
                  </span>
                  {" "}
                  <span className="text-xs font-medium">
                    Scale 1-10
                  </span>
                </button>
                {" "}
                <button data-px-onclick="addQuestion('mcq_single')" className="type-btn" data-px="">
                  <span className="material-symbols-rounded text-2xl text-brand-500">
                    radio_button_checked
                  </span>
                  {" "}
                  <span className="text-xs font-medium">
                    Single Choice
                  </span>
                </button>
                {" "}
                <button data-px-onclick="addQuestion('mcq_multiple')" className="type-btn" data-px="">
                  <span className="material-symbols-rounded text-2xl text-brand-500">
                    check_box
                  </span>
                  {" "}
                  <span className="text-xs font-medium">
                    Multi Choice
                  </span>
                </button>
                {" "}
                <button data-px-onclick="addQuestion('yes_no')" className="type-btn" data-px="">
                  <span className="material-symbols-rounded text-2xl text-brand-500">
                    thumb_up
                  </span>
                  {" "}
                  <span className="text-xs font-medium">
                    Yes / No
                  </span>
                </button>
                {" "}
                <button data-px-onclick="addQuestion('dropdown')" className="type-btn" data-px="">
                  <span className="material-symbols-rounded text-2xl text-brand-500">
                    arrow_drop_down_circle
                  </span>
                  {" "}
                  <span className="text-xs font-medium">
                    Dropdown
                  </span>
                </button>
              </div>
            </div>
            {/* Quick Actions */}
            <div className="glass-panel rounded-2xl p-4 space-y-2">
              <button
                data-px-onclick="clearAllQuestions()"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 transition"
                data-px=""
              >
                <span className="material-symbols-rounded text-lg">
                  delete_sweep
                </span>
                {" Clear All Questions "}
              </button>
              {" "}
              <a
                href="teacher_feedback_list.html"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm hover:bg-black/5 dark:hover:bg-white/5 transition"
              >
                {" "}
                <span className="material-symbols-rounded text-lg">
                  arrow_back
                </span>
                {" Back to Forms "}
              </a>
            </div>
          </div>
        </div>
      </main>
      {/* AI Generate Modal */}
      <div id="aiModal" className="fixed inset-0 z-[100] hidden">
        <div className="modal-backdrop absolute inset-0" data-px-onclick="closeAiModal()" data-px="" />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="modal-content glass-panel rounded-3xl w-full max-w-lg overflow-hidden relative">
            {/* Header */}
            <div className="px-6 py-5 border-b border-black/5 dark:border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <span className="material-symbols-rounded text-2xl text-white filled ai-sparkle">
                  auto_awesome
                </span>
              </div>
              <div>
                <h2 className="font-bold text-lg">
                  Generate Questions with AI
                </h2>
                <p className="text-xs text-neutral-500 dark:text-white/50">
                  Powered by Gemini 2.5 Flash
                </p>
              </div>
              {" "}
              <button
                data-px-onclick="closeAiModal()"
                className="ml-auto p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5"
                data-px=""
              >
                <span className="material-symbols-rounded">
                  close
                </span>
              </button>
            </div>
            {/* Body */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-white/60 mb-2 uppercase tracking-wide">
                  {"What is this feedback about? "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>
                {" "}
                <input
                  id="aiTopic"
                  type="text"
                  placeholder="e.g., Data Structures course, Teaching quality, Lab sessions"
                  className="input-field w-full px-4 py-3.5 rounded-xl bg-white/60 dark:bg-white/5 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-white/60 mb-2 uppercase tracking-wide">
                  Additional Requirements
                </label>
                {" "}
                <textarea
                  id="aiRequirements"
                  rows={3}
                  placeholder="e.g., Focus on teaching methods, include questions about assignments, ask about course materials..."
                  className="input-field w-full px-4 py-3.5 rounded-xl bg-white/60 dark:bg-white/5 outline-none resize-none text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-white/60 mb-2 uppercase tracking-wide">
                    Number of Questions
                  </label>
                  {" "}
                  <select
                    id="aiCount"
                    className="input-field w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-white/5 outline-none"
                    defaultValue={"8"}
                  >
                    <option value="5">
                      5 questions
                    </option>
                    <option value="8">
                      8 questions
                    </option>
                    <option value="10">
                      10 questions
                    </option>
                    <option value="15">
                      15 questions
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-white/60 mb-2 uppercase tracking-wide">
                    Question Mix
                  </label>
                  {" "}
                  <select
                    id="aiMix"
                    className="input-field w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-white/5 outline-none"
                    defaultValue={"balanced"}
                  >
                    <option value="balanced">
                      Balanced mix
                    </option>
                    <option value="rating">
                      Mostly ratings
                    </option>
                    <option value="text">
                      Mostly text
                    </option>
                    <option value="mcq">
                      Mostly MCQs
                    </option>
                  </select>
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="px-6 py-4 border-t border-black/5 dark:border-white/10 flex items-center justify-end gap-3">
              <button
                data-px-onclick="closeAiModal()"
                className="px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition"
                data-px=""
              >
                {" Cancel "}
              </button>
              {" "}
              <button
                id="aiSubmitBtn"
                data-px-onclick="generateWithAI()"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition"
                data-px=""
              >
                <span className="material-symbols-rounded text-base filled">
                  auto_awesome
                </span>
                {" Generate "}
              </button>
            </div>
            {/* Loading State */}
            <div
              id="aiLoading"
              className="absolute inset-0 bg-white/90 dark:bg-brand-900/90 flex-col items-center justify-center hidden"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mb-4">
                <span className="material-symbols-rounded text-3xl text-white animate-spin">
                  progress_activity
                </span>
              </div>
              <p className="font-semibold">
                Generating questions...
              </p>
              <p className="text-sm text-neutral-500 dark:text-white/50">
                This may take a few seconds
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Toast */}
      <div
        id="toast"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-900 text-white text-sm font-medium shadow-xl opacity-0 pointer-events-none transition-all"
      >
        <span className="material-symbols-rounded text-base" id="toastIcon">
          check
        </span>
        {" "}
        <span id="toastText">
          Success!
        </span>
      </div>
      <script src="/_legacy/teachers/teacher_feedback_create/script-02.js" />
    </LegacyPage>
  );
}
