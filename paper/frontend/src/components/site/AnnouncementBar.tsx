import type { ReactNode } from "react";
import { AppLink } from "./AppLink";

/** Thin "New · …  →" strip shown above the navbar on marketing pages. */
export function AnnouncementBar({ children, href, label = "New" }: { children: ReactNode; href?: string; label?: ReactNode }) {
  const body = (
    <div className="container flex items-center gap-2 py-2">
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-brandlt-200 dark:bg-brand-500/20 ring-1 ring-brandlt-300 dark:ring-brand-500/40">
        {label}
      </span>
      <p className="truncate">{children}</p>
      <span className="ml-auto">→</span>
    </div>
  );
  return (
    <div className="w-full text-xs text-neutral-700 dark:text-white/80 bg-brandlt-100/70 dark:bg-brand-700/20 backdrop-blur border-b border-black/5 dark:border-white/10">
      {href ? (
        <AppLink href={href} className="block">
          {body}
        </AppLink>
      ) : (
        body
      )}
    </div>
  );
}
