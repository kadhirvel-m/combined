"use client";

import { useState } from "react";
import { Sym } from "@/features/notes";
import { buildEmbedUrl } from "../../lib/tools";
import styles from "../../medical.module.css";
import { PillBackButton, RippleBackButton } from "./shared";

/** MedMap: the topic's presentation in an embedded viewer. */
export function MedMap({ topic, link, onBack }: { topic: string; link: string; onBack: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: ".75rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, display: "flex", alignItems: "center", gap: ".5rem" }}>
          {/* `--brand-600` is not defined on the page, so the icon inherits the heading colour (as before). */}
          <Sym name="slideshow" style={{ color: "var(--brand-600)", fontSize: "1.3rem" }} />
          MedMap — {topic}
        </h2>
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
          <PillBackButton onClick={onBack} padding=".4rem .9rem" />
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.hoverSoft}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: ".35rem",
              border: "1px solid var(--outline)",
              borderRadius: 999,
              padding: ".4rem .9rem",
              fontSize: ".8rem",
              fontWeight: 600,
              textDecoration: "none",
              color: "inherit",
              transition: "background .15s",
            }}
          >
            <Sym name="open_in_new" style={{ fontSize: "1rem" }} />
            Open
          </a>
        </div>
      </div>
      <div style={{ border: "1px solid var(--outline)", borderRadius: "1rem", overflow: "hidden", background: "var(--surface)", minHeight: 500 }}>
        <iframe title={`MedMap — ${topic}`} src={buildEmbedUrl(link)} style={{ width: "100%", height: "70vh", minHeight: 500, border: "none" }} allowFullScreen loading="lazy" />
      </div>
    </div>
  );
}

/** Blink: the topic's visual summary image. */
export function Blink({ topic, url, onBack }: { topic: string; url: string; onBack: () => void }) {
  const [failed, setFailed] = useState(false);
  return (
    <div style={{ textAlign: "center", padding: "1rem 0" }}>
      {failed ? (
        <p style={{ color: "var(--muted)", padding: "2rem" }}>Failed to load Blink image.</p>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>Blink — {topic}</h2>
            <RippleBackButton onClick={onBack} />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- remote Blink image */}
          <img
            src={url}
            alt={`Blink — ${topic}`}
            style={{ maxWidth: "100%", borderRadius: "1rem", border: "1px solid var(--outline)", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
            onError={() => setFailed(true)}
          />
        </>
      )}
    </div>
  );
}
