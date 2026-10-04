/** notes_chat RAG helpers: citation labels, the "RAG CITATIONS" section and its embedded chunk metadata. */

import { getAuthToken } from "@/features/notes/lib/authToken";
import { medicalApi } from "../api";
import type { RagCitation, RagContext, RagLookup } from "../types";

const RAG_META_TAG = "PAPERX_RAG_META";
const RAG_META_RE = /<!--\s*PAPERX_RAG_META\s+([^>]+?)\s*-->/g;

/** Formatting rules sent with every RAG-grounded generation (`rag_system_prompt`). */
export const RAG_MARKDOWN_SYSTEM_PROMPT = [
  "The main problem is a Markdown line-break and spacing issue: headings and content are written on the same line instead of separate lines.",
  "A heading like ## Introduction must be on its own line, followed by a newline before the paragraph starts; otherwise formatting, tables, and lists can break.",
  "Leave one blank line before and after tables or lists.",
  'Do not include a "## Working" section in the final output.',
].join("\n");

/** Short, unique, upper-case label (≤7 chars) derived from a source file name. */
export function ragShortLabel(sourceName: unknown, used: Set<string>): string {
  const raw = String(sourceName || "").trim() || "SOURCE";
  const stem = (raw.split(/[\\/]/).pop() || "").replace(/\.[A-Za-z0-9]{1,8}$/i, "");
  const compact = stem.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const base = (compact || "SOURCE").slice(0, 7);
  let label = base;
  let n = 2;
  while (used.has(label)) {
    const suffix = String(n++);
    label = `${base.slice(0, Math.max(1, 7 - suffix.length))}${suffix}`;
  }
  used.add(label);
  return label;
}

/** Removes the embedded `<!-- PAPERX_RAG_META … -->` comments and returns the merged lookup. */
export function extractRagMeta(md: string): { markdown: string; lookup: RagLookup } {
  let merged: RagLookup = {};
  const markdown = String(md || "").replace(RAG_META_RE, (_whole, encoded: string) => {
    try {
      const parsed: unknown = JSON.parse(decodeURIComponent(String(encoded || "").trim()));
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) merged = { ...merged, ...(parsed as RagLookup) };
    } catch {
      /* malformed metadata is dropped */
    }
    return "";
  });
  return { markdown, lookup: merged };
}

function embedRagMeta(md: string, lookup: RagLookup): string {
  const text = String(md || "");
  if (!Object.keys(lookup).length) return text;
  let encoded = "";
  try {
    encoded = encodeURIComponent(JSON.stringify(lookup));
  } catch {
    return text;
  }
  return `${text}\n\n<!-- ${RAG_META_TAG} ${encoded} -->\n`;
}

/** Appends the "## RAG CITATIONS" list (≤8 sources) and the chunk metadata to the generated notes. */
export function appendRagCitations(markdown: string | undefined, rag: RagContext | null): string {
  const md = String(markdown || "");
  if (!rag || !Array.isArray(rag.citations) || !rag.citations.length) return md;
  const used = new Set<string>();
  const lookup: RagLookup = {};
  const lines = rag.citations.slice(0, 8).map((c) => {
    const source = String(c?.source_name || "Source").trim();
    const label = ragShortLabel(source, used);
    const chunkIndex = String(c?.chunk_index ?? "").trim();
    lookup[label] = {
      source_name: source,
      chunk_index: chunkIndex,
      section_title: String(c?.section_title || "").trim(),
      similarity: Number(c?.similarity || 0),
      chunk_text: String(c?.chunk_text || "").trim(),
    };
    return `- [${label}] ${source}${chunkIndex ? ` (chunk ${chunkIndex})` : ""}`;
  });
  return embedRagMeta(`${md}\n\n## RAG CITATIONS\n${lines.join("\n")}\n`, lookup);
}

/** Compact chunk evidence passed to the generator (`rag_citations`, ≤12, chunk text ≤2600 chars). */
export function compactRagCitations(citations: RagCitation[]): string {
  const used = new Set<string>();
  return JSON.stringify(
    citations.slice(0, 12).map((c) => ({
      label: ragShortLabel(String(c?.source_name || "RAG source").trim(), used),
      source_name: c.source_name,
      chunk_index: c.chunk_index,
      section_title: c.section_title,
      similarity: c.similarity,
      chunk_text: (typeof c.chunk_text === "string" ? c.chunk_text : "").slice(0, 2600),
    })),
  );
}

/** `[LABEL] rest` → `{ label, rest }` for the items of the "RAG CITATIONS" section. */
export function parseRagCitationItem(text: string): { label: string; rest: string } | null {
  const m = String(text || "").trim().match(/^\[([A-Z0-9]{2,10})\]\s*(.*)$/i);
  return m ? { label: m[1].toUpperCase(), rest: m[2] || "" } : null;
}

/* ------------------------------------------------------------------ */
/* Stream access token (notes_chat `ensureStreamAccessToken`)          */
/* ------------------------------------------------------------------ */

function normalizeAccessToken(raw: unknown): string {
  const text = String(raw || "").trim();
  if (!text || text === "__COOKIE_AUTH__" || text === "null" || text === "undefined") return "";
  if (/^bearer\s+/i.test(text)) return text.replace(/^bearer\s+/i, "").trim();
  if (text.startsWith("{")) {
    try {
      const parsed = JSON.parse(text) as { currentSession?: { access_token?: string }; access_token?: string; session?: { access_token?: string } };
      return String(parsed?.currentSession?.access_token || parsed?.access_token || parsed?.session?.access_token || "").trim();
    } catch {
      return "";
    }
  }
  return text;
}

function readStorage(storage: () => Storage, key: string): string | null {
  try {
    return storage().getItem(key);
  } catch {
    return null;
  }
}

function hasAuthSessionSignal(): boolean {
  try {
    if (document.cookie && document.cookie.indexOf("paperx_auth=") !== -1) return true;
  } catch {
    /* cookies unavailable */
  }
  return readStorage(() => localStorage, "paperx_session_state") === "1";
}

/** Bearer for the SSE `access_token` param: stored token → bearer fallback → `POST /refresh`. */
export async function ensureStreamAccessToken(): Promise<string> {
  const direct = normalizeAccessToken(getAuthToken("storage"));
  if (direct) return direct;
  const fallback =
    normalizeAccessToken(readStorage(() => sessionStorage, "paperx_bearer_fallback")) || normalizeAccessToken(readStorage(() => localStorage, "paperx_bearer_fallback"));
  if (fallback) return fallback;
  if (!hasAuthSessionSignal()) return "";
  try {
    const res = await medicalApi.refresh();
    if (!res.ok) return "";
    const refreshed = normalizeAccessToken(res.data?.access_token || "");
    if (!refreshed) return "";
    try {
      sessionStorage.setItem("paperx_bearer_fallback", refreshed);
      localStorage.setItem("paperx_bearer_fallback", refreshed);
    } catch {
      /* storage unavailable */
    }
    return refreshed;
  } catch {
    return "";
  }
}
