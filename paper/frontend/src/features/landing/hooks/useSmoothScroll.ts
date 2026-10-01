"use client";

import { useEffect } from "react";

/**
 * Smooth in-page anchor scrolling while the page is mounted (the original had
 * `<html class="scroll-smooth">`). `data-scroll-behavior` tells Next.js to keep
 * route transitions instant.
 */
export function useSmoothScroll(): void {
  useEffect(() => {
    const root = document.documentElement;
    const hadAttr = root.hasAttribute("data-scroll-behavior");
    root.classList.add("scroll-smooth");
    if (!hadAttr) root.setAttribute("data-scroll-behavior", "smooth");
    return () => {
      root.classList.remove("scroll-smooth");
      if (!hadAttr) root.removeAttribute("data-scroll-behavior");
    };
  }, []);
}
