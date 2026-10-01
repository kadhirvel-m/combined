/**
 * Backend calls made by the authentication pages.
 *
 * Every function returns the raw `Response` (through `apiRaw`, i.e. the shared
 * runtime's patched `fetch`), because each page reads the status and body in
 * its own way and shows its own messages. Endpoints, methods, headers and
 * bodies are exactly the ones the original pages sent.
 */

import { apiRaw } from "@/lib/api";
import type { CredentialsPayload } from "./types";

/** `POST /login` with `{ email, password, turnstile_token }`. */
export function postLogin(payload: CredentialsPayload): Promise<Response> {
  return apiRaw("/login", { method: "POST", json: payload });
}

/** `POST /signup` with `{ email, password, turnstile_token }`. */
export function postSignup(payload: CredentialsPayload): Promise<Response> {
  return apiRaw("/signup", { method: "POST", json: payload });
}

/** `POST /refresh`: exchanges an OAuth refresh token for first-party cookies. */
export function postRefresh(refreshToken: string): Promise<Response> {
  return apiRaw("/refresh", { method: "POST", json: { refresh_token: refreshToken } });
}

/** `GET /api/me`, optionally with an explicit bearer token (cookie-less fallback). */
export function getMe(bearer?: string): Promise<Response> {
  return apiRaw("/api/me", bearer ? { headers: { Authorization: `Bearer ${bearer}` } } : {});
}

/** `GET /api/public/supabase` → `{ url, anonKey }`. */
export function getSupabaseConfig(): Promise<Response> {
  return apiRaw("/api/public/supabase");
}

/** `GET /api/teacher/me/status` → `{ role, status }`. */
export function getTeacherStatus(bearer?: string): Promise<Response> {
  return apiRaw("/api/teacher/me/status", bearer ? { headers: { Authorization: "Bearer " + bearer } } : {});
}

/** `GET /api/hod/me`: 2xx means the account has HOD access. */
export function getHodMe(bearer: string): Promise<Response> {
  return apiRaw("/api/hod/me", { headers: { Authorization: "Bearer " + bearer } });
}

/** `GET /api/public/academic-meta` → colleges, degrees, departments. */
export function getAcademicMeta(): Promise<Response> {
  return apiRaw("/api/public/academic-meta");
}

/** `POST /api/teacher/signup` (multipart form with the ID-card images). */
export function postTeacherSignup(form: FormData): Promise<Response> {
  return apiRaw("/api/teacher/signup", { method: "POST", body: form });
}
