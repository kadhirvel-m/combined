/** Typed wrappers around the endpoints only the medical pages call (the shared ones live in `features/notes`). */

import { apiRaw } from "@/lib/api";
import { requestJson } from "@/features/notes/api";
import type {
  BlinkLinksResponse,
  CaseflowEvaluateResponse,
  CaseflowResponse,
  ChatTurn,
  DecisionTreeResponse,
  GeneratedNote,
  MatchResponse,
  McqResponse,
  PptLinkResponse,
  RagChatResponse,
  VivaResponse,
} from "./types";

const q = encodeURIComponent;

export const medicalApi = {
  /* ---- study tools ---------------------------------------------------- */
  mcq: (noteId: string, topic: string) => requestJson<McqResponse>(`/notes/${q(noteId)}/mcq`, { method: "POST", json: { topic: topic || undefined, count: 10 } }),
  matchFollowing: (topic: string) => requestJson<MatchResponse>("/api/notes/match-following", { method: "POST", json: { topic } }),
  caseflow: (topic: string, variant: string) => requestJson<CaseflowResponse>("/api/notes/caseflow", { method: "POST", json: { topic, variant } }),
  caseflowEvaluate: (body: { topic: string; variant: string; scenario_question: string; answer: string; history: ChatTurn[] }) =>
    requestJson<CaseflowEvaluateResponse>("/api/notes/caseflow/evaluate", { method: "POST", json: body }),
  vivaRespond: (body: { topic: string; variant: string; answer: string; history: ChatTurn[] }) =>
    requestJson<VivaResponse>("/api/notes/viva/respond", { method: "POST", json: body }),
  decisionTree: (topic: string, variant: string, force?: boolean) =>
    requestJson<DecisionTreeResponse>("/api/notes/clinical-decision-tree", { method: "POST", json: force ? { topic, variant, force: true } : { topic, variant } }),
  pptLink: (topic: string) => requestJson<PptLinkResponse>(`/api/notes/ppt-link?topic=${q(topic)}`),
  blinkLinks: (topics: string[], headers: Record<string, string>) =>
    requestJson<BlinkLinksResponse>(`/api/blink/links?topics_json=${q(JSON.stringify(topics))}`, { headers }),

  /* ---- notes_chat RAG generation ---------------------------------------- */
  ragChat: (message: string) =>
    requestJson<RagChatResponse>("/api/medix/rag/chat", {
      method: "POST",
      json: {
        message,
        top_k: 20,
        min_score: 0.35,
        temperature: 0.2,
        stateless_mode: true,
        strict_citation_mode: true,
        verify_response: true,
        debug_retrieval: false,
      },
    }),
  generateHttp: (body: { topic: string; force: boolean; variant: string; degree?: string }, headers: Record<string, string>) =>
    requestJson<GeneratedNote>("/api/notes/generate", { method: "POST", json: body, headers }),
  refresh: () => requestJson<{ access_token?: string }>("/refresh", { method: "POST", json: {} }),
  stream: (query: Record<string, string>, signal: AbortSignal) => apiRaw("/generate/stream", { query, signal, headers: { Accept: "text/event-stream" } }),
};

