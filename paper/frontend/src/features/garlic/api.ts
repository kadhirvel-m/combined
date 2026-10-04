import { apiRaw, type ApiRequestOptions } from "@/lib/api";
import type {
  AnswerEvaluation,
  DailyTarget,
  ExamActivateResponse,
  ExamInsight,
  ExamStatusResponse,
  GarlicPlan,
  MeResponse,
  MicroDiagnosticResponse,
  OutcomePrediction,
  PlanContext,
  ProgressResponse,
  ReplanResponse,
  Velocity,
} from "./types";

const AUTH_SENTINEL = "__COOKIE_AUTH__";
const V3 = "/api/garlic/v3";

function readStorage(storage: () => Storage, key: string): string {
  try {
    return (storage().getItem(key) || "").trim();
  } catch {
    return "";
  }
}

/**
 * The original `getToken()`: the auth cookie marker wins (as the cookie
 * sentinel, which the shared fetch runtime strips), then a real `px_token`,
 * then the in-tab and stored bearer fallbacks.
 */
function currentToken(): string {
  let cookie = false;
  try {
    cookie = document.cookie.indexOf("paperx_auth=") !== -1;
  } catch {}
  if (cookie) return AUTH_SENTINEL;
  const token = readStorage(() => localStorage, "px_token");
  if (token && token !== AUTH_SENTINEL) return token;
  return readStorage(() => sessionStorage, "paperx_bearer_fallback") || readStorage(() => localStorage, "paperx_bearer_fallback");
}

/** `Authorization: Bearer …` like the original `authHeaders()` (empty without a token). */
export function authHeaders(): Record<string, string> {
  const token = currentToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Waits for the shared runtime's token refresh (the original `ensureAuthReady()`); never throws. */
export async function ensureAuthReady(): Promise<void> {
  try {
    if (typeof window.__PX_ENSURE_AUTH_READY === "function") await window.__PX_ENSURE_AUTH_READY();
  } catch {}
}

/** A non-2xx response of {@link fetchJson}: the backend's `detail` (or `HTTP n`) plus the status. */
export class GarlicHttpError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "GarlicHttpError";
    this.status = status;
  }
}

/** The original `fetchJson()`: JSON body (or `{}`), throws {@link GarlicHttpError} for non-2xx. */
async function fetchJson<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const res = await apiRaw(path, { ...options, headers: { ...authHeaders(), ...(options.headers as Record<string, string>) } });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown> | null;
  if (!res.ok) throw new GarlicHttpError(String(data?.detail || `HTTP ${res.status}`), res.status);
  return data as T;
}

type CompatResult<T> = { unauthorized: true } | { error: true } | { status: number; data: T | null };

/** The original `fetchJsonCompat()`: never throws; 401 and network/parse failures are flagged. */
async function fetchJsonCompat<T>(path: string): Promise<CompatResult<T>> {
  try {
    const res = await apiRaw(path, { headers: authHeaders() });
    if (res.status === 401) return { unauthorized: true };
    const data = (res.ok ? await res.json() : null) as T | null;
    return { status: res.status, data };
  } catch {
    return { error: true };
  }
}

function isSuccess<T>(res: CompatResult<T>): res is { status: number; data: T | null } {
  return "status" in res && res.status >= 200 && res.status < 300;
}

// ---------- Plan ----------

/** GET /api/me */
export function fetchMe(): Promise<MeResponse> {
  return fetchJson<MeResponse>("/api/me");
}

/**
 * The original `loadLiveAcademicMetrics()` requests: GET /api/me then
 * GET /api/progress/topics, once more after a token refresh on a 401, two
 * attempts. A failed progress call counts as "nothing completed".
 */
export async function fetchLiveAcademicData(): Promise<{ me: MeResponse; progress: ProgressResponse }> {
  const maxAttempts = 2;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let meOut = await fetchJsonCompat<MeResponse>("/api/me");
    let progOut = await fetchJsonCompat<ProgressResponse>("/api/progress/topics");
    if ("unauthorized" in meOut || "unauthorized" in progOut) {
      await ensureAuthReady();
      meOut = await fetchJsonCompat<MeResponse>("/api/me");
      progOut = await fetchJsonCompat<ProgressResponse>("/api/progress/topics");
    }
    if (!isSuccess(meOut)) {
      if (attempt < maxAttempts - 1) continue;
      break;
    }
    const progress = isSuccess(progOut) ? progOut.data : { completed_topic_ids: [] };
    return { me: meOut.data || {}, progress: progress || {} };
  }
  throw new Error("Unable to load live profile context");
}

/** GET /api/garlic/plan/{student_id} (404 when no plan was saved yet). */
export function fetchPlan(studentId: string): Promise<GarlicPlan> {
  return fetchJson<GarlicPlan>(`/api/garlic/plan/${encodeURIComponent(studentId)}`);
}

/** POST /api/garlic/generate (or /regenerate) with the profile context. */
export function generatePlan(ctx: PlanContext, regenerate: boolean): Promise<GarlicPlan> {
  return fetchJson<GarlicPlan>(regenerate ? "/api/garlic/regenerate" : "/api/garlic/generate", {
    method: "POST",
    json: { student_id: ctx.student_id, batch_id: ctx.batch_id, semester: ctx.semester, college: ctx.college },
  });
}

/**
 * The original `trackTopicOpen()`: POST /api/garlic/study-plan/interaction,
 * then (with an item id) PATCH the item to in_progress. Errors are ignored.
 */
export async function trackTopicOpen(itemId: string | null | undefined, topicId: string | null | undefined): Promise<void> {
  try {
    await fetchJson("/api/garlic/study-plan/interaction", {
      method: "POST",
      json: { item_id: itemId || null, topic_id: topicId || null, event_type: "topic_click" },
    });
    if (itemId) {
      await fetchJson(`/api/garlic/study-plan/items/${encodeURIComponent(itemId)}`, {
        method: "PATCH",
        json: { status: "in_progress", last_accessed: new Date().toISOString() },
      });
    }
  } catch {}
}

// ---------- Exam mode (v3) ----------

export function activateExamMode(examDate: string): Promise<ExamActivateResponse> {
  return fetchJson<ExamActivateResponse>(`${V3}/exam-mode/activate`, { method: "POST", json: { exam_date: examDate } });
}

export function deactivateExamMode(): Promise<unknown> {
  return fetchJson(`${V3}/exam-mode/deactivate`, { method: "POST" });
}

export function fetchExamStatus(): Promise<ExamStatusResponse> {
  return fetchJson<ExamStatusResponse>(`${V3}/exam-mode/status`);
}

export async function fetchOutcomes(studentId: string): Promise<OutcomePrediction> {
  const res = await fetchJson<{ prediction?: OutcomePrediction | null }>(`${V3}/outcomes/${encodeURIComponent(studentId)}`);
  return res?.prediction || {};
}

export async function fetchDailyTarget(studentId: string): Promise<DailyTarget> {
  return (await fetchJson<DailyTarget | null>(`${V3}/daily-target/${encodeURIComponent(studentId)}`)) || {};
}

export async function fetchVelocity(studentId: string): Promise<Velocity> {
  const res = await fetchJson<{ velocity?: Velocity | null }>(`${V3}/velocity/${encodeURIComponent(studentId)}`);
  return res?.velocity || {};
}

export async function fetchExamInsights(studentId: string): Promise<ExamInsight[]> {
  const res = await fetchJson<{ insights?: ExamInsight[] | null }>(`${V3}/exam-insights/${encodeURIComponent(studentId)}`);
  return res?.insights || [];
}

export function startMicroDiagnostic(): Promise<MicroDiagnosticResponse> {
  return fetchJson<MicroDiagnosticResponse>(`${V3}/diagnostic/micro`, { method: "POST" });
}

export async function answerMicroDiagnostic(sessionId: string | null, questionId: string, answer: string): Promise<AnswerEvaluation> {
  const res = await fetchJson<{ evaluation?: AnswerEvaluation | null }>(`${V3}/diagnostic/answer`, {
    method: "POST",
    json: { session_id: sessionId, question_id: questionId, answer },
  });
  return res?.evaluation || {};
}

export function applyConfidenceDecay(): Promise<unknown> {
  return fetchJson(`${V3}/confidence-decay`, { method: "POST" });
}

export function requestReplan(): Promise<ReplanResponse> {
  return fetchJson<ReplanResponse>(`${V3}/replan`, { method: "POST" });
}
