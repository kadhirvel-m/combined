/**
 * Typed client for the Paper X FastAPI backend.
 *
 * Requests go through `window.fetch`, which the shared runtime
 * (`src/runtime/config`, installed by <Providers>) patches exactly like the
 * legacy pages: cookies are always sent, the CSRF header is attached to unsafe
 * methods, and a 401/403 triggers one cross-tab-coordinated token refresh and
 * retry. React pages and legacy pages therefore share one session.
 */

import { PROD_API_BASE } from "@/runtime/env";

/** Base URL of the backend, e.g. `http://localhost:8000` (no trailing slash). */
export function apiBase(): string {
  if (typeof window === "undefined") return PROD_API_BASE.replace(/\/$/, "");
  return String(window.API_BASE || window.__API_BASE || PROD_API_BASE).replace(/\/$/, "");
}

/** Absolute URL for a backend path (`/api/me`) or passthrough for absolute URLs. */
export function apiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${apiBase()}${path.startsWith("/") ? path : `/${path}`}`;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/** Pulls a human-readable message out of a FastAPI error body. */
export function errorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return typeof body === "string" && body ? body : fallback;
  const record = body as Record<string, unknown>;
  const detail = record.detail ?? record.message ?? record.error;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length) {
    const first = detail[0] as Record<string, unknown> | string;
    if (typeof first === "string") return first;
    if (first && typeof first.msg === "string") return first.msg;
  }
  return fallback;
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  /** JSON body (serialized, sets Content-Type). */
  json?: unknown;
  /** Raw body (FormData, Blob, string…). */
  body?: BodyInit | null;
  /** Query string parameters; undefined/null values are skipped. */
  query?: Record<string, string | number | boolean | null | undefined>;
  /** Abort after this many milliseconds. */
  timeoutMs?: number;
}

function withQuery(url: string, query: ApiRequestOptions["query"]): string {
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  if (!qs) return url;
  return url + (url.includes("?") ? "&" : "?") + qs;
}

/** Low-level request returning the raw Response (never throws on HTTP status). */
export async function apiRaw(path: string, options: ApiRequestOptions = {}): Promise<Response> {
  const { json, body, query, timeoutMs, headers, signal, ...init } = options;
  const finalHeaders = new Headers(headers);
  let finalBody: BodyInit | null | undefined = body;
  if (json !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
    finalBody = JSON.stringify(json);
  }
  let controller: AbortController | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  if (timeoutMs) {
    controller = new AbortController();
    timer = setTimeout(() => controller?.abort(), timeoutMs);
    signal?.addEventListener("abort", () => controller?.abort(), { once: true });
  }
  try {
    return await fetch(withQuery(apiUrl(path), query), {
      credentials: "include",
      ...init,
      headers: finalHeaders,
      body: finalBody,
      signal: controller ? controller.signal : signal,
    });
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function parseBody(res: Response): Promise<unknown> {
  const type = res.headers.get("content-type") || "";
  if (res.status === 204) return null;
  if (type.includes("application/json")) return res.json().catch(() => null);
  const text = await res.text().catch(() => "");
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

/** JSON request; throws {@link ApiError} for non-2xx responses. */
export async function apiFetch<T = unknown>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const res = await apiRaw(path, options);
  const data = await parseBody(res);
  if (!res.ok) {
    throw new ApiError(res.status, errorMessage(data, `Request failed (${res.status})`), data);
  }
  return data as T;
}

export const api = {
  get: <T = unknown>(path: string, options?: ApiRequestOptions) => apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T = unknown>(path: string, json?: unknown, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: "POST", json }),
  put: <T = unknown>(path: string, json?: unknown, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: "PUT", json }),
  patch: <T = unknown>(path: string, json?: unknown, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: "PATCH", json }),
  delete: <T = unknown>(path: string, options?: ApiRequestOptions) => apiFetch<T>(path, { ...options, method: "DELETE" }),
  /** multipart/form-data upload. */
  upload: <T = unknown>(path: string, form: FormData, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { method: "POST", ...options, body: form }),
};
