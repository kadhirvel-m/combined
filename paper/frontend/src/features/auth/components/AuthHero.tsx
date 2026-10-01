"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui";

/** Small rounded label above the headline ("Teacher Portal", "Create your account"). */
export function HeroPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium ring-1 ring-brandlt-300 bg-brandlt-100/70 dark:bg-brand-700/25 text-brand-700 dark:text-white/85">
      {children}
    </span>
  );
}

/** Page headline. Wrap the highlighted words in {@link HeroGradient}. */
export function HeroTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h1 className={cn("text-4xl md:text-5xl font-extrabold tracking-tight leading-tight", className)}>{children}</h1>
  );
}

export function HeroGradient({ children }: { children: ReactNode }) {
  return <span className="gradient-hero-text">{children}</span>;
}

interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
}

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformationLike;
  mozConnection?: NetworkInformationLike;
  webkitConnection?: NetworkInformationLike;
};

/** login.html rule: no autoplay with reduced motion, data saver or a 2G/3G connection. */
function shouldAutoplay(): boolean {
  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nav = navigator as NavigatorWithConnection;
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  const saveData = conn && conn.saveData;
  const slow = conn && /2g|3g/.test(conn.effectiveType || "");
  return !prefersReduced && !saveData && !slow;
}

export interface HeroVideoProps {
  /** Video file, e.g. `/assets/video/login.mp4`. */
  src: string;
  /**
   * Load the file only when it will play (login page): right away when
   * autoplay is appropriate, otherwise on the first click.
   */
  lazy?: boolean;
  /** Fallback text for browsers without <video>. */
  fallback?: ReactNode;
  /** Centre the frame in its column (all pages except teacher signup). */
  centered?: boolean;
}

/** The rounded looping video card under the headline. */
export function HeroVideo({ src, lazy, fallback, centered = true }: HeroVideoProps) {
  const video = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [autoplay, setAutoplay] = useState(false);

  useEffect(() => {
    if (!lazy) return;
    const auto = shouldAutoplay();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- depends on browser media/network hints
    setAutoplay(auto);
    if (auto) setLoaded(true);
  }, [lazy]);

  // Once the <source> is in place, (re)load the media and start it if allowed.
  useEffect(() => {
    if (!lazy || !loaded) return;
    const el = video.current;
    if (!el) return;
    el.load();
    if (autoplay) el.play().catch(() => {});
  }, [lazy, loaded, autoplay]);

  return (
    <div
      className={cn(
        "rounded-3xl overflow-hidden bg-white/80 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10 shadow-soft dark:shadow-glow aspect-[16/9] md:aspect-[21/10] max-w-xl md:max-w-lg",
        centered && "mx-auto",
      )}
    >
      {lazy ? (
        <video
          ref={video}
          className="w-full h-full object-cover"
          muted
          loop
          playsInline
          preload="none"
          onClick={loaded ? undefined : () => setLoaded(true)}
        >
          {loaded ? <source src={src} type="video/mp4" /> : null}
          {fallback}
        </video>
      ) : (
        <video className="w-full h-full object-cover" autoPlay muted loop playsInline>
          <source src={src} type="video/mp4" />
          {fallback}
        </video>
      )}
    </div>
  );
}

export interface HeroBullet {
  icon: string;
  text: ReactNode;
  /** Colours of the round icon chip. */
  chipClassName?: string;
}

/** Icon chip colours used by the bullet lists. */
export const CHIP_ORCHID = "bg-brand-500/15 text-brand-500";
export const CHIP_PLUM = "bg-brand-700/15 text-brand-700";

/** Selling points with a round icon chip each. */
export function HeroBullets({ items }: { items: HeroBullet[] }) {
  return (
    <ul className="space-y-3 text-sm text-neutral-600 dark:text-white/65">
      {items.map((item) => (
        <li key={item.icon} className="flex items-start gap-3">
          <span
            className={cn(
              "mt-0.5 inline-flex size-6 items-center justify-center rounded-full",
              item.chipClassName ?? CHIP_ORCHID,
            )}
          >
            <Icon name={item.icon} className="text-base" />
          </span>
          {item.text}
        </li>
      ))}
    </ul>
  );
}

/** Row of small icon + text reassurances under the bullets. */
export function HeroFootnotes({ items }: { items: { icon: string; text: string }[] }) {
  return (
    <div className="flex flex-wrap gap-3 text-sm text-neutral-500 dark:text-white/60">
      {items.map((item) => (
        <span key={item.icon} className="inline-flex items-center gap-1">
          <Icon name={item.icon} className="text-base" />
          {item.text}
        </span>
      ))}
    </div>
  );
}
