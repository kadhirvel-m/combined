"use client";

/**
 * Session state for React pages — the React equivalent of the legacy navbar
 * helper (`auth.js`, `src/runtime/auth/nav-auth.ts`). It reads the same
 * storage keys and cookies, so a user signed in on any page is signed in here.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiRaw } from "./api";

const AUTH_SENTINEL = "__COOKIE_AUTH__";
const BEARER_FALLBACK_KEY = "paperx_bearer_fallback";
const REFRESH_TOKEN_KEY = "px_refresh_token";

export type SessionKind = "student" | "teacher";
export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

/** Profile fields the UI reads (the backend returns more; extra fields are kept). */
export interface SessionProfile {
  id?: string;
  name?: string | null;
  full_name?: string | null;
  username?: string | null;
  email?: string | null;
  logo_url?: string | null;
  profile_image_url?: string | null;
  avatar_url?: string | null;
  [key: string]: unknown;
}

export interface SessionValue {
  status: SessionStatus;
  kind: SessionKind | null;
  profile: SessionProfile | null;
  /** Display name with the same fallbacks the navbar used. */
  displayName: string;
  initials: string;
  avatarUrl: string | null;
  /** Link to the signed-in user's profile page. */
  profileHref: string;
  /** Merge fresh profile data (e.g. after the profile page loads or saves it). */
  updateProfile: (patch: SessionProfile) => void;
  /** Re-read the session from the backend. */
  reload: () => Promise<void>;
  /** POST /logout, clear local auth markers and go to the right login page. */
  signOut: () => Promise<void>;
}

function read(storage: Storage | undefined, key: string): string {
  try {
    return String(storage?.getItem(key) || "").trim();
  } catch {
    return "";
  }
}

function hasAuthStateCookie(): boolean {
  try {
    return document.cookie.includes("paperx_auth=");
  } catch {
    return false;
  }
}

function hasAuthState(): boolean {
  return read(localStorage, "paperx_session_state") === "1" || hasAuthStateCookie();
}

function usable(token: string): string | null {
  return token && token !== AUTH_SENTINEL && token !== "null" && token !== "undefined" ? token : null;
}

/** Same precedence as auth.js `activeSession()`. */
export function detectSession(): { kind: SessionKind | null; token: string | null } {
  const teacher = usable(read(localStorage, "teacherToken"));
  const user = usable(read(localStorage, "px_token"));
  if (teacher) return { kind: "teacher", token: teacher };
  if (user) return { kind: "student", token: user };
  const fallback = usable(read(sessionStorage, BEARER_FALLBACK_KEY)) || usable(read(localStorage, BEARER_FALLBACK_KEY));
  if (fallback) return { kind: "student", token: fallback };
  if (hasAuthState()) return { kind: "student", token: AUTH_SENTINEL };
  return { kind: null, token: null };
}

export function clearAuthMarkers(): void {
  for (const key of ["px_token", "teacherToken", REFRESH_TOKEN_KEY, "px_token_expires_at", "paperx_session_state", "paperx_session_id"]) {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
  for (const key of [REFRESH_TOKEN_KEY, BEARER_FALLBACK_KEY]) {
    try {
      sessionStorage.removeItem(key);
    } catch {}
  }
  try {
    localStorage.removeItem(BEARER_FALLBACK_KEY);
  } catch {}
}

export function initialsOf(name: string | null | undefined): string {
  if (!name) return "ME";
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "ME"
  );
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [kind, setKind] = useState<SessionKind | null>(null);
  const [profile, setProfile] = useState<SessionProfile | null>(null);

  const reload = useCallback(async () => {
    const hasRefresh = !!usable(read(sessionStorage, REFRESH_TOKEN_KEY));
    if ((hasRefresh || hasAuthState()) && typeof window.__PX_ENSURE_AUTH_READY === "function") {
      await window.__PX_ENSURE_AUTH_READY().catch(() => false);
    }
    const session = detectSession();
    if (!session.token) {
      setKind(null);
      setProfile(null);
      setStatus("unauthenticated");
      return;
    }
    setKind(session.kind);
    setStatus("authenticated");
    try {
      const headers: Record<string, string> = {};
      if (session.token !== AUTH_SENTINEL) headers.Authorization = `Bearer ${session.token}`;
      const res = await apiRaw(session.kind === "teacher" ? "/api/teacher/profile/me" : "/api/me", { headers });
      if (res.status === 401) {
        if (hasAuthState()) return; // transient refresh race — keep the session UI
        setStatus("unauthenticated");
        setKind(null);
        setProfile(null);
        return;
      }
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown> | null;
      const next = (session.kind === "teacher"
        ? (data?.teacher ?? data?.profile ?? data)
        : (data?.profile ?? data)) as SessionProfile | null;
      setProfile((prev) => ({ ...(prev ?? {}), ...(next ?? {}) }));
    } catch {
      /* network errors keep the optimistic state, like auth.js */
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial session probe
    void reload();
  }, [reload]);

  const updateProfile = useCallback((patch: SessionProfile) => {
    setProfile((prev) => ({ ...(prev ?? {}), ...patch }));
  }, []);

  const signOut = useCallback(async () => {
    const path = location.pathname.toLowerCase();
    const teacherSurface = kind === "teacher" || path.includes("/teachers/") || path.includes("teacher_");
    await apiRaw("/logout", { method: "POST" }).catch(() => null);
    clearAuthMarkers();
    window.location.href = teacherSurface ? "/teachers/teacher_login.html" : "/login.html";
  }, [kind]);

  const value = useMemo<SessionValue>(() => {
    const name = String(profile?.name || profile?.full_name || profile?.username || "");
    return {
      status,
      kind,
      profile,
      displayName: String(profile?.name || profile?.full_name || "Profile"),
      initials: initialsOf(name),
      avatarUrl: (profile?.logo_url || profile?.profile_image_url || profile?.avatar_url || null) as string | null,
      profileHref: kind === "teacher" ? "/teacher_profile.html?user=me" : "/profile.html",
      updateProfile,
      reload,
      signOut,
    };
  }, [status, kind, profile, updateProfile, reload, signOut]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}
