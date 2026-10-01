"use client";

import { use, type ReactNode } from "react";

/**
 * A promise that never settles. Suspending on it during hydration keeps the
 * surrounding <Suspense> boundary "dehydrated" forever, so React leaves the
 * server-rendered DOM exactly as the browser parsed it and never reconciles it.
 */
const NEVER: Promise<never> = new Promise<never>(() => {});

/**
 * Server-renders its children, then opts them out of hydration.
 *
 * Converted pages are driven by their original imperative scripts (DOM
 * mutation, innerHTML, Alpine.js, CodeMirror, Chart.js, …). Those scripts are
 * emitted as real <script> tags inside this island, so the browser executes
 * them natively while parsing — in the original order, with the original
 * DOMContentLoaded/defer/module semantics — and React never fights them over
 * the DOM.
 */
export function StaticIsland({ children }: { children: ReactNode }) {
  if (typeof window !== "undefined") {
    use(NEVER);
  }
  return children;
}
