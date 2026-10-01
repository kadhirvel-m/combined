"use client";

import { useEffect, useRef, useState } from "react";
import { RESOURCE_LOGOS, type ResourceLogo } from "../data";
import styles from "../landing.module.css";

/** Copies rendered before the viewport has been measured (server render). */
const INITIAL_COPIES = 4;
const RESIZE_DEBOUNCE_MS = 150;

function LogoItem({ logo, hidden }: { logo: ResourceLogo; hidden: boolean }) {
  return (
    <div role="listitem" aria-hidden={hidden || undefined} className="flex items-center gap-3 shrink-0">
      <div className="size-12 rounded-xl bg-white dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10 grid place-content-center p-1">
        {/* eslint-disable-next-line @next/next/no-img-element -- third-party logos on arbitrary hosts */}
        <img
          src={logo.src}
          alt={logo.name}
          className={`h-8 w-auto object-contain ${logo.imgClassName ?? ""}`}
          // Copies reuse the cached first set; lazy copies can stay unloaded mid-scroll.
          loading={hidden ? undefined : "lazy"}
        />
      </div>
      <span className="text-sm font-medium text-neutral-600 dark:text-white/70">{logo.name}</span>
    </div>
  );
}

/**
 * Endless horizontal logo strip. The logo set is repeated enough times to
 * cover twice the viewport and the track is shifted by one set width per
 * loop, so the motion is seamless. Hovering pauses it.
 */
export function LogoTicker({
  logos = RESOURCE_LOGOS,
  speed = 60,
  label = "Scrolling list of resource logos",
}: {
  logos?: ResourceLogo[];
  /** Pixels per second. */
  speed?: number;
  label?: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(INITIAL_COPIES);
  const paused = useRef(false);
  const offset = useRef(0);
  /** Width of one logo set including its trailing gap (the loop length). */
  const period = useRef(0);

  // Measure one set and repeat it until the track is at least 2× the viewport.
  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const measure = () => {
      const first = track.children[0] as HTMLElement | undefined;
      const nextSet = track.children[logos.length] as HTMLElement | undefined;
      if (!first || !nextSet) return;
      const setWidth = nextSet.offsetLeft - first.offsetLeft;
      if (setWidth <= 0) return;
      period.current = setWidth;
      setCopies(Math.max(2, Math.ceil((viewport.clientWidth * 2) / setWidth)));
    };
    measure();

    let timer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        offset.current = 0;
        track.style.transform = "translateX(0)";
        measure();
      }, RESIZE_DEBOUNCE_MS);
    };
    window.addEventListener("resize", onResize);
    // Logo images load lazily and change the set width once they arrive.
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, [logos.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    let last = 0;
    const tick = (ts: number) => {
      if (!last) last = ts;
      const dt = (ts - last) / 1000;
      last = ts;
      if (!paused.current) {
        offset.current += speed * dt;
        if (period.current > 0) offset.current %= period.current;
        track.style.transform = `translateX(${-offset.current}px)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [speed]);

  return (
    <div
      ref={viewportRef}
      aria-label={label}
      className={`relative group ${styles.logoMask}`}
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        paused.current = false;
      }}
    >
      <div ref={trackRef} role="list" className={styles.logoTrack}>
        {Array.from({ length: copies }, (_, copy) =>
          logos.map((logo) => <LogoItem key={`${copy}-${logo.name}`} logo={logo} hidden={copy > 0} />),
        )}
      </div>
    </div>
  );
}
