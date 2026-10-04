"use client";

import { useEffect, useState } from "react";
import { parseQuery, type CollageContext } from "../lib/context";

/**
 * Runs `parseQuery()` once after mount — merges the URL's query params into
 * `sessionStorage.collage_ctx_v1` and scrubs them from the address bar — and
 * returns the merged context. `null` until then (server render and first
 * client render), so markup stays hydration-safe.
 */
export function useCollageContext(): CollageContext | null {
  const [ctx, setCtx] = useState<CollageContext | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads sessionStorage/location, browser-only
    setCtx(parseQuery());
  }, []);
  return ctx;
}
