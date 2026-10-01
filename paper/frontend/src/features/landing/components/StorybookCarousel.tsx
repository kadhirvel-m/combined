"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { STORYBOOK_SLIDES, type Slide } from "../data";

/** Fraction of the slide width a drag must cover to change slide. */
const SWIPE_THRESHOLD = 0.2;

const arrow =
  "absolute top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur flex items-center justify-center ring-1 ring-black/10 dark:ring-white/20 hover:scale-110 transition opacity-0 group-hover:opacity-100 cursor-pointer select-none";

/**
 * The "Storybook" slides: arrows, dot indicators, pointer drag / swipe and
 * Left / Right arrow keys. It wraps around and does not autoplay.
 */
export function StorybookCarousel({ slides = STORYBOOK_SLIDES }: { slides?: Slide[] }) {
  const count = slides.length;
  const [index, setIndex] = useState(0);
  /** Drag distance as a percentage of the slide width; `null` when not dragging. */
  const [dragPercent, setDragPercent] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);

  const step = useCallback((delta: number) => setIndex((current) => (current + delta + count) % count), [count]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") step(-1);
      else if (event.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [step]);

  // The drag is tracked on the window so it continues outside the carousel.
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (dragStartX.current === null) return;
      const width = wrapperRef.current?.clientWidth || 1;
      setDragPercent(((event.clientX - dragStartX.current) / width) * 100);
    };
    const end = (event: PointerEvent, commit: boolean) => {
      if (dragStartX.current === null) return;
      const diff = event.clientX - dragStartX.current;
      const threshold = (wrapperRef.current?.clientWidth ?? 0) * SWIPE_THRESHOLD;
      dragStartX.current = null;
      setDragPercent(null);
      if (!commit) return;
      if (diff > threshold) step(-1);
      else if (diff < -threshold) step(1);
    };
    const onUp = (event: PointerEvent) => end(event, true);
    const onCancel = (event: PointerEvent) => end(event, false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, [step]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragStartX.current = event.clientX;
    setDragPercent(0);
  };

  const dragging = dragPercent !== null;

  return (
    <div className="relative group">
      <div className="relative aspect-[16/9] overflow-hidden bg-black">
        <div
          ref={wrapperRef}
          onPointerDown={onPointerDown}
          className="flex transition-transform duration-500 ease-out h-full will-change-transform"
          style={{
            transform: `translateX(${-index * 100 + (dragPercent ?? 0)}%)`,
            transition: dragging ? "none" : undefined,
          }}
        >
          {slides.map((slide, i) => (
            <div key={slide.src} className="min-w-full w-full shrink-0 h-full relative select-none">
              {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size local artwork, same loading as the original */}
              <img
                src={slide.src}
                alt={slide.alt}
                className="w-full h-full object-contain pointer-events-none"
                loading={i === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
      </div>

      <button type="button" aria-label="Previous slide" onClick={() => step(-1)} className={cn(arrow, "left-4")}>
        <Icon name="chevron_left" className="text-brand-900 dark:text-white" />
      </button>
      <button type="button" aria-label="Next slide" onClick={() => step(1)} className={cn(arrow, "right-4")}>
        <Icon name="chevron_right" className="text-brand-900 dark:text-white" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
            onClick={() => setIndex(i)}
            className={cn(
              "size-2 rounded-full cursor-pointer select-none transition-all duration-300 ease-[ease]",
              i === index ? "bg-white/90 scale-[1.3]" : "bg-white/50",
            )}
          />
        ))}
      </div>
    </div>
  );
}
