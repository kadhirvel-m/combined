"use client";

import { Fragment, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { RippleButton, Sym } from "@/features/notes";
import styles from "../../medical.module.css";

export const outline: CSSProperties = { borderColor: "var(--outline)" };

/** The originals' gradient call-to-action button. */
export const BRAND_BUTTON: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: ".35rem",
  border: "none",
  borderRadius: 999,
  padding: ".55rem 1.05rem",
  background: "linear-gradient(135deg, var(--brand), var(--brand-strong, #4C2A59))",
  color: "#fff",
  fontSize: ".82rem",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 8px 24px rgba(158,75,138,.3)",
  transition: "transform .18s",
};

/** "Back to Notes" pill of the ClinQ / Blink views (Tailwind classes, ripple). */
export function RippleBackButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <RippleButton
      className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold hover:bg-[var(--brand-soft)] transition", className)}
      style={outline}
      onClick={onClick}
    >
      <Sym name="arrow_back" /> Back to Notes
    </RippleButton>
  );
}

/** "Back to Notes" pill of the CaseFlow / Viva / MedMap / Match views (inline styles, hover tint). */
export function PillBackButton({
  onClick,
  padding = ".45rem .95rem",
  fontSize = ".8rem",
  label = "Back to Notes",
  brandHover,
}: {
  onClick: () => void;
  padding?: string;
  fontSize?: string;
  label?: string;
  /** Match the Following also tinted the border. */
  brandHover?: boolean;
}) {
  return (
    <button
      type="button"
      className={brandHover ? styles.hoverSoftBrand : styles.hoverSoft}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: ".35rem",
        border: "1px solid var(--outline)",
        borderRadius: 999,
        padding,
        fontSize,
        fontWeight: 600,
        cursor: "pointer",
        background: "transparent",
        color: "inherit",
        transition: "all .2s",
      }}
      onClick={onClick}
    >
      <Sym name="arrow_back" style={{ fontSize: "1rem" }} />
      {label}
    </button>
  );
}

/** Topic chip next to the CaseFlow / Viva titles. */
export function TopicChip({ topic }: { topic: string }) {
  return (
    <span
      style={{
        border: "1px solid var(--outline)",
        borderRadius: 999,
        padding: ".3rem .7rem",
        fontSize: ".72rem",
        background: "var(--brand-soft)",
        color: "var(--brand)",
        fontWeight: 700,
      }}
    >
      {topic}
    </span>
  );
}

/** Text with its line breaks kept (the originals turned `\n` into `<br/>`). */
export function MultilineText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 ? <br /> : null}
          {line}
        </Fragment>
      ))}
    </>
  );
}

export interface ChatBubble {
  id: number;
  role: "user" | "assistant";
  content: ReactNode;
  meta?: string;
}

/** One chat message of CaseFlow / Viva. */
export function Bubble({ bubble, name, maxWidth, padding }: { bubble: ChatBubble; name: string; maxWidth: string; padding: string }) {
  const isUser = bubble.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
      <div
        style={{
          maxWidth,
          border: "1px solid var(--outline)",
          borderRadius: ".9rem",
          padding,
          background: isUser ? "linear-gradient(135deg, rgba(158,75,138,.2), rgba(76,42,89,.12))" : "color-mix(in oklab, var(--surface) 85%, transparent)",
          fontSize: ".88rem",
          lineHeight: 1.45,
        }}
      >
        <div style={{ fontSize: ".68rem", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 700, color: "var(--muted)", marginBottom: ".35rem" }}>
          {isUser ? "You" : name}
        </div>
        <div>{bubble.content}</div>
        {bubble.meta ? <div style={{ marginTop: ".45rem", fontSize: ".7rem", color: "var(--muted)" }}>{bubble.meta}</div> : null}
      </div>
    </div>
  );
}

/** Uppercase field label of the tool panels. */
export const FIELD_LABEL: CSSProperties = { fontSize: ".74rem", textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 700, color: "var(--muted)" };
