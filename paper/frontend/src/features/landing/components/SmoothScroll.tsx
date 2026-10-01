"use client";

import { useSmoothScroll } from "../hooks/useSmoothScroll";

/** Enables smooth anchor scrolling for the page it is rendered on. */
export function SmoothScroll() {
  useSmoothScroll();
  return null;
}
