"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Sym, useNotes } from "@/features/notes";
import { medicalApi } from "../../api";
import { clampScore } from "../../lib/tools";
import type { ChatTurn } from "../../types";
import styles from "../../medical.module.css";
import { BRAND_BUTTON, Bubble, FIELD_LABEL, MultilineText, PillBackButton, TopicChip, type ChatBubble } from "./shared";

const CHAT_BOX: CSSProperties = {
  border: "1px solid var(--outline)",
  borderRadius: "1rem",
  background: "color-mix(in oklab, var(--surface) 90%, transparent)",
  minHeight: 260,
  overflow: "auto",
  padding: ".95rem",
  display: "flex",
  flexDirection: "column",
  gap: ".75rem",
};
const TEXTAREA: CSSProperties = {
  width: "100%",
  border: "1px solid var(--outline)",
  borderRadius: ".8rem",
  background: "var(--surface)",
  color: "var(--surface-contrast)",
  padding: ".75rem .85rem",
  fontSize: ".9rem",
  lineHeight: 1.45,
  resize: "vertical",
  minHeight: 110,
};
const errorText = (err: unknown) => (err instanceof Error ? err.message : "");

interface ChatLayoutProps {
  maxWidth: number;
  headerGap: string;
  title: ReactNode;
  topic: string;
  intro: ReactNode;
  bubbles: ChatBubble[];
  botName: string;
  bubbleWidth: string;
  bubblePadding: string;
  chatMaxHeight: number;
  inputId: string;
  inputLabel: string;
  placeholder: string;
  input: string;
  setInput: (v: string) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  status: string;
  sending: boolean;
  sendLabel: string;
  onSend: () => void;
  onBack: () => void;
}

/** Shared layout of CaseFlow and Viva: header, intro card, chat log, answer box. */
function ChatLayout({
  maxWidth,
  headerGap,
  title,
  topic,
  intro,
  bubbles,
  botName,
  bubbleWidth,
  bubblePadding,
  chatMaxHeight,
  inputId,
  inputLabel,
  placeholder,
  input,
  setInput,
  inputRef,
  status,
  sending,
  sendLabel,
  onSend,
  onBack,
}: ChatLayoutProps) {
  const chatRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = chatRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [bubbles]);
  return (
    <div style={{ maxWidth: maxWidth, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: headerGap }}>
        {title}
        <div style={{ display: "flex", alignItems: "center", gap: ".5rem", flexWrap: "wrap" }}>
          <TopicChip topic={topic} />
          <PillBackButton onClick={onBack} />
        </div>
      </div>
      {intro}
      <div ref={chatRef} style={{ ...CHAT_BOX, maxHeight: chatMaxHeight }}>
        {bubbles.map((b) => (
          <Bubble key={b.id} bubble={b} name={botName} maxWidth={bubbleWidth} padding={bubblePadding} />
        ))}
      </div>
      <div
        style={{
          border: "1px solid var(--outline)",
          borderRadius: "1rem",
          padding: ".9rem",
          background: "color-mix(in oklab, var(--surface) 92%, transparent)",
          display: "flex",
          flexDirection: "column",
          gap: ".65rem",
        }}
      >
        <label htmlFor={inputId} style={FIELD_LABEL}>
          {inputLabel}
        </label>
        <textarea
          id={inputId}
          ref={inputRef}
          rows={4}
          placeholder={placeholder}
          style={TEXTAREA}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              onSend();
            }
          }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: ".6rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: ".78rem", color: "var(--muted)" }}>{status}</span>
          <button type="button" className={styles.lift} disabled={sending} style={{ ...BRAND_BUTTON, opacity: sending ? 0.65 : 1 }} onClick={onSend}>
            <Sym name="send" style={{ fontSize: "1rem" }} />
            {sendLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

let bubbleId = 0;
const bubble = (role: ChatBubble["role"], content: ReactNode, meta?: string): ChatBubble => ({ id: ++bubbleId, role, content, meta });

/** CaseFlow: a clinical scenario and an AI evaluation of the student's justification. */
export function CaseFlow({ topic, scenario, cached, onBack }: { topic: string; scenario: string; cached: boolean; onBack: () => void }) {
  const { snack, variant } = useNotes();
  const [bubbles, setBubbles] = useState<ChatBubble[]>(() => [
    bubble("assistant", "Share your reasoning for the scenario above. I’ll evaluate it and coach your next improvement step."),
  ]);
  const history = useRef<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const evaluate = async () => {
    const answer = input.trim();
    if (!answer) {
      snack("Please write your justification first");
      inputRef.current?.focus();
      return;
    }
    setSending(true);
    setStatus("Evaluating your response…");
    setBubbles((b) => [...b, bubble("user", <MultilineText text={answer} />)]);
    history.current.push({ role: "user", content: answer });
    try {
      const res = await medicalApi.caseflowEvaluate({ topic, variant, scenario_question: scenario, answer, history: history.current });
      if (!res.ok) throw new Error((res.data && (res.data.detail || res.data.error)) || `Request failed (${res.status})`);
      const evaluation = res.data?.evaluation || {};
      const verdict = String(evaluation.verdict || "Needs improvement");
      const feedback = String(evaluation.feedback || "").trim();
      const strengths = Array.isArray(evaluation.strengths) ? evaluation.strengths : [];
      const improve = Array.isArray(evaluation.improve) ? evaluation.improve : [];
      const followUp = String(evaluation.follow_up_question || "").trim();
      setBubbles((b) => [
        ...b,
        bubble(
          "assistant",
          <>
            <div style={{ display: "flex", gap: ".4rem", alignItems: "center", marginBottom: ".35rem", flexWrap: "wrap" }}>
              <span style={{ border: "1px solid var(--outline)", borderRadius: 999, padding: ".12rem .5rem", fontSize: ".68rem", fontWeight: 700 }}>Score: {clampScore(evaluation.score)}/10</span>
              <span style={{ fontSize: ".74rem", fontWeight: 700, color: "var(--brand)" }}>{verdict}</span>
            </div>
            {feedback ? <div>{feedback}</div> : null}
            {strengths.length ? (
              <div style={{ marginTop: ".5rem" }}>
                <strong style={{ fontSize: ".76rem" }}>Strengths</strong>
                <ul style={{ margin: ".25rem 0 0 1rem" }}>
                  {strengths.slice(0, 4).map((s, i) => (
                    <li key={i}>{String(s)}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {improve.length ? (
              <div style={{ marginTop: ".45rem" }}>
                <strong style={{ fontSize: ".76rem" }}>Improve next</strong>
                <ul style={{ margin: ".25rem 0 0 1rem" }}>
                  {improve.slice(0, 4).map((s, i) => (
                    <li key={i}>{String(s)}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {followUp ? (
              <div style={{ marginTop: ".55rem", borderTop: "1px dashed var(--outline)", paddingTop: ".45rem" }}>
                <strong style={{ fontSize: ".76rem" }}>Follow-up</strong>
                <div style={{ marginTop: ".2rem" }}>{followUp}</div>
              </div>
            ) : null}
          </>,
        ),
      ]);
      history.current.push({ role: "assistant", content: `${feedback}${followUp ? ` Follow-up: ${followUp}` : ""}`.trim() });
      setStatus("Evaluation ready. Reply again to continue the chat.");
      setInput("");
    } catch (err) {
      console.error("[CaseFlow] evaluate error:", err);
      setStatus(errorText(err) || "Evaluation failed");
      snack(errorText(err) || "CaseFlow evaluation failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <ChatLayout
      maxWidth={860}
      headerGap=".75rem"
      title={
        <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, display: "flex", alignItems: "center", gap: ".45rem" }}>
          <Sym name="account_tree" style={{ color: "var(--brand)", fontSize: "1.35rem" }} />
          CaseFlow Chat
        </h2>
      }
      topic={topic}
      intro={
        <div style={{ border: "1px solid var(--outline)", borderRadius: "1rem", padding: ".95rem 1rem", background: "color-mix(in oklab, var(--surface) 84%, transparent)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".45rem", ...FIELD_LABEL, marginBottom: ".55rem" }}>
            <Sym name="clinical_notes" style={{ fontSize: "1rem", color: "var(--brand)" }} />
            Clinical Case Scenario
            {cached ? (
              <span style={{ marginLeft: ".35rem", border: "1px solid var(--outline)", borderRadius: 999, padding: ".15rem .45rem", fontSize: ".62rem", textTransform: "none", letterSpacing: "normal" }}>
                cached
              </span>
            ) : null}
          </div>
          <p style={{ margin: 0, lineHeight: 1.55, fontSize: ".93rem" }}>{scenario}</p>
        </div>
      }
      bubbles={bubbles}
      botName="CaseFlow AI"
      bubbleWidth="86%"
      bubblePadding=".7rem .8rem"
      chatMaxHeight={460}
      inputId="caseflowAnswerInput"
      inputLabel="Justify yourself"
      placeholder="Write your clinical justification based on this topic..."
      input={input}
      setInput={setInput}
      inputRef={inputRef}
      status={status}
      sending={sending}
      sendLabel="Evaluate Answer"
      onSend={() => void evaluate()}
      onBack={onBack}
    />
  );
}

/** Viva Simulator: examiner-style cross questioning (the first question is asked on open). */
export function VivaSimulator({ topic, onBack }: { topic: string; onBack: () => void }) {
  const { snack, variant } = useNotes();
  const [bubbles, setBubbles] = useState<ChatBubble[]>([]);
  const history = useRef<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const variantRef = useRef(variant);
  useEffect(() => {
    variantRef.current = variant;
  }, [variant]);

  const requestTurn = useRef(async (answer: string) => {
    setStatus("Examiner is preparing next question…");
    try {
      const res = await medicalApi.vivaRespond({ topic, variant: variantRef.current, answer, history: history.current });
      if (!res.ok) throw new Error((res.data && (res.data.detail || res.data.error)) || `Request failed (${res.status})`);
      const viva = res.data?.viva || {};
      const reply = String(viva.examiner_reply || "").trim();
      const cross = String(viva.cross_question || "").trim();
      const qType = String(viva.question_type || "").trim();
      const intensity = String(viva.intensity || "").trim();
      setBubbles((b) => [
        ...b,
        bubble(
          "assistant",
          <>
            {reply ? <div>{reply}</div> : null}
            {cross ? (
              <div style={{ marginTop: ".45rem", borderTop: "1px dashed var(--outline)", paddingTop: ".45rem" }}>
                <strong style={{ fontSize: ".76rem" }}>{qType || "Cross-question"}</strong>
                <div style={{ marginTop: ".2rem" }}>{cross}</div>
              </div>
            ) : null}
          </>,
          intensity ? `Mode: ${intensity}` : "",
        ),
      ]);
      history.current.push({ role: "assistant", content: `${reply}${cross ? ` Question: ${cross}` : ""}`.trim() });
      setStatus("Your turn. Answer concisely and clinically.");
    } catch (err) {
      console.error("[Viva] error:", err);
      setStatus(errorText(err) || "Viva request failed");
      snack(errorText(err) || "Failed to continue Viva");
    }
  });

  const asked = useRef(false);
  useEffect(() => {
    if (asked.current) return;
    asked.current = true;
    void requestTurn.current("");
  }, []);

  const submit = async () => {
    const answer = input.trim();
    if (!answer) {
      snack("Type your viva answer first");
      inputRef.current?.focus();
      return;
    }
    setSending(true);
    setBubbles((b) => [...b, bubble("user", <MultilineText text={answer} />)]);
    history.current.push({ role: "user", content: answer });
    await requestTurn.current(answer);
    setInput("");
    setSending(false);
  };

  return (
    <ChatLayout
      maxWidth={900}
      headerGap=".7rem"
      title={
        <h2 style={{ margin: 0, fontSize: "1.22rem", fontWeight: 800, display: "flex", alignItems: "center", gap: ".5rem" }}>
          <Sym name="record_voice_over" style={{ color: "var(--brand)", fontSize: "1.35rem" }} />
          Viva Simulator
        </h2>
      }
      topic={topic}
      intro={
        <div style={{ border: "1px solid var(--outline)", borderRadius: "1rem", padding: ".85rem 1rem", background: "color-mix(in oklab, var(--surface) 90%, transparent)" }}>
          <div style={{ fontSize: ".78rem", color: "var(--muted)", lineHeight: 1.45 }}>
            🧠 Viva mode: examiner asks <strong>Why</strong>, <strong>How</strong>, <strong>What if</strong>, and <strong>Differentiate</strong> questions. Be concise and
            evidence-based.
          </div>
        </div>
      }
      bubbles={bubbles}
      botName="Viva Examiner"
      bubbleWidth="88%"
      bubblePadding=".72rem .82rem"
      chatMaxHeight={470}
      inputId="vivaAnswerInput"
      inputLabel="Your viva answer"
      placeholder="Type your answer (exam style, concise)..."
      input={input}
      setInput={setInput}
      inputRef={inputRef}
      status={status}
      sending={sending}
      sendLabel="Respond"
      onSend={() => void submit()}
      onBack={onBack}
    />
  );
}
