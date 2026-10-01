import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { SiteHeader, type SiteHeaderProps } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

/** Page chrome shared by the marketing pages (About, Contact…). */
export function MarketingShell({
  announcement,
  announcementLabel,
  header,
  className,
  children,
}: {
  announcement?: ReactNode;
  /** Pill text in the announcement bar (default "New"). */
  announcementLabel?: ReactNode;
  /** Props for the shared navbar (links, position…). */
  header?: SiteHeaderProps;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("min-h-screen overflow-x-hidden bg-hero-light dark:bg-hero-dark transition-colors", className)}>
      {announcement ? <AnnouncementBar label={announcementLabel}>{announcement}</AnnouncementBar> : null}
      <SiteHeader {...header} />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

/** Extra-bold headline with the animated brand gradient. */
export function GradientHeading({
  as: Tag = "h2",
  className,
  children,
}: {
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  children: ReactNode;
}) {
  return (
    // `md:text-4xl` re-applies the 2.5rem line-height from md up, as on the original pages.
    <Tag className={cn("text-4xl md:text-4xl font-extrabold tracking-tight leading-[1.08] gradient-hero-text", className)}>{children}</Tag>
  );
}

/** Centered section header: gradient title + muted subtitle. */
export function SectionIntro({
  title,
  subtitle,
  className,
  subtitleClassName,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  subtitleClassName?: string;
}) {
  return (
    <header className={cn("text-center mb-12", className)}>
      <GradientHeading>{title}</GradientHeading>
      {subtitle ? <p className={cn("mt-3 text-neutral-600 dark:text-white/70 max-w-3xl mx-auto", subtitleClassName)}>{subtitle}</p> : null}
    </header>
  );
}

/** Soft blurred colour blobs behind a hero. */
export function GlowOrbs({ variant = "hero" }: { variant?: "hero" | "cta" }) {
  if (variant === "cta") {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-20 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(158,75,138,0.35),transparent_70%)] blur-3xl" />
        <div className="absolute -bottom-40 -right-10 w-[460px] h-[460px] rounded-full bg-[radial-gradient(circle_at_center,rgba(76,42,89,0.55),transparent_70%)] blur-3xl" />
      </div>
    );
  }
  return (
    <>
      <div className="pointer-events-none absolute -top-24 -right-24 size-[420px] rounded-full bg-brand-500/20 blur-3xl dark:blur-[90px]" />
      <div className="pointer-events-none absolute top-24 -left-24 size-[360px] rounded-full bg-brand-700/20 blur-3xl dark:blur-[90px]" />
    </>
  );
}

/** Looping, muted product clip in a rounded frame. */
export function VideoFrame({ src, align = "right", className }: { src: string; align?: "left" | "right"; className?: string }) {
  return (
    <div className={cn("w-full", align === "right" ? "justify-self-end" : "justify-self-start", className)}>
      <div
        className={cn(
          "rounded-3xl overflow-hidden bg-white/80 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10 shadow-soft dark:shadow-glow aspect-[16/9] md:aspect-[21/10] max-w-xl md:max-w-lg",
          align === "right" ? "ml-auto" : "mr-auto",
        )}
      >
        <video className="w-full h-full object-cover" autoPlay muted loop playsInline>
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}

/** Two-column row: copy on one side, media on the other (alternating). */
export function FeatureRow({
  title,
  body,
  media,
  reverse,
  className,
}: {
  title: ReactNode;
  body: ReactNode;
  media: ReactNode;
  reverse?: boolean;
  className?: string;
}) {
  const copy = (
    <div className={reverse ? "order-first lg:order-last" : undefined}>
      <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">{title}</h3>
      <p className="mt-3 text-neutral-600 dark:text-white/70">{body}</p>
    </div>
  );
  // Reversed rows put the media first in the DOM (as the original markup did).
  return (
    <div className={cn("grid lg:grid-cols-2 gap-10 items-center", className)}>
      {reverse ? (
        <>
          <div className="order-last lg:order-first">{media}</div>
          {copy}
        </>
      ) : (
        <>
          {copy}
          <div>{media}</div>
        </>
      )}
    </div>
  );
}

/** Small card with a tinted icon tile, title and text. */
export function IconCard({ icon, title, children, className }: { icon: string; title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <article className={cn("rounded-2xl p-6 ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-white/5 hover:shadow-glow transition", className)}>
      <div className="size-10 grid place-content-center rounded-xl bg-brand-500/15 text-brand-500 dark:text-brand-400 mb-4">
        <Icon name={icon} />
      </div>
      <h3 className="font-semibold text-neutral-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">{children}</p>
    </article>
  );
}

/** Card with a 16:9 image on top. */
export function ImageCard({ src, alt, title, children }: { src: string; alt: string; title: ReactNode; children: ReactNode }) {
  return (
    <article className="rounded-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-white/5 hover:shadow-glow transition flex flex-col">
      {/* eslint-disable-next-line @next/next/no-img-element -- static illustration */}
      <img className="aspect-[16/9] object-cover" src={src} alt={alt} />
      <div className="p-6">
        <h3 className="font-semibold text-neutral-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">{children}</p>
      </div>
    </article>
  );
}
