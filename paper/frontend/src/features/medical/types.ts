/** Response/request shapes of the medical study-tool endpoints (as the original pages read them). */

export interface ErrorBody {
  detail?: string;
  error?: string;
}

/** `POST /notes/{id}/mcq` */
export interface McqQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation?: string;
}
export interface McqResponse extends ErrorBody {
  topic?: string;
  questions?: McqQuestion[];
}

/** `POST /api/notes/match-following` */
export interface MatchPair {
  term: string;
  definition: string;
}
export interface MatchResponse extends ErrorBody {
  pairs?: MatchPair[];
  cached?: boolean;
}

/** `POST /api/notes/caseflow` */
export interface CaseflowResponse extends ErrorBody {
  scenario_question?: string;
  cached?: boolean;
}

/** `POST /api/notes/caseflow/evaluate` */
export interface CaseflowEvaluation {
  score?: number | string;
  verdict?: string;
  feedback?: string;
  strengths?: unknown[];
  improve?: unknown[];
  follow_up_question?: string;
}
export interface CaseflowEvaluateResponse extends ErrorBody {
  evaluation?: CaseflowEvaluation;
}

/** Chat history entry sent to CaseFlow / Viva. */
export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

/** `POST /api/notes/viva/respond` */
export interface VivaTurn {
  examiner_reply?: string;
  cross_question?: string;
  question_type?: string;
  intensity?: string;
}
export interface VivaResponse extends ErrorBody {
  viva?: VivaTurn;
}

/** `POST /api/notes/clinical-decision-tree` */
export interface MindMapNode {
  label?: string;
  children?: MindMapNode[];
}
export interface DecisionTreeResponse extends ErrorBody {
  mind_map?: MindMapNode | null;
  decision_tree?: { mind_map?: MindMapNode | null } | null;
}

/** `GET /api/notes/ppt-link` */
export interface PptLinkResponse {
  ppt_link?: string;
}

/** `GET /api/blink/links` */
export interface BlinkLinksResponse {
  links?: Record<string, string>;
  [topic: string]: unknown;
}

/** `POST /api/medix/rag/chat` (notes_chat) */
export interface RagCitation {
  source_name?: string;
  chunk_index?: number | string | null;
  section_title?: string;
  similarity?: number;
  chunk_text?: string;
}
export interface RagChatResponse extends ErrorBody {
  answer?: string;
  citations?: RagCitation[];
}
export interface RagContext {
  answer: string;
  citations: RagCitation[];
}

/** One clickable `[LABEL]` of the "RAG CITATIONS" section. */
export interface RagChunk {
  source_name: string;
  chunk_index: string;
  section_title: string;
  similarity: number;
  chunk_text: string;
}
export type RagLookup = Record<string, RagChunk>;

/** `POST /api/notes/generate` (notes_chat HTTP fallback) and stream `final` event. */
export interface GeneratedNote extends ErrorBody {
  id?: string;
  markdown?: string;
  title?: string;
  topic?: string;
  image_urls?: string[];
  urls?: string[];
}
