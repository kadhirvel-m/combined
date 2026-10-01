import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type HeadingTag = "h1" | "h2" | "h3";

/** Heading with the animated Paper X gradient text (`gradient-hero-text`). */
export function GradientHeading({
  as: Tag = "h2",
  className,
  children,
}: {
  as?: HeadingTag;
  /** Size / spacing utilities; the section-heading defaults are replaced when given. */
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={cn(
        "gradient-hero-text font-extrabold tracking-tight",
        className ?? "text-4xl md:text-4xl mx-auto max-w-5xl leading-[1.08]",
      )}
    >
      {children}
    </Tag>
  );
}

/** Centered section header: gradient heading + one-line description. */
export function SectionHeader({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <header className="text-center mb-12">
      <GradientHeading>{title}</GradientHeading>
      <p className="mt-3 text-neutral-600 dark:text-white/70">{children}</p>
    </header>
  );
}
