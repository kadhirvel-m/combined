/**
 * Token helpers exactly as the original page read them. The shared runtime's
 * fetch wrapper strips the `__COOKIE_AUTH__` sentinel and relies on the
 * HttpOnly cookies, so `Bearer __COOKIE_AUTH__` is safe to send.
 */

const COOKIE_SENTINEL = "__COOKIE_AUTH__";

function hasCookieAuthState(): boolean {
  try {
    return document.cookie.indexOf("paperx_auth=") !== -1;
  } catch {
    return false;
  }
}

function read(storage: () => Storage, key: string): string {
  try {
    return (storage().getItem(key) || "").trim();
  } catch {
    return "";
  }
}

/** getToken() of the original page. */
export function getToken(): string | null {
  if (hasCookieAuthState()) return COOKIE_SENTINEL;
  const token = read(() => localStorage, "px_token");
  if (token && token !== COOKIE_SENTINEL) return token;
  const fallback = read(() => sessionStorage, "paperx_bearer_fallback");
  if (fallback) return fallback;
  const fallback2 = read(() => localStorage, "paperx_bearer_fallback");
  if (fallback2) return fallback2;
  return hasCookieAuthState() ? COOKIE_SENTINEL : null;
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Raw `localStorage.px_token` (the dev-mode role check reads only this). */
export function storedStudentToken(): string | null {
  try {
    return localStorage.getItem("px_token");
  } catch {
    return null;
  }
}
