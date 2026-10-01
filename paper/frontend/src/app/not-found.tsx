import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found — Paper X",
};

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        background: "#FAF5FB",
        color: "#1E1E2F",
        textAlign: "center",
        padding: "1rem",
      }}
    >
      <div>
        <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#9E4B8A", letterSpacing: "0.08em" }}>404</p>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: "0.5rem 0" }}>This page could not be found.</h1>
        <p style={{ opacity: 0.7, marginBottom: "1.5rem" }}>The link may be broken, or the page may have moved.</p>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- full navigation into the legacy pages */}
        <a href="/index.html" style={{ color: "#4C2A59", fontWeight: 600 }}>
          Go to the home page
        </a>
      </div>
    </main>
  );
}
