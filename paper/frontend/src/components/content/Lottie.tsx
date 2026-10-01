"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { cn } from "@/lib/cn";

/** Lottie / dotLottie animation (replaces the `<dotlottie-wc>` web component). */
export function Lottie({
  src,
  className,
  loop = true,
  autoplay = true,
  speed,
}: {
  src: string;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
}) {
  return <DotLottieReact src={src} loop={loop} autoplay={autoplay} speed={speed} className={cn("block", className)} />;
}
