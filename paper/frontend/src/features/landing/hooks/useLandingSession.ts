"use client";

import { useEffect, useState } from "react";
import { useSession, type SessionProfile } from "@/lib/session";
import { ensureAuthReady, fetchHodProfile, fetchStaffRole, fetchTeacherProfile, hasStudentSession } from "../api";
import type { LandingSessionState, RoleProfile } from "../types";

/** Stored in place of a token when the session lives in HttpOnly cookies. */
const AUTH_SENTINEL = "__COOKIE_AUTH__";

function readToken(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Works out who is looking at the landing page (port of the original
 * `toggleLandingCtasForSession`): local token markers first, then the role
 * endpoints for cookie sessions whose role is unknown.
 */
export async function resolveLandingSession(): Promise<LandingSessionState> {
  let teacherProfile: RoleProfile | null = null;
  let hodProfile: RoleProfile | null = null;
  try {
    const teacherToken = readToken("teacherToken");
    const userToken = readToken("px_token");
    let isTeacher = !!teacherToken && teacherToken !== AUTH_SENTINEL;
    let isStudent = !!userToken && userToken !== AUTH_SENTINEL;
    let isHod = false;
    // A sentinel means cookie auth is active but the role is unknown: assume
    // student and let the status probe correct it.
    const hasCookieAuth = teacherToken === AUTH_SENTINEL || userToken === AUTH_SENTINEL;
    if (hasCookieAuth && !isTeacher && !isStudent) isStudent = true;

    await ensureAuthReady();

    if (!isTeacher && isStudent) {
      const role = await fetchStaffRole();
      if (role === "teacher") {
        isTeacher = true;
        isStudent = false;
      } else if (role === "hod") {
        isHod = true;
      }
    }

    if (!isTeacher && !isStudent) isStudent = await hasStudentSession();
    if (isTeacher) teacherProfile = await fetchTeacherProfile();
    if (isHod) hodProfile = await fetchHodProfile();

    const cta = isTeacher ? "teacher" : isHod ? "hod" : isStudent ? "student" : "signed-out";
    return { cta, teacherProfile, hodProfile };
  } catch {
    return { cta: "signed-out", teacherProfile: null, hodProfile: null };
  }
}

let inflight: Promise<LandingSessionState> | null = null;

/**
 * One resolution per page view. React's dev double-mount would otherwise run
 * the probes twice, and the shared auth warm-up can clear the cookie-session
 * marker between the two runs, so the second run would see no session.
 */
function resolveOnce(): Promise<LandingSessionState> {
  if (!inflight) {
    inflight = resolveLandingSession().finally(() => {
      setTimeout(() => {
        inflight = null;
      }, 0);
    });
  }
  return inflight;
}

/** What the original pushed into the navbar through `__PX_NAV_APPLY`. */
function teacherNavProfile(p: RoleProfile): SessionProfile {
  return {
    name: p.name || p.full_name || p.username || "Teacher",
    profile_image_url: p.profile_image_url || p.logo_url || p.avatar_url || "",
    logo_url: p.logo_url || "",
    avatar_url: p.avatar_url || "",
  };
}

function hodNavProfile(p: RoleProfile | null): SessionProfile {
  return {
    name: p?.name || p?.full_name || p?.username || "HOD",
    profile_image_url: p?.profile_image_url || p?.avatar_url || p?.logo_url || "",
    logo_url: p?.logo_url || p?.profile_image_url || "",
    avatar_url: p?.avatar_url || p?.profile_image_url || p?.logo_url || "",
  };
}

/**
 * Session state for the landing page. Starts as `loading`, then resolves to
 * the CTA to show; teacher / HOD identities are also pushed to the shared
 * session so the navbar avatar shows the right person.
 */
export function useLandingSession(): LandingSessionState {
  const [state, setState] = useState<LandingSessionState>({ cta: "loading", teacherProfile: null, hodProfile: null });
  const { updateProfile } = useSession();

  useEffect(() => {
    let cancelled = false;
    void resolveOnce().then((next) => {
      if (cancelled) return;
      setState(next);
      if (next.cta === "teacher" && next.teacherProfile) updateProfile(teacherNavProfile(next.teacherProfile));
      else if (next.cta === "hod") updateProfile(hodNavProfile(next.hodProfile));
    });
    return () => {
      cancelled = true;
    };
  }, [updateProfile]);

  return state;
}
