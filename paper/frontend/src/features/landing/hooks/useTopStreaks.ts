"use client";

import { useEffect, useState } from "react";
import { ensureAuthReady, fetchTopStreaks } from "../api";
import type { LeaderboardEntry } from "../types";

export type TopStreaksState =
  | { status: "loading" }
  | { status: "ready"; entries: LeaderboardEntry[] }
  | { status: "error" };

/** Loads the top `limit` streak holders for the Hall of Flame. */
export function useTopStreaks(limit = 3): TopStreaksState {
  const [state, setState] = useState<TopStreaksState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensureAuthReady();
        const entries = await fetchTopStreaks(limit);
        if (!cancelled) setState({ status: "ready", entries });
      } catch (err) {
        if (cancelled) return;
        console.error("Hall of Flame Error:", err);
        setState({ status: "error" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return state;
}
