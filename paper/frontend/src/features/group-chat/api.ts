/**
 * REST calls of the meeting room page. They go through the shared fetch
 * runtime (cookies, CSRF, refresh) like the original's `fetch` calls did.
 */

import { apiBase, apiRaw } from "@/lib/api";
import type { ProfileResponse, RtcConfigPayload } from "./types";

function bearer(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * The original's `token`: `localStorage.px_token`, which the storage shim
 * reports as the `__COOKIE_AUTH__` sentinel while signed in (the fetch shim
 * strips that placeholder bearer again), or null.
 */
export function readStoredToken(): string | null {
  try {
    return localStorage.getItem("px_token");
  } catch {
    return null;
  }
}

/** `ws://…/ws/group-chat/{room}` on the API origin. */
export function groupChatSocketUrl(roomId: string): string {
  return `${apiBase().replace(/^http/, "ws")}/ws/group-chat/${roomId}`;
}

export type RtcConfigResult =
  | { ok: true; config: RtcConfigPayload | null }
  | { ok: false; status: number; detail: string | null };

/** `GET /api/rtc-config` (no auth header). */
export async function fetchRtcConfig(): Promise<RtcConfigResult> {
  const res = await apiRaw("/api/rtc-config");
  if (!res.ok) {
    let detail: string | null = null;
    if (res.status === 503) {
      try {
        const err = (await res.json()) as { detail?: unknown };
        detail = typeof err?.detail === "string" && err.detail ? err.detail : null;
      } catch {
        detail = null;
      }
    }
    return { ok: false, status: res.status, detail };
  }
  return { ok: true, config: (await res.json()) as RtcConfigPayload | null };
}

/**
 * `GET /api/group-chat/{room}`: true when the call has ended or doesn't
 * exist (400/404 whose detail mentions "ended" / "not found").
 */
export async function isRoomGone(roomId: string, token: string | null): Promise<boolean> {
  const res = await apiRaw(`/api/group-chat/${roomId}`, { headers: bearer(token) });
  if (res.status !== 400 && res.status !== 404) return false;
  const err = (await res.json()) as { detail?: string };
  return !!(err.detail && (err.detail.includes("ended") || err.detail.includes("not found")));
}

/** `GET /api/profile` (only called with a token). Null unless the response is ok. */
export async function fetchProfile(token: string): Promise<ProfileResponse | null> {
  const res = await apiRaw("/api/profile", { headers: bearer(token) });
  if (!res.ok) return null;
  return (await res.json()) as ProfileResponse;
}
