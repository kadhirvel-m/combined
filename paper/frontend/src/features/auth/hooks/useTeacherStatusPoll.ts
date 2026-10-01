"use client";

import { useEffect, useRef } from "react";
import { getTeacherStatus } from "../api";
import { readTeacherToken } from "../lib/session-storage";
import type { TeacherStatusResponse } from "../types";

/**
 * teacher_signup.html `pollStatus`: while the browser looks signed in as a
 * teacher (`localStorage.teacherToken`, answered by the storage shim), check
 * the application status every 6 s until it is approved with the teacher role.
 * A non-2xx answer stops polling; network errors keep it going.
 */
export function useTeacherStatusPoll(onStatus: (text: string) => void): void {
  const onStatusRef = useRef(onStatus);
  useEffect(() => {
    onStatusRef.current = onStatus;
  });

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function poll() {
      const token = readTeacherToken();
      if (!token) return;
      try {
        const res = await getTeacherStatus(token);
        if (!res.ok) return;
        const data = (await res.json()) as TeacherStatusResponse;
        if (cancelled) return;
        if (data.status) {
          let text = "Status: " + data.status + (data.role === "teacher" ? " (role assigned)" : "");
          if (data.status === "approved" && data.role === "teacher") {
            text += " You can now access Teacher Connect & Notes.";
            onStatusRef.current(text);
            return; // stop polling
          }
          onStatusRef.current(text);
        }
      } catch {
        /* ignore */
      }
      if (!cancelled) timer = setTimeout(poll, 6000);
    }
    void poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);
}
