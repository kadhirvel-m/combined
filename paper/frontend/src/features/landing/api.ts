import { api, apiRaw } from "@/lib/api";
import type { LeaderboardEntry, LeaderboardResponse, RoleProfile, SupabasePublicConfig, TeacherStatusResponse } from "./types";

/** Each role probe is abandoned after this long, like the original page. */
const ROLE_PROBE_TIMEOUT_MS = 2200;

type Wrapped<K extends string> = Partial<Record<K | "profile", RoleProfile | null>> & RoleProfile;

/** Warm the shared refresh flow so the first protected call does not 401. */
export async function ensureAuthReady(): Promise<void> {
  if (typeof window.__PX_ENSURE_AUTH_READY !== "function") return;
  try {
    await window.__PX_ENSURE_AUTH_READY();
  } catch {
    /* same as the original: a failed warm-up is not fatal */
  }
}

/** A role probe: 2xx JSON body, or `null` for any HTTP / network / timeout failure. */
async function probe<T>(path: string): Promise<T | null> {
  try {
    const res = await apiRaw(path, { timeoutMs: ROLE_PROBE_TIMEOUT_MS });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Lower-cased role from `/api/teacher/me/status` ("teacher", "hod", …) or "". */
export async function fetchStaffRole(): Promise<string> {
  const data = await probe<TeacherStatusResponse>("/api/teacher/me/status");
  return String(data?.role || "")
    .trim()
    .toLowerCase();
}

/** True when `/api/me` answers 2xx (a cookie session without local markers). */
export async function hasStudentSession(): Promise<boolean> {
  try {
    const res = await apiRaw("/api/me", { timeoutMs: ROLE_PROBE_TIMEOUT_MS });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchTeacherProfile(): Promise<RoleProfile | null> {
  const data = await probe<Wrapped<"teacher">>("/api/teacher/profile/me");
  return data?.teacher || data?.profile || data || null;
}

export async function fetchHodProfile(): Promise<RoleProfile | null> {
  const data = await probe<Wrapped<"hod">>("/api/hod/me");
  return data?.hod || data?.profile || data || null;
}

/** Top current streaks for the Hall of Flame podium. */
export async function fetchTopStreaks(limit = 3): Promise<LeaderboardEntry[]> {
  const res = await apiRaw("/api/leaderboard", { query: { limit } });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  const data = (await res.json()) as LeaderboardResponse;
  return (data.leaderboard || []).slice(0, limit);
}

export function fetchSupabaseConfig(): Promise<SupabasePublicConfig | null> {
  return api.get<SupabasePublicConfig | null>("/api/public/supabase");
}
