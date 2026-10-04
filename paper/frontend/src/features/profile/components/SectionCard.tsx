import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { AppLink } from "@/components/site/AppLink";
import { Glyph } from "./Glyph";

/** Frosted panel used for every profile section and list item. */
export const panel = "rounded-2xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-brand-900/55 backdrop-blur";

/** Brand chip (skills, technologies, project stack, attachments). */
export const chip = "inline-flex items-center px-3 py-1 rounded-full text-xs text-brand-700 dark:text-brand-200 bg-brand-500/10";

export interface SectionCardProps {
  icon: string;
  title: ReactNode;
  /** `profile_edit.html#…` anchor for the "Manage" link. */
  manageHref?: string;
  /** Heading bottom margin when there is no Manage link (`mb-4` lists, `mb-2` text cards). */
  headingGap?: "mb-2" | "mb-4";
  className?: string;
  children: ReactNode;
}

/** A titled profile section ("Basic Info", "Experience", "Summary"…). */
export function SectionCard({ icon, title, manageHref, headingGap = "mb-2", className, children }: SectionCardProps) {
  const heading = (
    <h3 className={cn("font-semibold flex items-center gap-2", !manageHref && headingGap)}>
      <Glyph name={icon} />
      {title}
    </h3>
  );
  return (
    <section className={cn(panel, "p-5", className)}>
      {manageHref ? (
        <div className="flex items-center justify-between">
          {heading}
          <AppLink href={manageHref} className="text-xs text-brand-600 dark:text-brand-300">
            Manage
          </AppLink>
        </div>
      ) : (
        heading
      )}
      {children}
    </section>
  );
}

/** "Add your … to showcase …" hint shown when a list is empty. */
export function EmptyHint({ children }: { children: ReactNode }) {
  return <p className="text-sm text-black/50 dark:text-white/50 mt-2">{children}</p>;
}

/** Plain text body of an About/Activity card. */
export function CardText({ children }: { children: ReactNode }) {
  return <p className="text-sm opacity-80">{children}</p>;
}
