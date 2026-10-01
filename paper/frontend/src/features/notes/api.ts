/**
 * Typed wrappers around every endpoint the notes pages call. They return the
 * raw status alongside the parsed body because the pages branch on status
 * codes (200 vs 404 vs other) exactly like the originals did.
 */

import { apiRaw, apiUrl, type ApiRequestOptions } from "@/lib/api";
import { bearer } from "./lib/authToken";
import type {
  AccessCheckResponse,
  AccessSummary,
  AcademicMeta,
  AllowedDomains,
  DegreeRow,
  FeedbackPayload,
  JsonResult,
  MeResponse,
  NoteRecord,
  RelatedVideo,
  RolesResponse,
  SyllabusTopic,
  TranscriptMeta,
  VerifyResponse,
} from "./types";

async function parseJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** JSON request that never throws on HTTP status (network errors still throw). */
export async function requestJson<T>(path: string, options: ApiRequestOptions = {}): Promise<JsonResult<T>> {
  const res = await apiRaw(path, options);
  return { ok: res.ok, status: res.status, data: await parseJson<T>(res) };
}

/** `{ ok, status: 0 }` on network errors/timeouts instead of throwing. */
export async function fetchJsonWithTimeout<T>(path: string, { timeoutMs = 8000, headers }: { timeoutMs?: number; headers?: Record<string, string> } = {}): Promise<JsonResult<T>> {
  try {
    return await requestJson<T>(path, { timeoutMs, headers });
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Retries network errors and 5xx; 200/404 (and other 4xx) are returned as-is. */
export async function fetchJsonWithRetry<T>(
  path: string,
  { timeoutMs = 8000, attempts = 3, headers }: { timeoutMs?: number; attempts?: number; headers?: Record<string, string> } = {},
): Promise<JsonResult<T>> {
  let last: JsonResult<T> | null = null;
  for (let i = 0; i < attempts; i++) {
    const r = await fetchJsonWithTimeout<T>(path, { timeoutMs, headers });
    last = r;
    if (r.status === 200 || r.status === 404) return r;
    if (r.status === 0 || r.status >= 500) {
      await sleep(250 * (i + 1));
      continue;
    }
    return r;
  }
  return last || { ok: false, status: 0, data: null };
}

const q = encodeURIComponent;

export const notesApi = {
  /* ---- stored notes ------------------------------------------------- */
  noteByIdPath: (id: string, variant: string) => `/notes/${q(id)}?variant=${q(variant)}`,
  resolvePath: (title: string, variant: string) => `/api/notes/resolve?title=${q(title)}&variant=${q(variant)}`,
  getNote: (id: string, variant: string) => requestJson<NoteRecord>(notesApi.noteByIdPath(id, variant)),
  createNote: (variant: string, body: { topic: string; markdown: string; image_urls: string[] }) =>
    requestJson<NoteRecord>(`/notes?variant=${q(variant)}`, { method: "POST", json: body }),
  updateNote: (id: string, variant: string, body: { markdown: string; image_urls: string[] }) =>
    requestJson<NoteRecord>(`/notes/${q(id)}?variant=${q(variant)}`, { method: "PUT", json: body }),
  notePdf: (id: string) => apiRaw(`/notes/${q(id)}/pdf`),
  adhocPdf: (title: string, markdown: string) => apiRaw("/pdf", { method: "POST", json: { title, markdown } }),

  /* ---- "My note" (per-user edited copy) ------------------------------ */
  editedCheck: (title: string, variant: string, token: string) =>
    requestJson<{ exists?: boolean }>(`/api/notes/edited/check?title=${q(title)}&variant=${q(variant)}`, { headers: bearer(token) }),
  getEdited: (title: string, variant: string, token: string) =>
    requestJson<NoteRecord & { detail?: string; error?: string }>(`/api/notes/edited?title=${q(title)}&variant=${q(variant)}`, { headers: bearer(token) }),
  saveEdited: (title: string, markdown: string, variant: string, token: string) =>
    requestJson<unknown>(`/api/notes/edited?variant=${q(variant)}`, { method: "POST", json: { title, markdown }, headers: bearer(token) }),

  verify: (payload: { note_id: string } | { title: string }, token: string) =>
    requestJson<VerifyResponse>("/api/notes/verify", { method: "POST", json: payload, headers: bearer(token) }),

  /* ---- AI helpers ---------------------------------------------------- */
  snippetAssist: (selection: string, instruction: string) =>
    requestJson<{ text?: string; detail?: string; error?: string }>("/api/notes/snippet-assist", { method: "POST", json: { selection, instruction } }),
  transform: (mode: string, markdown: string, prompt?: string) =>
    apiRaw("/api/notes/transform", { method: "POST", json: { mode, markdown, prompt } }),
  solve: (path: string, question: string) => requestJson<{ markdown?: string; error?: string }>(path, { method: "POST", json: { question } }),

  feedback: (body: FeedbackPayload, token: string) =>
    requestJson<{ detail?: string }>("/api/notes/feedback", { method: "POST", json: body, headers: bearer(token) }),

  /* ---- degree / sources ---------------------------------------------- */
  degrees: (headers?: Record<string, string>) => requestJson<DegreeRow[]>("/api/notes/degrees", { headers }),
  allowedDomains: (degree: string, headers?: Record<string, string>) =>
    requestJson<AllowedDomains>(`/api/notes/allowed-domains?degree=${q(degree)}`, { headers }),
  me: (token: string) => requestJson<MeResponse>("/api/me", { headers: bearer(token) }),
  academicMeta: () => requestJson<AcademicMeta>("/api/public/academic-meta"),
  topicsByTitlePath: (topic: string) => `/api/syllabus/topics/by-title?topic=${q(topic)}`,
  topicsByTitle: (topic: string, headers?: Record<string, string>) => requestJson<SyllabusTopic[]>(notesApi.topicsByTitlePath(topic), { headers }),

  /* ---- roles & plan limits -------------------------------------------- */
  roles: (headers: Record<string, string>) => requestJson<RolesResponse>("/api/admin/roles/me", { headers, credentials: "include" }),
  accessCheck: (action: string, consume: boolean, increment: number, token: string) =>
    requestJson<AccessCheckResponse>("/api/access/check-and-consume", {
      method: "POST",
      json: { action, consume, increment },
      headers: bearer(token),
    }),
  accessSummary: (token: string) => requestJson<AccessSummary>("/api/access/summary", { headers: bearer(token) }),

  /* ---- videos ---------------------------------------------------------- */
  youtubeSearch: (query: string, signal: AbortSignal | undefined, headers?: Record<string, string>) =>
    requestJson<RelatedVideo[]>(`/api/youtube/search?query=${q(query)}&num=8`, { signal, headers }),
  channelLogo: (channelUrl: string) => requestJson<{ logo?: string }>(`/api/youtube/channel-logo?channel_url=${q(channelUrl)}`),
  transcriptMeta: (url: string, timeoutMs?: number) => requestJson<TranscriptMeta>("/api/transcripts/meta", { method: "POST", json: { url }, timeoutMs }),

  /* ---- selected-text images (img_gen) ---------------------------------- */
  generateSelectedImage: (body: { selected_text: string; topic: string }) => apiRaw("/api/blink/generate-selected", { method: "POST", json: body }),
  selectedImages: (topic: string) =>
    requestJson<{ items?: { selected_text?: string; image_url?: string }[] }>(`/api/blink/selected-images?topic=${q(topic)}`),
  saveSelectedImage: (body: { topic: string; image_url: string; selected_text: string }) =>
    apiRaw("/api/blink/selected-images", { method: "POST", json: body }),

  /* ---- study sessions --------------------------------------------------- */
  garlicAutoCloseUrl: () => apiUrl("/api/garlic/v3/session/auto-close"),
};

/** YouTube oEmbed (third-party, no cookies). */
export async function youtubeOembed(videoUrl: string, timeoutMs = 4000): Promise<{ author_name?: string; author_url?: string } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${q(videoUrl)}`, { signal: controller.signal });
    return res.ok ? await parseJson(res) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Downloads a Blob as a file. */
export function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
