"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { hardNavigate } from "@/lib/routes";
import { useSession } from "@/lib/session";
import { ensureAuthReady, fetchMyProfile, hasRecoverableSession } from "../api";
import type { StudentProfile } from "../types";

export type LoaderState = "visible" | "fading" | "gone";

/**
 * Loads the signed-in student's profile (GET /api/me) like profile.html:
 * redirects to the login page when no session can be restored or on a 401,
 * keeps the status line ("Loading profile…" / error) and the full-screen
 * loader in sync, and shares the profile with the navbar through the session.
 */
export function useMyProfile() {
  const { updateProfile } = useSession();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [status, setStatus] = useState("");
  const [loader, setLoader] = useState<LoaderState>("visible");
  // One initial load per page, also under StrictMode's double-run effects.
  const started = useRef(false);

  const load = useCallback(async () => {
    await ensureAuthReady();
    setStatus("Loading profile…");
    try {
      const result = await fetchMyProfile();
      if (result.status === "unauthorized") {
        try {
          localStorage.removeItem("px_token");
        } catch {}
        hardNavigate("/login.html");
        return;
      }
      setProfile(result.profile);
      updateProfile(result.profile);
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Failed to load profile. Please try again.");
    } finally {
      setLoader((current) => (current === "visible" ? "fading" : current));
    }
  }, [updateProfile]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!hasRecoverableSession()) hardNavigate("/login.html");
    void load();
  }, [load]);

  // The loader fades out, then leaves the page 450ms later.
  useEffect(() => {
    if (loader !== "fading") return;
    const timer = setTimeout(() => setLoader("gone"), 450);
    return () => clearTimeout(timer);
  }, [loader]);

  return { profile, status, loader, reload: load };
}
