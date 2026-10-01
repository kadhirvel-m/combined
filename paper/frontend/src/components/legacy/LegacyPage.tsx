import type { ReactNode } from "react";
import { StaticIsland } from "./StaticIsland";
import { serializeForInlineScript } from "./serialize";

/** Raw HTML attributes, keyed by their HTML (not React) names, e.g. `class`. */
export type RawAttributes = Readonly<Record<string, string>>;

export interface LegacyPageProps {
  /** Attributes of the original page's `<html>` element. */
  html?: RawAttributes;
  /** Attributes of the original page's `<body>` element. */
  body?: RawAttributes;
  /**
   * Hoistable head elements (`<meta>`, icons, preconnects, …). React hoists
   * these into `<head>`; stylesheets and scripts belong in `children` so their
   * original cascade and execution order is preserved.
   */
  head?: ReactNode;
  /** The original `<head>` stylesheets/scripts followed by the `<body>` content. */
  children: ReactNode;
}

/**
 * Document shell for a page converted from the legacy `ui/` folder.
 *
 * The first thing inside the island is a tiny inline script that copies the
 * original `<html>`/`<body>` attributes onto the shared root layout before
 * anything paints (see `boot.ts`).
 *
 * Deliberately no <Suspense> here: React streams large completed boundaries
 * out of order (inside a hidden <div>, moved into place later), which would
 * run the page scripts against detached, invisible markup. Without a boundary
 * the island is part of the shell and is emitted inline, in document order.
 */
export function LegacyPage({ html, body, head, children }: LegacyPageProps) {
  const boot = `__pxBoot(${serializeForInlineScript({ html: html ?? {}, body: body ?? {} })});`;
  return (
    <>
      {head}
      <StaticIsland>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        {children}
      </StaticIsland>
    </>
  );
}
