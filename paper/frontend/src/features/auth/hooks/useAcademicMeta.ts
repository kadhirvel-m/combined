"use client";

import { useEffect, useState } from "react";
import { getAcademicMeta } from "../api";
import type { AcademicMeta } from "../types";

const EMPTY: AcademicMeta = { colleges: [], degrees: [], departments: [] };

/**
 * Colleges, degrees and departments for the teacher application pickers
 * (`GET /api/public/academic-meta`). `onError` receives the failure text the
 * original page showed in its status box.
 */
export function useAcademicMeta(onError: (message: string) => void): AcademicMeta {
  const [meta, setMeta] = useState<AcademicMeta>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let data: AcademicMeta;
      try {
        const res = await getAcademicMeta();
        if (!res.ok) {
          const txt = await res.text().catch(() => "<no body>");
          throw new Error("Failed to load academic metadata (" + res.status + "): " + txt.substring(0, 140));
        }
        data = (await res.json()) as AcademicMeta;
      } catch (e) {
        console.warn("Academic load failed", e);
        if (!cancelled) {
          onError(
            "Academic metadata load failed. Please ensure backend API (:8000) is running. " +
              ((e instanceof Error && e.message) || ""),
          );
        }
        return;
      }
      if (!cancelled) setMeta(data ?? EMPTY);
    })();
    return () => {
      cancelled = true;
    };
    // Load once; `onError` is a state setter wrapper from the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return meta;
}
