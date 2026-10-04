"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getStreak, pingStreak } from "../api";
import { getToken } from "../lib/auth";
import { wait } from "../lib/topics";
import type { StreakData } from "../types";

const MAX_RETRIES = 3;

/** GET /api/streak (retried on 5xx / network errors), then a fire-and-forget POST /api/streak/ping. */
export function useStreak() {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const load = useCallback(
    () =>
      fetchStreak(0, (data) => {
        if (alive.current) setStreak(data);
      }),
    [],
  );

  return { streak, load };
}

/** One attempt (recursing on retryable failures). */
async function fetchStreak(retryCount: number, onData: (data: StreakData) => void): Promise<void> {
  if (!getToken()) {
    console.log("[Streak] No token, skipping");
    return;
  }
  try {
    const res = await getStreak();
    if (!res.ok) {
      console.warn("[Streak] API error:", res.status);
      if (retryCount < MAX_RETRIES && (res.status >= 500 || res.status === 0)) {
        await wait(500 * (retryCount + 1));
        return fetchStreak(retryCount + 1, onData);
      }
      return;
    }
    const data = (await res.json()) as StreakData;
    onData(data);
    void pingStreak();
  } catch (err) {
    console.error("[Streak] Fetch error:", err);
    if (retryCount < MAX_RETRIES) {
      await wait(500 * (retryCount + 1));
      return fetchStreak(retryCount + 1, onData);
    }
  }
}
