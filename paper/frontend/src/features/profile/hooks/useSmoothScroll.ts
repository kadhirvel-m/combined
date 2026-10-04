"use client";

import { useEffect } from "react";

/**
 * Smooth scrolling while the page is mounted (the original had
 * `<html class="scroll-smooth">`). `data-scroll-behavior` tells Next.js to keep
 * route transitions instant. Local copy of the landing feature's hook.
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
