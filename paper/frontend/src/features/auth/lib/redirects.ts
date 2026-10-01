/**
 * Where to go after signing in. Each function mirrors the rule of the page it
 * came from; they differ on purpose (param names and how strict they are).
 */

/** Default landing page for students after login / signup. */
export const STUDENT_HOME = "/academicas.html";
/** Teacher landing pages after an approved login. */
export const TEACHER_HOME = "/teacher_profile.html";
export const HOD_HOME = "/hod/hod_dashboard.html";
export const TEACHER_LOGIN = "/teachers/teacher_login.html";

/**
 * login.html: `?next=` (or `?redirect=`) resolved against the current
 * directory and accepted only when it stays on this origin.
 */
export function getSafeNextPath(): string | null {
  try {
    const params = new URLSearchParams(location.search || "");
    const raw = (params.get("next") || params.get("redirect") || "").trim();
    if (!raw) return null;
    // Block absolute / protocol-relative redirects.
    if (/^https?:\/\//i.test(raw) || raw.startsWith("//")) return null;

    // Resolve relative URLs safely to a same-origin path.
    const baseDir = location.origin + location.pathname.replace(/[^/]*$/, "");
    const url = new URL(raw, baseDir);
    if (url.origin !== location.origin) return null;
    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
}

/** signup.html: `?next=` only when it is a plain `path/to/page.html`. */
export function getSignupNextPath(): string | null {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && /^[a-zA-Z0-9_\-/]+\.html$/.test(next) ? next : null;
}

/** teacher_login.html: `?redirect=` when it is a relative or root-relative path. */
export function getTeacherRedirect(): string {
  try {
    const params = new URLSearchParams(location.search || "");
    const raw = params.get("redirect");
    if (!raw) return "";
    const decoded = decodeURIComponent(raw);
    if (!decoded.startsWith("/") && !decoded.startsWith("./") && !decoded.startsWith("../")) return "";
    if (/^https?:\/\//i.test(decoded)) return "";
    return decoded;
  } catch {
    return "";
  }
}

/** Full page load, like the original `location.href = …` (the session is re-read on arrival). */
export function navigateTo(path: string): void {
  window.location.href = path;
}
