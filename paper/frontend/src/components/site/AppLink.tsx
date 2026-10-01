import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";
import { isReactRoute } from "@/lib/routes";

export interface AppLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Absolute site path (`/profile.html`, `/tunex/index.html?x=1`), in-page
   * anchor (`#pricing`) or external URL. Use the original `.html` URLs.
   */
  href: string;
  /** Opt out of Next.js prefetching for heavy pages. */
  prefetch?: boolean;
}

/**
 * Internal link. React pages are reached with client-side navigation
 * (`next/link`); links into legacy pages, external URLs and anchors are plain
 * `<a>` elements so they do a full page load, as those pages require.
 */
export function AppLink({ href, prefetch, children, ...rest }: AppLinkProps) {
  if (isReactRoute(href) && !rest.target && !rest.download) {
    return (
      <Link href={href} prefetch={prefetch} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
