import { apiRaw, type ApiRequestOptions } from "@/lib/api";
import { authHeaders, storedStudentToken } from "./lib/auth";
import { normalizeTopicKey, wait } from "./lib/topics";
import type {
  AccessDecision,
  CollegeDetails,
  MeResponse,
  SyllabusCourse,
  TeacherNote,
  TopicSuggestion,
} from "./types";

/** fetchJson() of the original: 401 → unauthorized, non-2xx → data null, network → error. */
export type FetchOut<T> = { unauthorized: true } | { status: number; data: T | null } | { error: true };

export async function fetchJson<T>(path: string, options: ApiRequestOptions = {}): Promise<FetchOut<T>> {
  try {
    const res = await apiRaw(path, { ...options, headers: { ...authHeaders(), ...(options.headers as Record<string, string>) } });
    if (res.status === 401) return { unauthorized: true };
    const data = res.ok ? ((await res.json()) as T) : null;
    return { status: res.status, data };
  } catch {
    return { error: true };
  }
}

export function isSuccess<T>(out: FetchOut<T>): out is { status: number; data: T | null } {
  return "status" in out && out.status >= 200 && out.status < 300;
}

export const isUnauthorized = <T>(out: FetchOut<T>): boolean => "unauthorized" in out;

export const getMe = () => fetchJson<MeResponse>("/api/me");
export const getProgress = () => fetchJson<{ completed_topic_ids?: string[] }>("/api/progress/topics");

export const getCoursesBatch = (courseIds: string[]) =>
  fetchJson<SyllabusCourse[]>("/api/syllabus/courses/batch", { method: "POST", json: { course_ids: courseIds } });

export const getCourse = (courseId: string) => fetchJson<SyllabusCourse>(`/api/syllabus/courses/${encodeURIComponent(courseId)}`);

export const getBatchCourses = (batchId: string, semester: number) =>
  fetchJson<SyllabusCourse[]>(
    `/api/syllabus/batch/${encodeURIComponent(batchId)}/courses?semester=${encodeURIComponent(String(Math.trunc(semester)))}`,
  );

/** POST /api/marketplace/subjects/teacher-notes/batch → notes per subject id. */
export async function fetchTeacherNotes(subjectIds: string[]): Promise<Map<string, TeacherNote[]>> {
  const bySubject = new Map<string, TeacherNote[]>();
  if (!subjectIds.length) return bySubject;
  try {
    const res = await apiRaw("/api/marketplace/subjects/teacher-notes/batch", {
      method: "POST",
      headers: authHeaders(),
      json: { subject_ids: subjectIds, limit: 20 },
    });
    const data = (await res.json().catch(() => ({}))) as { notes?: Record<string, TeacherNote[]>; detail?: string; error?: string };
    if (!res.ok) throw new Error(data?.detail || data?.error || `HTTP ${res.status}`);
    for (const [sid, notes] of Object.entries(data?.notes || {})) {
      if (Array.isArray(notes) && notes.length) bySubject.set(String(sid), notes);
    }
  } catch (err) {
    console.warn("[Academics] teacher notes batch fetch failed", err);
  }
  return bySubject;
}

/** GET /api/blink/links?topics_json=[…] (3 attempts; `loaded: false` means not ready). */
export async function fetchBlinkLinks(topicNames: string[]): Promise<Map<string, string>> {
  const links = new Map<string, string>();
  if (!topicNames.length) return links;
  const topics = Array.from(new Set(topicNames.map(normalizeTopicKey).filter(Boolean)));
  const param = encodeURIComponent(JSON.stringify(topics));
  const maxAttempts = 3;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const out = await fetchJson<{ loaded?: boolean; links?: Record<string, string> }>(`/api/blink/links?topics_json=${param}`);
      if (isSuccess(out) && out.data) {
        if (out.data.loaded === false) throw new Error("Blink backend not ready");
        for (const [key, link] of Object.entries(out.data.links || {})) links.set(normalizeTopicKey(key), link);
        return links;
      }
    } catch (err) {
      if (attempt === maxAttempts - 1) {
        console.warn("[Academics] Failed to fetch blink links", err);
        throw err;
      }
    }
    await wait(180 * (attempt + 1));
  }
  throw new Error("Blink fetch retry exhausted");
}

/** GET /api/labx/check-batch?topics_json=[…] → topics with a cached LabX page. */
export async function fetchLabxStatus(topicNames: string[]): Promise<Map<string, boolean>> {
  const labx = new Map<string, boolean>();
  if (!topicNames.length) return labx;
  const topics = Array.from(new Set(topicNames.map(normalizeTopicKey).filter(Boolean)));
  const param = encodeURIComponent(JSON.stringify(topics));
  const maxAttempts = 3;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await apiRaw(`/api/labx/check-batch?topics_json=${param}`, { headers: authHeaders() });
      if (res.ok) {
        const data = (await res.json()) as { loaded?: boolean; cached?: Record<string, boolean> };
        if (data?.loaded === false) throw new Error("LabX backend not ready");
        for (const [key, exists] of Object.entries(data?.cached || {})) if (exists) labx.set(normalizeTopicKey(key), true);
        return labx;
      }
    } catch (err) {
      if (attempt === maxAttempts - 1) {
        console.warn("[Academics] Failed to fetch LabX status", err);
        return labx;
      }
    }
    await wait(180 * (attempt + 1));
  }
  return labx;
}

/** POST /api/syllabus/topics/ratings/batch → staff star rating per topic id. */
export async function fetchTopicRatings(topicIds: string[]): Promise<Map<string, number>> {
  const ratings = new Map<string, number>();
  if (!topicIds.length) return ratings;
  try {
    const res = await apiRaw("/api/syllabus/topics/ratings/batch", { method: "POST", headers: authHeaders(), json: { topic_ids: topicIds } });
    if (res.ok) {
      const data = (await res.json()) as { ratings?: Record<string, number> };
      for (const [id, rating] of Object.entries(data?.ratings || {})) ratings.set(id, rating);
    }
  } catch (err) {
    console.warn("[Academics] Failed to fetch topic ratings", err);
  }
  return ratings;
}

/** GET /api/wishlist → wishlisted topic ids (null when the request failed). */
export async function fetchWishlistIds(): Promise<Set<string> | null> {
  try {
    const out = await fetchJson<{ wishlist?: { topic_id?: string }[] }>("/api/wishlist");
    if (isSuccess(out) && out.data?.wishlist) {
      return new Set(out.data.wishlist.map((item) => item.topic_id).filter((id): id is string => Boolean(id)));
    }
  } catch (err) {
    console.warn("[Academics] Failed to fetch wishlist", err);
  }
  return null;
}

/** POST /api/wishlist/toggle → the server's wishlisted flag. */
export async function toggleWishlist(topicId: string): Promise<boolean> {
  const res = await apiRaw("/api/wishlist/toggle", { method: "POST", headers: authHeaders(), json: { topic_id: topicId } });
  const data = (await res.json()) as { wishlisted?: boolean; detail?: string };
  if (!res.ok) throw new Error(data.detail || "Failed");
  return Boolean(data.wishlisted);
}

export async function recordTopicHistory(topicId: string | null, topicName: string): Promise<void> {
  try {
    await apiRaw("/api/history/record", { method: "POST", headers: authHeaders(), json: { topic_id: topicId, topic_name: topicName } });
  } catch (err) {
    console.warn("[Academics] Failed to record history", err);
  }
}

export function toggleProgress(topicId: string | null, completed: boolean): void {
  apiRaw("/api/progress/toggle", { method: "POST", headers: authHeaders(), json: { topic_id: topicId, completed } }).catch(() => {});
}

/** POST /api/access/check-and-consume. Throws on network errors. */
export async function checkAccess(action: string, consume: boolean): Promise<{ ok: boolean; data: AccessDecision }> {
  const res = await apiRaw("/api/access/check-and-consume", {
    method: "POST",
    headers: authHeaders(),
    json: { action, consume: !!consume, increment: 1 },
  });
  const data = (await res.json().catch(() => ({}))) as AccessDecision;
  return { ok: res.ok, data: data || {} };
}

/** GET /api/labx/get/{topic} (raw response; the caller handles 404/empty). */
export const getLabx = (topic: string) => apiRaw(`/api/labx/get/${encodeURIComponent(topic)}`, { headers: authHeaders() });

export const getStreak = () => apiRaw("/api/streak", { headers: authHeaders() });
export const pingStreak = () => apiRaw("/api/streak/ping", { method: "POST", headers: authHeaders() }).catch(() => null);

export async function getFeatureFlags(): Promise<{ garlic_os?: boolean } | null> {
  const res = await apiRaw("/api/public/feature-flags");
  if (!res.ok) return null;
  return (await res.json()) as { garlic_os?: boolean };
}

/** GET /api/admin/roles/me with the raw stored token (skipped without one). */
export async function getAdminRole(): Promise<string | null> {
  const token = storedStudentToken();
  if (!token) return null;
  const res = await apiRaw("/api/admin/roles/me", { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return null;
  const data = (await res.json()) as { role?: string };
  return (data.role || "").toLowerCase().trim();
}

/** GET /api/notes/topics/search?q=&limit=8 (no auth header, as before). */
export async function searchTopics(q: string, signal: AbortSignal): Promise<TopicSuggestion[]> {
  const res = await apiRaw(`/api/notes/topics/search?q=${encodeURIComponent(q)}&limit=8`, { signal });
  if (!res.ok) throw new Error("Search failed");
  const data = (await res.json()) as { items?: TopicSuggestion[] };
  return data && data.items ? data.items : [];
}

export async function getColleges(): Promise<{ id: string; name: string }[]> {
  const items = await apiRaw("/api/colleges", { headers: authHeaders() })
    .then((res) => (res.ok ? res.json() : []))
    .catch((err) => {
      console.error("Failed to load colleges", err);
      return [];
    });
  return Array.isArray(items)
    ? (items as { id?: string | number; name?: string }[])
        .filter((col) => col && col.id && col.name)
        .map((col) => ({ id: String(col.id), name: String(col.name) }))
    : [];
}

export async function getCollegeDetails(collegeId: string): Promise<CollegeDetails> {
  const res = await apiRaw(`/api/colleges/${collegeId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`status ${res.status}`);
  return (await res.json()) as CollegeDetails;
}

/** PUT /api/profile/me. */
export async function updateProfile(payload: unknown): Promise<{ ok: boolean; detail?: string }> {
  const res = await apiRaw("/api/profile/me", { method: "PUT", headers: authHeaders(), json: payload });
  const out = (await res.json().catch(() => ({}))) as { detail?: string };
  return { ok: res.ok, detail: out?.detail };
}
