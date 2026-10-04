import { defineNotesConfig, type NotesWorkspaceConfig } from "@/features/notes";
import { extractRagMeta } from "./lib/rag";

/** What differs between `medical_notes.html` and `mediX/notes_chat.html`. */
export interface MedicalPageConfig {
  /** Notes workspace configuration (shared controller, toolbar, selection assistant, feedback…). */
  notes: NotesWorkspaceConfig;
  /**
   * Page load: `variantClick` (medical_notes) restores the last note and then
   * "clicks" Detailed (URL topic → resolve/generate, else last note id);
   * `topicOnly` (notes_chat) only auto-starts `?topic=` (120 ms after load).
   */
  load: "variantClick" | "topicOnly";
  /** notes_chat: RAG-grounded generation (`/api/medix/rag/chat`, citations, HTTP fallback, snapshot). */
  rag: boolean;
  /** Render ```mermaid blocks as diagrams (notes_chat disabled them). */
  mermaid: boolean;
}

/** Workspace settings shared by both medical pages (see the original scripts). */
const MEDICAL_NOTES_BASE: Parameters<typeof defineNotesConfig>[0] = {
  loginGate: "token",
  authToken: "storage",
  authLookups: false,
  header: { navLinks: [], share: false, density: false, verify: false },
  generateButton: "text",
  roles: { allow: "adminEmployee", cookieRetry: false, requireToken: true, teacherReview: false },
  editDesktopOnly: true,
  access: false,
  dbCheckFallback: "stop",
  videos: "fresh",
  toc: false,
  download: "server",
  fullscreen: { native: true, controls: "theme" },
  // Both pages read `?topic=` themselves (and never clean the URL).
  autoStart: { params: [], retry: false },
  loader: "lottie",
};

export const MEDICAL_NOTES_PAGE: MedicalPageConfig = {
  notes: defineNotesConfig({ ...MEDICAL_NOTES_BASE, pageFile: "medical_notes.html" }),
  load: "variantClick",
  rag: false,
  mermaid: true,
};

export const NOTES_CHAT_PAGE: MedicalPageConfig = {
  // The embedded RAG chunk metadata is not displayed.
  notes: defineNotesConfig({ ...MEDICAL_NOTES_BASE, pageFile: "notes_chat.html", prepareMarkdown: (md) => extractRagMeta(md).markdown }),
  load: "topicOnly",
  rag: true,
  mermaid: false,
};
