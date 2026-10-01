/**
 * What each auth page writes to web storage after a successful sign-in.
 *
 * All writes go through the shared storage shim (`runtime/config/auth-shim`):
 * token-like `localStorage` keys (`px_token`, `teacherToken`, `px_refresh_token`…)
 * are never persisted, while `paperx_session_state` and
 * `paperx_bearer_fallback` are. The call sequences below are the originals'.
 */

const SESSION_STATE_KEY = "paperx_session_state";
const BEARER_FALLBACK_KEY = "paperx_bearer_fallback";
const REFRESH_TOKEN_KEY = "px_refresh_token";
const OAUTH_PENDING_KEY = "paperx_oauth_pending";

/** Legacy keys from before the cookie session; cleared on every sign-in. */
const LEGACY_STUDENT_KEYS = ["px_token", "px_refresh_token", "px_token_expires_at"];

function removeLocal(keys: string[]): void {
  for (const key of keys) localStorage.removeItem(key);
}

/** `localStorage.paperx_session_state = "1"`: the "signed in" hint other pages read. */
export function markSessionActive(): void {
  try {
    localStorage.setItem(SESSION_STATE_KEY, "1");
  } catch {}
}

/** Cookie session is authoritative; clear any stale legacy token keys. */
export function clearLegacyStudentTokens(): void {
  try {
    removeLocal(LEGACY_STUDENT_KEYS);
  } catch {}
}

/** login.html after `POST /login` returned an access token. */
export function persistStudentLogin(accessToken: string, refreshToken?: string): void {
  try {
    removeLocal(LEGACY_STUDENT_KEYS);
    // Enforce single active session: clear teacher session if any.
    localStorage.removeItem("teacherToken");
    localStorage.setItem(SESSION_STATE_KEY, "1");
    // Fallback for browsers that block third-party cookies for the API origin.
    sessionStorage.setItem(BEARER_FALLBACK_KEY, accessToken);
    localStorage.setItem(BEARER_FALLBACK_KEY, accessToken);
    if (refreshToken) sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch {}
}

/** login.html: tokens from the OAuth callback hash, before the cookie exchange. */
export function persistOAuthCallbackTokens(accessToken: string, refreshToken: string | null): void {
  try {
    sessionStorage.setItem(BEARER_FALLBACK_KEY, accessToken);
    localStorage.setItem(BEARER_FALLBACK_KEY, accessToken);
    if (refreshToken) sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch {}
}

/** login.html: `/api/me` only worked with the bearer token (cookies blocked). */
export function persistBearerFallbackSession(accessToken: string): void {
  try {
    sessionStorage.setItem(BEARER_FALLBACK_KEY, accessToken);
    localStorage.setItem(BEARER_FALLBACK_KEY, accessToken);
    // Keep authenticated marker for pages that rely on cookie-state hints.
    localStorage.setItem(SESSION_STATE_KEY, "1");
  } catch {}
}

/** Drop a stale callback refresh token to avoid repeated invalid-refresh loops. */
export function dropRefreshToken(): void {
  try {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {}
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {}
}

/** teacher_login.html `persistTeacherSession`. */
export function persistTeacherSession(accessToken: unknown, refreshToken: unknown): void {
  const access = String(accessToken || "").trim();
  const refresh = String(refreshToken || "").trim();
  if (!access) return;
  // Cookie-session is authoritative. Keep only compatibility markers/fallbacks.
  try {
    removeLocal(["teacherToken", "px_token", "px_auth_token", "userToken", "sb-access-token", "px_token_expires_at", "px_refresh_token"]);
  } catch {}
  try {
    for (const key of ["teacherToken", "px_token", "px_auth_token", "userToken", "sb-access-token", "px_token_expires_at"]) {
      sessionStorage.removeItem(key);
    }
  } catch {}
  try {
    localStorage.setItem(SESSION_STATE_KEY, "1");
  } catch {}
  try {
    sessionStorage.setItem(BEARER_FALLBACK_KEY, access);
  } catch {}
  try {
    localStorage.setItem(BEARER_FALLBACK_KEY, access);
  } catch {}
  try {
    if (refresh) sessionStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    else sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {}
}

/** teacher_signup.html after a successful application. */
export function clearTokensAfterTeacherSignup(): void {
  try {
    removeLocal(["teacherToken", "px_token", "px_refresh_token", "px_token_expires_at"]);
  } catch {}
}

/** teacher_signup.html polls the application status while this reads as set. */
export function readTeacherToken(): string | null {
  try {
    return localStorage.getItem("teacherToken");
  } catch {
    return null;
  }
}

/** `sessionStorage.paperx_oauth_pending = "google"` while a Google redirect is in flight. */
export function setOAuthPendingFlag(enabled: boolean): void {
  try {
    if (enabled) sessionStorage.setItem(OAUTH_PENDING_KEY, "google");
    else sessionStorage.removeItem(OAUTH_PENDING_KEY);
  } catch {}
}

export function readOAuthPendingFlag(): boolean {
  try {
    return sessionStorage.getItem(OAUTH_PENDING_KEY) === "google";
  } catch {
    return false;
  }
}
