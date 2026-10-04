"use client";

import { useRef, useState, type CSSProperties } from "react";
import { Sym, useNotes } from "@/features/notes";
import { shuffled } from "../../lib/tools";
import type { MatchPair } from "../../types";
import styles from "../../medical.module.css";
import { PillBackButton } from "./shared";

const GREEN = "rgba(16,185,129,.85)";
const RED = "rgba(239,68,68,.85)";
const BASE_BG = "color-mix(in oklab, var(--surface) 80%, transparent)";
const MATCHED_BORDER = "color-mix(in oklab, var(--brand) 50%, transparent)";
const COLUMN_LABEL: CSSProperties = { fontSize: ".7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--muted, #888)", padding: "0 .25rem .25rem" };
const ACTION: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: ".4rem",
  border: "1px solid var(--outline)",
  borderRadius: 999,
  padding: ".6rem 1.2rem",
  fontSize: ".85rem",
  fontWeight: 600,
  cursor: "pointer",
  background: "transparent",
  color: "inherit",
  transition: "all .2s",
};

function cardStyle(borderColor: string, background: string, extra: CSSProperties): CSSProperties {
  return {
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor,
    borderRadius: "1rem",
    padding: ".85rem 1rem",
    cursor: "pointer",
    background,
    backdropFilter: "blur(12px)",
    transition: "all .2s cubic-bezier(.4,0,.2,1)",
    position: "relative",
    overflow: "hidden",
    userSelect: "none",
    ...extra,
  };
}

function Connector({ color }: { color: string }) {
  return <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: color, transition: "background .2s", borderRadius: "0 0 1rem 1rem" }} />;
}

/** Match the Following: click a term, then its definition; submit, review, reset. */
export function MatchFollowing({ topic, pairs, onBack }: { topic: string; pairs: MatchPair[]; onBack: () => void }) {
  const { snack } = useNotes();
  const [defs] = useState(() => shuffled(pairs.map((p, i) => ({ ...p, origIdx: i }))));
  const [selected, setSelected] = useState<number | null>(null);
  const [matches, setMatches] = useState<number[]>(() => new Array(pairs.length).fill(-1));
  const [checked, setChecked] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [hoverTerm, setHoverTerm] = useState<number | null>(null);
  const [hoverDef, setHoverDef] = useState<number | null>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const answersRef = useRef<HTMLDivElement>(null);

  const matchDef = (defIdx: number) => {
    if (selected === null) return;
    setMatches((m) => m.map((v, i) => (i === selected ? defIdx : v === defIdx ? -1 : v)));
    setSelected(null);
    submitRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  const check = () => {
    const remaining = matches.filter((m) => m === -1).length;
    if (remaining > 0) {
      snack(`Match ${remaining} more pair(s) first`);
      return;
    }
    setChecked(true);
  };
  const reveal = () => {
    setShowAnswers(true);
    setTimeout(() => answersRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  };
  const reset = () => {
    setSelected(null);
    setMatches(new Array(pairs.length).fill(-1));
    setChecked(false);
    setShowAnswers(false);
  };

  const correct = matches.filter((m, i) => m === i).length;
  const pct = Math.round((correct / pairs.length) * 100);
  const allCorrect = correct === pairs.length;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: ".75rem", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, display: "flex", alignItems: "center", gap: ".5rem", letterSpacing: "-.02em" }}>
          <Sym name="swap_horiz" style={{ color: "var(--brand)", fontSize: "1.4rem" }} />
          Match the Following
        </h2>
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
          <PillBackButton onClick={onBack} padding=".45rem .9rem" fontSize=".78rem" brandHover />
        </div>
      </div>

      <div style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: ".5rem", flexWrap: "wrap" }}>
        <span
          style={{
            background: "var(--brand-soft)",
            color: "var(--brand)",
            border: "1px solid color-mix(in oklab, var(--brand) 30%, transparent)",
            borderRadius: 999,
            padding: ".3rem .75rem",
            fontSize: ".72rem",
            fontWeight: 700,
            letterSpacing: ".03em",
            textTransform: "uppercase",
          }}
        >
          {topic}
        </span>
        <span style={{ fontSize: ".75rem", color: "var(--muted, #888)" }}>Click a term, then click its definition</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
          <div style={COLUMN_LABEL}>Terms</div>
          {pairs.map((p, i) => {
            const ok = matches[i] === i;
            let border = "var(--outline)";
            let bg = BASE_BG;
            let conn = "transparent";
            if (checked) {
              border = ok ? GREEN : RED;
              bg = ok ? "rgba(16,185,129,.08)" : "rgba(239,68,68,.08)";
              conn = border;
            } else if (selected === i) {
              border = "var(--brand)";
              bg = "var(--brand-soft)";
              conn = "var(--brand)";
            } else {
              if (matches[i] !== -1) {
                border = MATCHED_BORDER;
                bg = "var(--brand-soft)";
                conn = "var(--brand)";
              }
              if (hoverTerm === i) bg = "color-mix(in oklab, var(--surface) 65%, transparent)";
            }
            return (
              <div
                key={i}
                style={cardStyle(border, bg, { fontSize: ".88rem", fontWeight: 600, cursor: checked ? "default" : "pointer" })}
                onMouseEnter={() => setHoverTerm(i)}
                onMouseLeave={() => setHoverTerm((h) => (h === i ? null : h))}
                onClick={() => !checked && setSelected(i)}
              >
                <span style={{ position: "absolute", top: ".5rem", right: ".6rem", fontSize: ".65rem", fontWeight: 700, color: "var(--muted, #888)", background: "var(--brand-soft)", borderRadius: 999, padding: ".12rem .4rem" }}>
                  {i + 1}
                </span>
                <span>{p.term}</span>
                <Connector color={conn} />
                {checked ? (
                  <Sym name={ok ? "check_circle" : "cancel"} style={{ position: "absolute", top: ".45rem", left: ".5rem", fontSize: ".9rem", color: ok ? GREEN : RED }} />
                ) : null}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
          <div style={COLUMN_LABEL}>Definitions</div>
          {defs.map((d) => {
            const termIdx = matches.indexOf(d.origIdx);
            const matched = termIdx !== -1;
            const ok = matched && termIdx === d.origIdx;
            let border = "var(--outline)";
            let conn = "transparent";
            let bg = BASE_BG;
            if (checked) {
              border = ok ? GREEN : RED;
              bg = ok ? "rgba(16,185,129,.08)" : "rgba(239,68,68,.08)";
              conn = border;
            } else if (matched) {
              border = MATCHED_BORDER;
              conn = "var(--brand)";
            } else if (hoverDef === d.origIdx && selected !== null) {
              border = "var(--brand)";
            }
            return (
              <div
                key={d.origIdx}
                style={cardStyle(border, bg, { fontSize: ".84rem", lineHeight: 1.45, cursor: checked ? "default" : "pointer" })}
                onMouseEnter={() => setHoverDef(d.origIdx)}
                onMouseLeave={() => setHoverDef((h) => (h === d.origIdx ? null : h))}
                onClick={() => {
                  if (checked) return;
                  if (selected === null) {
                    snack("Select a term first");
                    return;
                  }
                  matchDef(d.origIdx);
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: ".5rem",
                    right: ".6rem",
                    fontSize: ".65rem",
                    fontWeight: 700,
                    color: "#fff",
                    background: checked ? (ok ? GREEN : RED) : "var(--brand)",
                    borderRadius: 999,
                    padding: ".12rem .4rem",
                    display: matched ? "inline-flex" : "none",
                    justifyContent: "center",
                    alignItems: "center",
                    minWidth: "1.25rem",
                    textAlign: "center",
                    zIndex: 10,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {matched ? termIdx + 1 : ""}
                </span>
                <span>{d.definition}</span>
                <Connector color={conn} />
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: ".75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <button
          ref={submitRef}
          type="button"
          className={styles.lift}
          disabled={checked}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: ".4rem",
            background: "linear-gradient(135deg, var(--brand), color-mix(in oklab, var(--brand) 70%, #CA6CB3))",
            color: "#fff",
            border: "none",
            borderRadius: 999,
            padding: ".6rem 1.5rem",
            fontSize: ".85rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 20px color-mix(in oklab, var(--brand) 25%, transparent)",
            transition: "all .2s",
            opacity: checked ? 0.5 : 1,
          }}
          onClick={check}
        >
          <Sym name="check_circle" style={{ fontSize: "1.1rem" }} />
          Submit
        </button>
        {checked ? (
          <button type="button" className={styles.hoverSoft} disabled={showAnswers} style={{ ...ACTION, opacity: showAnswers ? 0.5 : 1 }} onClick={reveal}>
            <Sym name="visibility" style={{ fontSize: "1.1rem" }} />
            Show Correct Ans
          </button>
        ) : null}
        <button type="button" className={styles.hoverSoft} style={ACTION} onClick={reset}>
          <Sym name="refresh" style={{ fontSize: "1.1rem" }} />
          Reset
        </button>
      </div>

      {checked ? (
        <div>
          <div
            style={{
              textAlign: "center",
              padding: "1.5rem",
              border: "1.5px solid var(--outline)",
              borderRadius: "1.25rem",
              background: "color-mix(in oklab, var(--surface) 80%, transparent)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: allCorrect ? "linear-gradient(135deg, rgba(16,185,129,.15), rgba(16,185,129,.05))" : "linear-gradient(135deg, var(--brand-soft), rgba(158,75,138,.03))",
                // `--brand-600` was never defined on these pages: the ring only showed for a perfect score.
                border: `3px solid ${allCorrect ? GREEN : "var(--brand-600)"}`,
                marginBottom: ".75rem",
              }}
            >
              <span style={{ fontSize: "1.5rem", fontWeight: 800, color: allCorrect ? GREEN : "var(--brand-600)" }}>{pct}%</span>
            </div>
            <div style={{ fontSize: "1rem", fontWeight: 700, marginBottom: ".25rem" }}>
              {correct} / {pairs.length} correct
            </div>
            <div style={{ fontSize: ".8rem", color: "var(--muted, #888)" }}>
              {allCorrect ? "🎉 Perfect score! Great job!" : correct >= Math.ceil(pairs.length / 2) ? "👍 Good effort! Try again for a perfect score." : "💪 Keep studying and try again!"}
            </div>
          </div>
        </div>
      ) : null}

      {showAnswers ? (
        <div ref={answersRef}>
          <div style={{ border: "1.5px solid var(--outline)", borderRadius: "1.25rem", padding: "1.25rem", background: "color-mix(in oklab, var(--surface) 85%, transparent)", marginTop: ".75rem" }}>
            <h3 style={{ margin: "0 0 .75rem", fontSize: ".95rem", fontWeight: 700, display: "flex", alignItems: "center", gap: ".4rem" }}>
              <Sym name="check_circle" style={{ color: "rgba(16,185,129,.85)", fontSize: "1.15rem" }} />
              Correct Answers
            </h3>
            {pairs.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "stretch", gap: ".5rem", marginBottom: ".5rem" }}>
                <div style={{ flex: 1, border: "1.5px solid rgba(16,185,129,.4)", borderRadius: ".75rem", padding: ".6rem .8rem", background: "rgba(16,185,129,.06)", fontSize: ".84rem", fontWeight: 600 }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "1.2rem",
                      height: "1.2rem",
                      borderRadius: "50%",
                      background: "var(--brand-soft)",
                      color: "var(--brand)",
                      fontSize: ".6rem",
                      fontWeight: 800,
                      marginRight: ".4rem",
                    }}
                  >
                    {i + 1}
                  </span>{" "}
                  {p.term}
                </div>
                <div style={{ display: "flex", alignItems: "center", color: "var(--brand)" }}>
                  <Sym name="arrow_forward" style={{ fontSize: "1.1rem" }} />
                </div>
                <div style={{ flex: 1.3, border: "1.5px solid rgba(16,185,129,.4)", borderRadius: ".75rem", padding: ".6rem .8rem", background: "rgba(16,185,129,.06)", fontSize: ".82rem", lineHeight: 1.4 }}>
                  {p.definition}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
