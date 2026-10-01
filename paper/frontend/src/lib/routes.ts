import { legacyRoutes } from "@/generated/legacy-routes";

/**
 * Which URLs are rendered by React (src/app/(site)) and which are still legacy
 * pages. Client-side navigation is only safe between React pages; links into a
 * legacy page must be full page loads.
 */
const reactPaths = new Set<string>();
for (const page of legacyRoutes) {
  if (page.react) {
    reactPaths.add(page.legacyPath);
    reactPaths.add(page.route);
  }
}

function pathnameOf(href: string): string | null {
  if (!href.startsWith("/")) return null;
  const end = href.search(/[?#]/);
  return end === -1 ? href : href.slice(0, end);
}

/** True when `href` (an absolute path like `/profile.html?x=1`) is a React page. */
export function isReactRoute(href: string): boolean {
  const path = pathnameOf(href);
  return path !== null && reactPaths.has(path);
}

/**
 * Full-page navigation (what `location.href = "x.html"` did on the original
 * pages). Use it for redirects that must leave the current page entirely, e.g.
 * to the login page; it works for React and legacy targets alike.
 */
export function hardNavigate(href: string): void {
  window.location.assign(href);
}
