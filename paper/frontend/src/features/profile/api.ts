import { apiRaw } from "@/lib/api";
import type {
  CollegeDetail,
  CollegeOption,
  DeviceSession,
  DeviceSignOutRequest,
  EducationEntry,
  EducationEntryInput,
  MeResponse,
  ProfileAssetKind,
  ProfileUpdatePayload,
  StudentProfile,
} from "./types";

const AUTH_SENTINEL = "__COOKIE_AUTH__";

function readLocal(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function readSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function bearerFallback(): string {
  return (readSession("paperx_bearer_fallback") || readLocal("paperx_bearer_fallback") || "").trim();
}

/**
 * Same as the original `buildAuthHeaders()`: a real `px_token` wins, then the
 * in-tab bearer fallback. (Through the storage shim `px_token` reads as the
 * cookie sentinel, so in practice only the fallback is ever sent.)
 */
export function profileAuthHeaders(): Record<string, string> {
  const current = readLocal("px_token");
  if (current && current !== AUTH_SENTINEL) return { Authorization: `Bearer ${current}` };
  const fallback = bearerFallback();
  return fallback ? { Authorization: `Bearer ${fallback}` } : {};
}

/**
 * The profile page's sign-in gate: it only redirects when nothing at all
 * could restore a session (no token, refresh token, auth cookie, session
 * marker or bearer fallback).
 */
export function hasRecoverableSession(): boolean {
  const token = readLocal("px_token");
  const refresh = readLocal("px_refresh_token");
  const marker = readLocal("paperx_session_state");
  let cookie = false;
  try {
    cookie = document.cookie.indexOf("paperx_auth=") !== -1;
  } catch {}
  return Boolean(token || refresh || cookie || marker === "1" || bearerFallback());
}

/** Drops every local auth marker (after signing this device out). */
export function clearLocalAuth(): void {
  for (const key of ["px_token", "px_refresh_token", "paperx_session_state", "paperx_bearer_fallback"]) {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
  for (const key of ["paperx_bearer_fallback", "px_refresh_token"]) {
    try {
      sessionStorage.removeItem(key);
    } catch {}
  }
}

/** Waits for the shared runtime's token refresh, like the original `ensureAuthReady()`. */
export async function ensureAuthReady(): Promise<void> {
  try {
    if (typeof window.__PX_ENSURE_AUTH_READY === "function") await window.__PX_ENSURE_AUTH_READY();
  } catch {}
}

export type MeResult = { status: "ok"; profile: StudentProfile } | { status: "unauthorized" };

/**
 * GET /api/me. Any non-401 response with a JSON body counts as loaded (the
 * original rendered `data.profile || {}`); network or parse errors throw.
 */
export async function fetchMyProfile(): Promise<MeResult> {
  const res = await apiRaw("/api/me");
  if (res.status === 401) return { status: "unauthorized" };
  const data = (await res.json()) as MeResponse | null;
  return { status: "ok", profile: data?.profile || {} };
}

/** Thrown when a device request comes back 401; `next` asks to return here. */
export class SignedOutError extends Error {
  readonly withNext: boolean;
  constructor(withNext: boolean) {
    super("Signed out");
    this.withNext = withNext;
  }
}

async function jsonOrEmpty(res: Response): Promise<Record<string, unknown>> {
  return ((await res.json().catch(() => ({}))) || {}) as Record<string, unknown>;
}

function detailOf(body: Record<string, unknown>, fallback: string): string {
  return typeof body.detail === "string" && body.detail ? body.detail : fallback;
}

/** GET /api/me/devices */
export async function fetchDevices(): Promise<DeviceSession[]> {
  const res = await apiRaw("/api/me/devices", { headers: profileAuthHeaders() });
  if (res.status === 401) throw new SignedOutError(true);
  const out = await jsonOrEmpty(res);
  if (!res.ok) throw new Error(detailOf(out, "Failed to load devices"));
  return Array.isArray(out.devices) ? (out.devices as DeviceSession[]) : [];
}

/** POST /api/me/devices/signout. Returns the response body (`current` is true when this device was signed out). */
export async function signOutDeviceSessions(request: DeviceSignOutRequest, failure: string): Promise<{ current?: boolean }> {
  const res = await apiRaw("/api/me/devices/signout", {
    method: "POST",
    headers: profileAuthHeaders(),
    json: request,
  });
  const out = await jsonOrEmpty(res);
  if (res.status === 401) throw new SignedOutError(false);
  if (!res.ok) throw new Error(detailOf(out, failure));
  return out as { current?: boolean };
}

let collegesCache: CollegeOption[] = [];
let collegesPromise: Promise<CollegeOption[]> | null = null;
const collegeDetailCache = new Map<string, CollegeDetail | null>();

/** GET /api/colleges, cached for the page's lifetime (failures resolve to []). */
export function fetchColleges(): Promise<CollegeOption[]> {
  if (collegesCache.length) return Promise.resolve(collegesCache);
  if (!collegesPromise) {
    collegesPromise = apiRaw("/api/colleges", { headers: profileAuthHeaders() })
      .then((res) => (res.ok ? res.json() : []))
      .catch((err: unknown) => {
        console.error("Failed to load colleges", err);
        return [];
      })
      .then((items: unknown) => {
        collegesCache = Array.isArray(items)
          ? (items as Array<{ id?: unknown; name?: unknown } | null>)
              .filter((col): col is { id: unknown; name: string } => Boolean(col && col.id && col.name))
              .map((col) => ({ id: String(col.id), name: String(col.name) }))
          : [];
        return collegesCache;
      });
  }
  return collegesPromise;
}

/** GET /api/colleges/{id} (degrees → departments → batches), cached; null on failure. */
export async function fetchCollegeDetail(collegeId: string): Promise<CollegeDetail | null> {
  const key = String(collegeId);
  if (collegeDetailCache.has(key)) return collegeDetailCache.get(key) ?? null;
  try {
    const res = await apiRaw(`/api/colleges/${key}`, { headers: profileAuthHeaders() });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = (await res.json()) as CollegeDetail;
    collegeDetailCache.set(key, data);
    return data;
  } catch (err) {
    console.error("Failed to load college details", err);
    collegeDetailCache.set(key, null);
    return null;
  }
}

/** Full PUT /api/profile/me body from a profile snapshot (original `__pxBuildProfileUpdatePayload`). */
export function buildProfileUpdatePayload(
  profile: StudentProfile,
  educationEntries: (EducationEntryInput | EducationEntry)[],
): ProfileUpdatePayload {
  const specializations = Array.isArray(profile.specializations)
    ? profile.specializations
    : profile.specializations
      ? String(profile.specializations)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  return {
    name: profile.name || null,
    phone: profile.phone || null,
    headline: profile.headline || null,
    location: profile.location || null,
    dob: profile.dob || null,
    bio: profile.bio || null,
    linkedin: profile.linkedin || null,
    github: profile.github || null,
    leetcode: profile.leetcode || null,
    portfolio_url: profile.portfolio_url || null,
    website: profile.website || null,
    twitter: profile.twitter || null,
    instagram: profile.instagram || null,
    medium: profile.medium || null,
    specializations,
    technologies: profile.technologies || null,
    skills: profile.skills || null,
    certifications: profile.certifications || null,
    languages: profile.languages || null,
    interests: profile.interests || null,
    achievements: profile.achievements || null,
    experience: profile.experience || null,
    publications: profile.publications || null,
    project_info: profile.project_info || null,
    experiences: Array.isArray(profile.experiences) ? profile.experiences : [],
    education_entries: educationEntries,
    certification_entries: Array.isArray(profile.certification_entries) ? profile.certification_entries : [],
    portfolio_projects: Array.isArray(profile.portfolio_projects) ? profile.portfolio_projects : [],
    publication_entries: Array.isArray(profile.publication_entries) ? profile.publication_entries : [],
  };
}

/** PUT /api/profile/me. Resolves with `error` set to the backend's detail when it fails. */
export async function saveProfile(payload: ProfileUpdatePayload, failure: string): Promise<{ error: string | null }> {
  const res = await apiRaw("/api/profile/me", { method: "PUT", headers: profileAuthHeaders(), json: payload });
  const out = await jsonOrEmpty(res);
  return { error: res.ok ? null : detailOf(out, failure) };
}

/* ---------------------------------------------------------------------------
 * profile_edit.html
 * ------------------------------------------------------------------------- */

export type EditableProfileResult = { status: "ok"; profile: StudentProfile | null } | { status: "unauthorized" };

/**
 * The editor's profile load (original `fetchProfileData()`): GET
 * /api/profile/me, falling back to GET /api/me (`profile` or the whole body)
 * when it fails with anything but 401. A body that is not JSON on the fallback
 * resolves to null (nothing is filled in); network errors throw.
 */
export async function fetchEditableProfile(): Promise<EditableProfileResult> {
  let res = await apiRaw("/api/profile/me", { headers: profileAuthHeaders() });
  if (res.status === 401) return { status: "unauthorized" };
  if (res.ok) return { status: "ok", profile: (await res.json()) as StudentProfile };
  res = await apiRaw("/api/me", { headers: profileAuthHeaders() });
  if (res.status === 401) return { status: "unauthorized" };
  const data = (await res.json().catch(() => null)) as MeResponse | null;
  return { status: "ok", profile: (data && data.profile ? data.profile : data) as StudentProfile | null };
}

/** Response of the editor's raw requests: `out` is the JSON body or `{}`. */
export interface RawResult {
  ok: boolean;
  out: Record<string, unknown>;
}

/** POST /api/profile/upload (multipart `kind` + `file`). */
export async function uploadProfileAsset(kind: ProfileAssetKind, file: File): Promise<RawResult> {
  const body = new FormData();
  body.append("kind", kind);
  body.append("file", file);
  const res = await apiRaw("/api/profile/upload", { method: "POST", headers: profileAuthHeaders(), body });
  return { ok: res.ok, out: await jsonOrEmpty(res) };
}

/** PUT /api/profile/me with the editor's full payload. */
export async function putProfile(payload: ProfileUpdatePayload): Promise<RawResult> {
  const res = await apiRaw("/api/profile/me", { method: "PUT", headers: profileAuthHeaders(), json: payload });
  return { ok: res.ok, out: await jsonOrEmpty(res) };
}
