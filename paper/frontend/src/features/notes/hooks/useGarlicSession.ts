"use client";

import { useCallback, useEffect, useRef } from "react";
import { notesApi } from "../api";
import { getAuthToken } from "../lib/authToken";

declare global {
  interface Window {
    /** GARLIC V3: lets external code register the active study session (kept from the original page). */
    __garlicSetSession?: (sessionId: string) => void;
  }
}

/**
 * GARLIC V3 session auto-close: while a study session is registered, counts
 * visible seconds and reports them with `sendBeacon` when the tab is hidden or
 * closed (`POST /api/garlic/v3/session/auto-close`).
 */
export function useGarlicSession(enabled: boolean): (sessionId: string) => void {
  const session = useRef<{ id: string | null; activeSeconds: number; closed: boolean }>({ id: null, activeSeconds: 0, closed: false });

  const setSession = useCallback((sessionId: string) => {
    session.current = { id: sessionId, activeSeconds: 0, closed: false };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const tick = setInterval(() => {
      const s = session.current;
      if (s.id && !s.closed && document.visibilityState === "visible") s.activeSeconds += 10;
    }, 10000);

    const close = () => {
      const s = session.current;
      if (!s.id || s.closed) return;
      s.closed = true;
      const token = getAuthToken("full");
      if (!token) return;
      const payload = JSON.stringify({ session_id: s.id, active_seconds: s.activeSeconds, completion_percent: null });
      const url = notesApi.garlicAutoCloseUrl();
      try {
        navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
      } catch {
        try {
          // Last resort on browsers without sendBeacon: a synchronous request during unload.
          const xhr = new XMLHttpRequest();
          xhr.open("POST", url, false);
          xhr.setRequestHeader("Content-Type", "application/json");
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          xhr.send(payload);
        } catch {
          /* nothing else to try */
        }
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") close();
    };

    window.__garlicSetSession = setSession;
    window.addEventListener("pagehide", close);
    window.addEventListener("beforeunload", close);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(tick);
      if (window.__garlicSetSession === setSession) delete window.__garlicSetSession;
      window.removeEventListener("pagehide", close);
      window.removeEventListener("beforeunload", close);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, setSession]);

  return setSession;
}
