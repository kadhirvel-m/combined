import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { GlowOrbs } from "./components";

export interface CtaBandProps {
  title: ReactNode;
  body: ReactNode;
  actions: ReactNode;
  /** Blurred colour blobs behind the band. */
  glow?: boolean;
  bodyClassName?: string;
}

/** Closing call-to-action band. */
export function CtaBand({ title, body, actions, glow, bodyClassName }: CtaBandProps) {
  return (
    <section className="relative py-16 md:py-20">
      {glow ? <GlowOrbs variant="cta" /> : null}
      <div className="container relative max-w-5xl text-center">
        <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">{title}</h3>
        <p className={cn("mt-3 text-neutral-600", bodyClassName)}>{body}</p>
        <div className="mt-6 flex items-center justify-center gap-3">{actions}</div>
      </div>
    </section>
  );
}
