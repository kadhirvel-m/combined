"use client";

import { DEFAULT_VARIANTS, defineNotesConfig } from "../config";
import { AiAssistant } from "../components/AiAssistant";
import { NotesWorkspace } from "../components/NotesWorkspace";
import { prepareMathMarkdown } from "../lib/markdown";
import { decorateMathsOutput } from "../lib/outputDom";

/**
 * `maths_notes.html`: an older revision of the workspace with its own math
 * pipeline, a third "Simple" variant, cached videos, client-side PDF,
 * `?solve=` practice-problem solutions and the floating Tune AI assistant.
 */
export const MATHS_NOTES_CONFIG = defineNotesConfig({
  pageFile: "maths_notes.html",
  streamPath: "/api/maths-notes/generate/stream",
  variants: [...DEFAULT_VARIANTS, { key: "simple", label: "Simple" }],
  loginGate: "token",
  authLookups: false,
  header: {
    navLinks: [
      { href: "/notes_marketplace.html", label: "Marketplace" },
      { href: "/upload_note.html", label: "Upload Note" },
    ],
    share: false,
    density: true,
    verify: false,
  },
  generateButton: "text",
  roles: { allow: "adminEmployee", cookieRetry: false, requireToken: true, teacherReview: false },
  editDesktopOnly: true,
  access: false,
  dbCheckFallback: "stop",
  videos: "cached",
  download: "html2pdf",
  fullscreen: { native: false, controls: "home" },
  autoStart: { params: ["topic"], retry: false },
  solve: { param: "solve", path: "/api/maths-notes/solve" },
  storedTopicFallback: true,
  prepareMarkdown: prepareMathMarkdown,
  decorateOutput: decorateMathsOutput,
});

export function MathsNotesPage() {
  return <NotesWorkspace config={MATHS_NOTES_CONFIG} mainExtra={<AiAssistant />} />;
}
