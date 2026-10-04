/**
 * Endpoints used by the collage syllabus page. Syllabus CRUD goes through
 * `collageFetchJson` (helpers.js `fetchJson`); the topic tools (blink, LabX,
 * topic search) were plain `fetch` calls in the original and keep their own
 * error messages (`detail`, or `HTTP <status>`).
 */

import { apiRaw } from "@/lib/api";
import { collageFetchJson, errorText } from "./lib/http";
import { normalizeTopicKey, topicLabel } from "./lib/topics";
import type {
  BlinkGenerateResponse,
  BlinkLinksResponse,
  BlinkMap,
  LabxCheckResponse,
  LabxMap,
  LabxResponse,
  SyllabusCourseResponse,
  SyllabusUnit,
  TopicSearchResponse,
  TopicSuggestion,
  UnitPayload,
} from "./types";

// ── Syllabus ────────────────────────────────────────────────────────────────

export function fetchSyllabusCourse(courseId: string) {
  return collageFetchJson<SyllabusCourseResponse>(`/api/syllabus/courses/${courseId}`, { skipAuth: false });
}

export function createUnit(courseId: string, payload: UnitPayload) {
  return collageFetchJson(`/api/syllabus/courses/${courseId}/units`, { method: "POST", body: payload, skipAuth: false });
}

export function updateUnit(unitId: string, payload: UnitPayload) {
  return collageFetchJson(`/api/syllabus/units/${unitId}`, { method: "PUT", body: payload, skipAuth: false });
}

export function deleteUnit(unitId: string) {
  return collageFetchJson(`/api/syllabus/units/${unitId}`, { method: "DELETE", skipAuth: false });
}

// ── Plain-fetch helpers ─────────────────────────────────────────────────────

/** `throw new Error(errData.<field> || \`HTTP ${status}\`)` of the original handlers. */
async function failure(res: Response, fields: readonly ("error" | "detail")[]): Promise<Error> {
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown> | null;
  let value: unknown;
  for (const field of fields) {
    value = value || data?.[field];
  }
  return new Error(errorText(value || `HTTP ${res.status}`));
}

function postJson(path: string, body: unknown) {
  return apiRaw(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

/** `topics_json` query value: the unique normalized topic names, URI-encoded JSON. */
function topicsJsonParam(units: SyllabusUnit[]): string | null {
  const names: string[] = [];
  for (const unit of units) {
    for (const topic of unit.topics || []) {
      const name = topicLabel(topic).trim();
      if (name) names.push(name);
    }
  }
  if (!names.length) return null;
  const normalized = Array.from(new Set(names.map(normalizeTopicKey).filter(Boolean)));
  return encodeURIComponent(JSON.stringify(normalized));
}

// ── Topic search (unit modal autocomplete) ──────────────────────────────────

export async function searchTopics(q: string, signal: AbortSignal): Promise<TopicSuggestion[]> {
  const res = await apiRaw(`/api/notes/topics/search?q=${encodeURIComponent(q)}&limit=12`, { signal });
  if (!res.ok) throw new Error("Search failed: " + res.status);
  const data = (await res.json()) as TopicSearchResponse | null;
  return data && data.items ? data.items : [];
}

// ── Blink ───────────────────────────────────────────────────────────────────

/** Existing blink images for the units' topics, keyed by normalized topic name. */
export async function fetchBlinkLinks(units: SyllabusUnit[]): Promise<BlinkMap> {
  const param = topicsJsonParam(units);
  if (!param) return {};
  try {
    const res = await apiRaw(`/api/blink/links?topics_json=${param}`);
    if (res.ok) {
      const data = (await res.json()) as BlinkLinksResponse;
      const normalized: BlinkMap = {};
      for (const [topic, url] of Object.entries(data.links || {})) {
        const key = normalizeTopicKey(topic);
        if (!key || !url) continue;
        normalized[key] = url;
      }
      return normalized;
    }
  } catch (e) {
    console.error("[Blink] Error fetching links:", e);
  }
  return {};
}

/** Generates a blink image; resolves with its URL. */
export async function generateBlink(topic: string, topicId: string): Promise<string> {
  const res = await postJson("/api/blink/generate", { topic, topic_id: topicId });
  if (!res.ok) throw await failure(res, ["detail"]);
  const data = (await res.json()) as BlinkGenerateResponse;
  return data.url || "";
}

/** Sets (or, with `''`, clears) `ai_notes.blink_link` for a topic. */
export async function saveBlinkLink(topicId: string, topic: string, blinkLink: string): Promise<unknown> {
  const res = await postJson("/api/blink/link", { topic_id: topicId, topic, blink_link: blinkLink });
  if (!res.ok) throw await failure(res, ["detail"]);
  return res.json().catch(() => ({}));
}

/** Removes the blink image of a topic. */
export async function removeBlink(topic: string): Promise<void> {
  const res = await postJson("/api/blink/remove", { topic });
  if (!res.ok) throw await failure(res, ["detail"]);
}

// ── LabX ────────────────────────────────────────────────────────────────────

/** Which topics already have a LabX explanation (keys lower-cased). */
export async function fetchLabxStatus(units: SyllabusUnit[]): Promise<LabxMap> {
  const param = topicsJsonParam(units);
  if (!param) return {};
  try {
    const res = await apiRaw(`/api/labx/check-batch?topics_json=${param}`);
    if (res.ok) {
      const data = (await res.json()) as LabxCheckResponse;
      const status: LabxMap = {};
      for (const [topic, exists] of Object.entries(data.cached || {})) {
        if (exists) status[topic.toLowerCase()] = true;
      }
      return status;
    }
  } catch (e) {
    console.error("[LabX] Error checking cache:", e);
  }
  return {};
}

/** `POST /api/labx/generate` (cached unless `forceRegenerate`). */
export async function generateLabx(topic: string, forceRegenerate: boolean): Promise<LabxResponse> {
  const res = await postJson("/api/labx/generate", { topic, force_regenerate: forceRegenerate });
  if (!res.ok) throw await failure(res, ["detail"]);
  return (await res.json()) as LabxResponse;
}

/** Cached LabX HTML only (`GET /api/labx/get/{topic}`), never regenerates. */
export async function getLabx(topic: string): Promise<LabxResponse> {
  const res = await apiRaw(`/api/labx/get/${encodeURIComponent(topic)}`);
  if (!res.ok) throw await failure(res, ["error", "detail"]);
  return (await res.json()) as LabxResponse;
}
