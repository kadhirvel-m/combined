"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { RippleButton, useNotes } from "@/features/notes";
import { medicalApi } from "../../api";
import type { McqQuestion } from "../../types";
import { outline, RippleBackButton } from "./shared";

const GREEN_BORDER = "rgba(16,185,129,.65)";
const GREEN_BG = "rgba(16,185,129,.22)";
const RED_BORDER = "rgba(239,68,68,.60)";
const RED_BG = "rgba(239,68,68,.18)";
const CARD: CSSProperties = { border: "1px solid var(--outline)", borderRadius: "1rem", padding: "1.25rem", background: "color-mix(in oklab, var(--surface) 85%, transparent)" };
const TOOL_BTN = "px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-[var(--brand-soft)] transition";

type Phase = { state: "loading" } | { state: "error"; message: string } | { state: "quiz"; title: string };

/** ClinQ: the inline MCQ test (`POST /notes/{id}/mcq`, 10 questions) shown in place of the notes. */
export function ClinqQuiz({ noteId, topic, onBack }: { noteId: string; topic: string; onBack: () => void }) {
  const { snack } = useNotes();
  const [phase, setPhase] = useState<Phase>({ state: "loading" });
  const [questions, setQuestions] = useState<McqQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selections, setSelections] = useState<(number | null)[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [bar, setBar] = useState(0);
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    (async () => {
      try {
        const res = await medicalApi.mcq(noteId, topic);
        if (!res.ok) throw new Error((res.data && (res.data.detail || res.data.error)) || `HTTP ${res.status}`);
        const list = Array.isArray(res.data?.questions) ? res.data.questions : [];
        if (!list.length) throw new Error("No questions generated.");
        setQuestions(list);
        setSelections(new Array(list.length).fill(null));
        setPhase({ state: "quiz", title: res.data?.topic || topic || "MCQ Test" });
      } catch (err) {
        console.error("[MCQ]", err);
        setPhase({ state: "error", message: (err instanceof Error && err.message) || "Try again later." });
      }
    })();
  }, [noteId, topic]);

  if (phase.state === "loading") {
    return (
      <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <div style={{ fontSize: "2rem", marginBottom: ".75rem" }}>⏳</div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 .5rem" }}>Generating MCQ…</h2>
        <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>Building questions from your notes. This may take a moment.</p>
      </div>
    );
  }
  if (phase.state === "error") {
    return (
      <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
        <div style={{ fontSize: "2rem", marginBottom: ".5rem" }}>❌</div>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "0 0 .5rem" }}>MCQ generation failed</h2>
        <p style={{ color: "var(--muted)", fontSize: ".85rem" }}>{phase.message}</p>
        <RippleBackButton className="mt-4" onClick={onBack} />
      </div>
    );
  }

  const total = questions.length;
  const q = questions[idx];
  const touched = selections[idx] !== null && selections[idx] !== undefined;
  const sel = selections[idx];

  const goto = (i: number) => {
    const next = Math.max(0, Math.min(i, total - 1));
    setIdx(next);
    setHovered(null);
    setBar(Math.max(0, Math.min(100, (next / (total || 1)) * 100)));
  };
  const answer = (i: number) => {
    if (touched) return;
    setSelections((s) => s.map((v, j) => (j === idx ? i : v)));
    if (i === q.correct_index) {
      setScore((n) => n + 1);
      snack("✓ Correct!");
    }
  };
  const restart = (shuffle: boolean) => {
    if (shuffle) {
      const next = [...questions];
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
      setQuestions(next);
    }
    setIdx(0);
    setScore(0);
    setSelections(new Array(total).fill(null));
    setShowResult(false);
    setBar(0);
    setHovered(null);
  };

  const optionStyle = (i: number): CSSProperties => {
    let borderColor = "var(--outline)";
    let background = "transparent";
    if (touched && typeof sel === "number") {
      if (i === sel) {
        borderColor = sel === q.correct_index ? GREEN_BORDER : RED_BORDER;
        background = sel === q.correct_index ? GREEN_BG : RED_BG;
      } else if (sel !== q.correct_index && i === q.correct_index) {
        borderColor = GREEN_BORDER;
        background = GREEN_BG;
      }
    } else if (hovered === i) {
      background = "var(--brand-soft)";
    }
    return {
      borderWidth: 1,
      borderStyle: "solid",
      borderColor,
      borderRadius: ".75rem",
      padding: ".7rem .85rem",
      cursor: "pointer",
      textAlign: "left",
      transition: "background .15s ease, border-color .15s ease",
      background,
      color: "inherit",
      fontSize: ".9rem",
      pointerEvents: touched ? "none" : undefined,
    };
  };

  const pct = Math.round((score / total) * 100);
  const emoji = pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "📚";
  const wrong = touched && typeof sel === "number" && sel !== q.correct_index;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: ".5rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: ".75rem", flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>{phase.title} — MCQ</h2>
          <span style={{ border: "1px solid var(--outline)", borderRadius: 999, padding: ".2rem .6rem", fontSize: ".75rem" }}>{total} Qs</span>
        </div>
        <RippleBackButton onClick={onBack} />
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 999,
          overflow: "hidden",
          border: "1px solid var(--outline)",
          background: "color-mix(in oklab, var(--surface) 70%, transparent)",
          marginBottom: "1.25rem",
        }}
      >
        <div style={{ height: "100%", width: `${bar}%`, background: "linear-gradient(90deg, #9E4B8A, #4C2A59)", transition: "width .25s ease" }} />
      </div>
      <div>
        <div style={CARD}>
          <div style={{ display: "flex", alignItems: "center", gap: ".5rem", fontSize: ".75rem", color: "var(--muted)", marginBottom: ".5rem" }}>
            <span style={{ border: "1px solid var(--outline)", borderRadius: 999, padding: ".15rem .5rem" }}>Q{idx + 1}</span>
          </div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 600, margin: "0 0 .75rem" }}>{q.question || ""}</h3>
          <div style={{ display: "grid", gap: ".5rem" }}>
            {q.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                style={optionStyle(i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
                onClick={() => answer(i)}
              >
                <span style={{ border: "1px solid var(--outline)", borderRadius: 999, padding: ".12rem .45rem", marginRight: ".5rem", fontSize: ".75rem", fontWeight: 600 }}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt || ""}
              </button>
            ))}
          </div>
          {wrong ? (
            <div
              style={{
                border: "1px solid var(--outline)",
                borderRadius: ".75rem",
                background: "color-mix(in oklab, var(--surface) 88%, transparent)",
                padding: ".75rem",
                marginTop: ".75rem",
                fontSize: ".85rem",
              }}
            >
              <strong>Answer:</strong> {q.options[q.correct_index] || ""}
              <br />
              <span>{q.explanation || "Based on the note content."}</span>
            </div>
          ) : null}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1.25rem" }}>
        <RippleButton className={TOOL_BTN} style={outline} onClick={() => goto(idx - 1)}>
          ◀ Prev
        </RippleButton>
        <span style={{ fontSize: ".85rem" }}>
          {Math.min(idx + 1, total)} / {total}
        </span>
        <RippleButton
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition"
          style={{ background: "linear-gradient(135deg, var(--brand), var(--brand-strong, #4C2A59))", boxShadow: "0 8px 24px rgba(158,75,138,.3)", border: "none" }}
          onClick={() => {
            if (idx >= total - 1) {
              setShowResult(true);
              setBar(100);
            } else goto(idx + 1);
          }}
        >
          Next ▶
        </RippleButton>
      </div>
      {showResult ? (
        <div style={{ marginTop: "1.5rem" }}>
          <div style={CARD}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "0 0 .25rem" }}>{emoji} Your Results</h3>
            <p style={{ fontSize: ".9rem", margin: "0 0 .75rem" }}>
              You scored{" "}
              <strong>
                {score} / {total}
              </strong>{" "}
              ({pct}%)
            </p>
            <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              <RippleButton className={TOOL_BTN} style={outline} onClick={() => restart(false)}>
                🔄 Retake
              </RippleButton>
              <RippleButton className={TOOL_BTN} style={outline} onClick={() => restart(true)}>
                🔀 Shuffle
              </RippleButton>
            </div>
            <div style={{ display: "grid", gap: ".5rem" }}>
              {questions.map((item, i) => {
                const chosen = selections[i];
                const ok = typeof chosen === "number" && chosen === item.correct_index;
                return (
                  <div
                    key={i}
                    style={{
                      borderStyle: "solid",
                      borderWidth: "1px 1px 1px 3px",
                      borderColor: `var(--outline) var(--outline) var(--outline) ${ok ? GREEN_BORDER : RED_BORDER}`,
                      borderRadius: ".75rem",
                      padding: ".85rem",
                      background: ok ? "rgba(16,185,129,.08)" : "rgba(239,68,68,.08)",
                    }}
                  >
                    <div style={{ fontSize: ".75rem", color: "var(--muted)", marginBottom: ".25rem" }}>Q{i + 1}</div>
                    <div style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: ".35rem" }}>{item.question || ""}</div>
                    <div style={{ fontSize: ".82rem" }}>
                      <strong>Your answer:</strong> {typeof chosen === "number" ? item.options[chosen] || "" : "—"}
                    </div>
                    <div style={{ fontSize: ".82rem", color: "rgba(16,185,129,.9)" }}>
                      <strong>Correct:</strong> {item.options[item.correct_index] || ""}
                    </div>
                    {item.explanation ? (
                      <div style={{ fontSize: ".8rem", color: "var(--muted)", marginTop: ".25rem" }}>
                        <strong>Why:</strong> {item.explanation}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
