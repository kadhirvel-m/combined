"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Status text → minimum progress (setLoaderStatus of the original). */
const STATUS_PROGRESS: Record<string, number> = {
  "Verifying session...": 20,
  "Loading profile and progress...": 50,
  "Loading syllabus...": 80,
  "Loading Blink availability and LabX...": 80,
  "Loading Blink and LabX...": 80,
  "Finalizing dashboard...": 80,
  Ready: 100,
};

export type LoaderPhase = "loading" | "fading" | "gone";

export interface PageLoader {
  status: string;
  width: number;
  transition: string;
  phase: LoaderPhase;
  setStatus: (message: string) => void;
  /** Hide the overlay: `ok` fills the bar first (gone after 450ms), failure hides it after 250ms. */
  complete: (ok: boolean) => void;
}

/**
 * The full-screen loader's progress bar: 20% on the first frame, 50% at 420ms,
 * 80% at 980ms, then a slow creep to 98% until the data is ready.
 */
export function usePageLoader(): PageLoader {
  const [status, setStatusText] = useState("Initializing...");
  const [bar, setBar] = useState({ width: 0, transition: "width 0.3s ease" });
  const [phase, setPhase] = useState<LoaderPhase>("loading");
  const current = useRef(0);
  const finished = useRef(false);
  const slowInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const setWidth = useCallback((pct: number, transition: string) => {
    current.current = Math.min(pct, 100);
    setBar({ width: current.current, transition });
  }, []);

  const startSlow = useCallback(() => {
    if (finished.current || slowInterval.current) return;
    slowInterval.current = setInterval(() => {
      if (finished.current) return;
      const now = current.current;
      let next: number;
      if (now < 90) next = Math.min(90, now + 0.8);
      else if (now < 95) next = Math.min(95, now + 0.35);
      else if (now < 98) next = Math.min(98, now + 0.12);
      else return;
      setWidth(next, "width 0.28s linear");
    }, 220);
  }, [setWidth]);

  const set = useCallback(
    (pct: number) => {
      if (finished.current) return;
      const target = Math.max(0, Math.min(Number(pct) || 0, 80));
      if (target <= current.current) return; // only go forward
      setWidth(target, target <= 20 ? "width 0.28s ease-out" : target <= 50 ? "width 0.55s ease-out" : "width 0.75s ease-out");
      if (target >= 80) startSlow();
    },
    [setWidth, startSlow],
  );

  useEffect(() => {
    const raf = requestAnimationFrame(() => set(20));
    const list = timers.current;
    list.push(setTimeout(() => set(50), 420), setTimeout(() => set(80), 980), setTimeout(startSlow, 1060));
    return () => {
      cancelAnimationFrame(raf);
      list.forEach(clearTimeout);
      list.length = 0;
      if (slowInterval.current) clearInterval(slowInterval.current);
      slowInterval.current = null;
    };
  }, [set, startSlow]);

  const setStatus = useCallback(
    (message: string) => {
      setStatusText(message || "Loading...");
      const target = STATUS_PROGRESS[message];
      if (target !== undefined) set(target);
    },
    [set],
  );

  const complete = useCallback(
    (ok: boolean) => {
      if (ok && !finished.current) {
        finished.current = true;
        if (slowInterval.current) clearInterval(slowInterval.current);
        slowInterval.current = null;
        setWidth(100, "width 0.3s ease");
      }
      setPhase((p) => (p === "loading" ? "fading" : p));
      timers.current.push(setTimeout(() => setPhase("gone"), ok ? 450 : 250));
    },
    [setWidth],
  );

  return { status, width: bar.width, transition: bar.transition, phase, setStatus, complete };
}
