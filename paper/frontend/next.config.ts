import type { NextConfig } from "next";
import { legacyRoutes } from "./src/generated/legacy-routes";

/**
 * URL compatibility with the original static ui/ site:
 *
 *  - Every page keeps its original `.html` URL (`/collage/clg_info.html`). The
 *    pages' own links, `location.href = "x.html"` calls and backend-generated
 *    links all use these, and relative URLs inside the pages resolve against
 *    them exactly as before. Each is rewritten to its App Router route.
 *  - Folder index pages (`/tunex/index.html`) must keep the `.html` URL so that
 *    relative links resolve inside the folder, so `/tunex` redirects there.
 *  - The FastAPI backend used to mount the UI under `/ui/`; those links redirect.
 */
const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/ui", destination: "/", permanent: false },
      { source: "/ui/:path*", destination: "/:path*", permanent: false },
      ...legacyRoutes
        .filter((page) => page.directoryIndex && page.route !== "/")
        .map((page) => ({ source: page.route, destination: page.legacyPath, permanent: false })),
    ];
  },
  async rewrites() {
    return legacyRoutes.map((page) => ({ source: page.legacyPath, destination: page.route }));
  },
  async headers() {
    // Same caching policy the FastAPI static mount used for /assets.
    return [
      {
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, immutable" }],
      },
    ];
  },
};

export default nextConfig;
