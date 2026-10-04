"use client";

import { useEffect } from "react";
import { cn } from "@/lib/cn";
import styles from "../medical.module.css";
import { useMedical } from "./MedicalProvider";

/** notes_chat: the cited source chunk of a "RAG CITATIONS" entry. */
export function RagChunkModal() {
  const { ragChunk, closeRagChunk } = useMedical();
  useEffect(() => {
    if (!ragChunk) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRagChunk();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ragChunk, closeRagChunk]);
  if (!ragChunk) return null;
  const { label, data } = ragChunk;
  const text = String(data.chunk_text || "").trim();
  const subtitle = `${data.section_title ? `${data.section_title} • ` : ""}Chunk ${data.chunk_index ?? "-"}${typeof data.similarity === "number" ? ` • score ${Number(data.similarity).toFixed(3)}` : ""}`;
  return (
    <div
      className={styles.ragBackdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeRagChunk();
      }}
    >
      <div className={styles.ragCard} role="dialog" aria-modal="true" aria-labelledby="ragChunkModalTitle">
        <div className={styles.ragHead}>
          <div>
            <h3 id="ragChunkModalTitle" className={styles.ragTitle}>
              {label} • {data.source_name || "Source"}
            </h3>
            <div className={styles.ragSubtitle}>{subtitle}</div>
          </div>
          <button type="button" className={styles.ragClose} onClick={closeRagChunk}>
            Close
          </button>
        </div>
        <div className={cn(styles.ragBody, !text && styles.ragEmpty)}>{text || "Chunk text is unavailable for this citation."}</div>
      </div>
    </div>
  );
}
