"use client";

import { useEffect, useState } from "react";
import { hardNavigate } from "@/lib/routes";
import { studentToken, type ListResult } from "./api";

/**
 * Loads a signed-in list once on mount. Without a student session (or on a
 * 401) it sends the visitor to the login page, like the original pages.
 */
export function useSignedInList<T>(load: () => Promise<ListResult<T>>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  // False after a failed load: the original then showed neither items nor the empty state.
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!studentToken()) {
      hardNavigate("/login.html");
      return;
    }
    load().then((result) => {
      if (cancelled) return;
      if (result.status === "unauthorized") {
        hardNavigate("/login.html");
        return;
      }
      if (result.status === "ok") {
        setItems(result.items);
        setLoaded(true);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  return { items, setItems, loading, loaded };
}
