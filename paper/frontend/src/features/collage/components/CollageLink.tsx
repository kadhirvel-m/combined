"use client";

import type { MouseEvent } from "react";
import { AppLink, type AppLinkProps } from "@/components/site/AppLink";
import { mergeStoredContext, sanitizeCollageHref } from "../lib/context";

/**
 * A link between collage pages with helpers.js' anchor sanitizer applied: a
 * target inside the collage folder loses its query string, and the params are
 * stored in the collage context when the link is clicked. Every other href is
 * rendered as given (see `COLLAGE_PATH_MARKER`).
 */
export function CollageLink({ href, onClick, ...rest }: AppLinkProps) {
  const target = sanitizeCollageHref(href);
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (target.context) mergeStoredContext(target.context);
    onClick?.(e);
  };
  return <AppLink href={target.href} onClick={handleClick} {...rest} />;
}
