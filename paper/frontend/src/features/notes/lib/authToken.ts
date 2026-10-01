/**
 * Auth token lookup used by the notes pages (port of their `getAuthToken()`).
 *
 * The token is only used to decide "is somebody signed in?" and to build an
 * `Authorization` header. The shared fetch runtime strips the cookie sentinel
 * and sends cookies, so both bearer and cookie sessions work.
 */

export const COOKIE_AUTH_SENTINEL = "__COOKIE_AUTH__";

const TOKEN_KEYS = ["teacherToken", "px_token", "userToken", "sb-access-token", "supabase.auth.token"];

/** `full`: normalized values, bearer fallback and cookie sentinel. `storage`: raw localStorage keys only. */
export type AuthTokenMode = "full" | "storage";

function normalizeAuthCandidate(value: unknown): string {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const lower = raw.toLowerCase();
  if (raw === COOKIE_AUTH_SENTINEL || raw === "__cookie__" || ["cookie", "null", "undefined", "none"].includes(lower)) return "";
  return raw;
}

function read(storage: () => Storage, key: string): string | null {
  try {
    return storage().getItem(key);
  } catch {
    return null;
  }
}

export function getAuthToken(mode: AuthTokenMode = "full"): string {
  if (typeof window === "undefined") return "";
  for (const key of TOKEN_KEYS) {
    const raw = read(() => localStorage, key);
    const value = mode === "full" ? normalizeAuthCandidate(raw) : raw || "";
    if (value) return value;
  }
  if (mode === "storage") return "";
  const fallback =
    normalizeAuthCandidate(read(() => sessionStorage, "paperx_bearer_fallback")) ||
    normalizeAuthCandidate(read(() => localStorage, "paperx_bearer_fallback"));
  if (fallback) return fallback;
  try {
    if (document.cookie.indexOf("paperx_auth=") !== -1) return COOKIE_AUTH_SENTINEL;
  } catch {
    /* cookies unavailable */
  }
  return "";
}

/** `{ Authorization: "Bearer …" }` when a token exists, otherwise `{}`. */
export function bearer(token: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** True when the token is a real bearer value (not a cookie placeholder). */
export function isRealBearer(token: string): boolean {
  const norm = String(token || "").trim();
  return !!norm && !["__cookie_auth__", "__cookie__", "cookie", "null", "undefined", "none"].includes(norm.toLowerCase());
}

/**
 * The pages' login gate: `session` accepts any session marker (token, refresh
 * token, session flag, bearer fallback or auth cookie); `token` only the
 * stored access/refresh token.
 */
export function hasLoginMarker(mode: "session" | "token"): boolean {
  const token = read(() => localStorage, "px_token");
  const refresh = read(() => localStorage, "px_refresh_token");
  if (mode === "token") return !!token || !!refresh;
  if (String(token || "").trim() || String(refresh || "").trim()) return true;
  if (String(read(() => localStorage, "paperx_session_state") || "").trim() === "1") return true;
  if (String(read(() => sessionStorage, "paperx_bearer_fallback") || "").trim()) return true;
  try {
    return document.cookie.indexOf("paperx_auth=") !== -1;
  } catch {
    return false;
  }
}
