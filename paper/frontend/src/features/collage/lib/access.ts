/**
 * Role gate of the collage pages (helpers.js `getAnyToken`, `requireRoles`,
 * `requireAdminOrEmployee`). Errors carry `status` 401 (no session) or 403
 * (wrong role); pages show `<AccessDenied />` for those.
 */

import { CollageHttpError, collageFetchJson } from "./http";

const TOKEN_KEYS = ["token", "px_token", "access_token", "auth_token", "sb-access-token"];

/**
 * First stored token. Through the runtime's storage shim token keys read as
 * the `__COOKIE_AUTH__` sentinel whenever the visitor has a session (auth
 * cookie or session marker) and as null otherwise.
 */
export function getAnyToken(): string | null {
  for (const key of TOKEN_KEYS) {
    try {
      const value = localStorage.getItem(key);
      if (value) return value;
    } catch {}
  }
  return null;
}

interface RoleMe {
  role?: string | null;
  permissions?: Record<string, unknown> | null;
}

/** Resolves with the user's role (`GET /api/admin/roles/me`) if it is in `allowedRoles`. */
export async function requireRoles(allowedRoles: readonly string[]): Promise<string> {
  const token = getAnyToken();
  if (!token) throw new CollageHttpError("Missing token", 401);
  const me = await collageFetchJson<RoleMe>("/api/admin/roles/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const role = String(me?.role || "student").toLowerCase().trim();
  if (!allowedRoles.length) return role;
  if (!allowedRoles.includes(role)) throw new CollageHttpError("Access denied", 403);
  return role;
}

export function requireAdminOrEmployee(): Promise<string> {
  return requireRoles(["admin", "employee"]);
}

/** True for the 401/403 errors of {@link requireRoles}. */
export function isAccessError(err: unknown): boolean {
  const status = (err as { status?: unknown } | null)?.status;
  return status === 401 || status === 403;
}
