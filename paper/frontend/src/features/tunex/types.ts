/**
 * Shapes of `GET /api/tunex/topics/{id}/full` (packages/tunex_router.py).
 *
 * Chapter content is free-form JSON written by seed scripts and by the Gemini
 * template (`_build_topic_template`), so every field is optional and the
 * renderers read it defensively (the original Alpine templates simply rendered
 * nothing when a field was missing).
 */

export interface TopicFull {
  id?: string;
  title?: string;
  description?: string;
  track_title?: string | null;
  language_name?: string | null;
  level_title?: string | null;
  section_title?: string | null;
  chapters?: Chapter[] | null;
}

export type ChapterType =
  | "concept"
  | "syntax"
  | "mistakes"
  | "interview"
  | "walkthrough"
  | "quiz"
  | (string & {});

export interface Chapter {
  id?: string;
  chapter_number: number;
  title?: string;
  chapter_type?: ChapterType;
  content?: ChapterContent | null;
}

/** Union of every field the page reads from `chapter.content`. */
export interface ChapterContent {
  // Dynamic block engine
  blocks?: Block[];
  // Legacy concept
  description?: string;
  code_title?: string;
  code_snippet?: string;
  code_output?: string;
  mental_model?: { title?: string; text?: string };
  // Syntax
  syntax_block?: string;
  components?: { name?: string; desc?: string }[];
  tips?: (SyntaxTip | string)[];
  // Mistakes
  mistakes?: Mistake[];
  // Interview
  layout?: "practice_list" | "company_grid" | "company_cards" | (string & {});
  questions?: (InterviewQuestion & QuizQuestion)[];
  // Walkthrough
  problem?: { title?: string; desc?: string; example?: string };
  steps?: WalkthroughStep[];
  takeaway?: string;
  // Generic editor sections / variations / legacy editor
  sections?: EditorSection[];
  variations?: { code?: string; meaning?: string; note?: string }[];
  editor_id?: string | number;
  default_code?: string;
}

export interface SyntaxTip {
  title?: string;
  text?: string;
}

export interface Mistake {
  name?: string;
  icon?: string;
  desc?: string;
  fix?: string;
}

export interface InterviewQuestion {
  company?: string;
  icon?: string;
  color?: string;
  tag?: string;
  tag_short?: string;
  role?: string;
  /** Question text of the default and practice layouts. */
  q?: string;
  /** Question text of the company-card layout. */
  question?: string;
  use_case?: string;
  problem_id?: string | number;
}

export interface QuizQuestion {
  q?: string;
  opts?: string[];
  correct?: number;
  why?: string;
}

export interface WalkthroughStep {
  title?: string;
  text?: string;
  items?: string[];
  code_id?: string | number;
  default_code?: string;
  trace?: { num?: number | string; max?: number | string; updated?: boolean }[];
}

export interface EditorSection {
  title?: string;
  text?: string;
  editor_id?: string | number;
  default_code?: string;
}

export interface CarouselItem {
  title?: string;
  desc?: string;
  code_id?: string | number;
  default_code?: string;
}

export interface CardItem {
  icon?: string;
  title?: string;
  value?: string;
  tags?: string[];
}

export interface KeywordCard {
  name?: string;
  tag?: string;
  tag_color?: string;
  desc?: string;
  code?: string;
}

/** One block of the dynamic block engine (`content.blocks`). */
export interface Block {
  type?: string;
  id?: string | number;
  title?: string;
  content?: string;
  text?: string;
  default_code?: string;
  variant?: "info" | "warning" | "success" | (string & {});
  left?: { title?: string; content?: string };
  right?: { type?: "image" | "code_static" | (string & {}); url?: string; content?: string };
  items?: (CarouselItem & CardItem)[] | string[];
  code?: string;
  output?: string;
  parts?: { keyword?: string; desc?: string }[];
  examples?: string[] | { input?: string; output?: string }[];
  note?: string;
  correct?: string;
  wrong?: string;
  keywords?: KeywordCard[];
  forms?: { syntax?: string; desc?: string }[];
  icon?: string;
  questions?: InterviewQuestion[];
  tips?: string[];
}

/** `POST /api/tunex/compiler/run` response. */
export interface CompilerResult {
  status?: "success" | "error" | (string & {});
  output?: string;
  error?: string;
}

/** `GET /api/youtube/search` item. */
export interface RelatedVideo {
  id?: string;
  link?: string;
  title?: string;
  channel?: string;
  channel_page?: string;
  channel_logo?: string;
  channel_logo_is_default?: boolean;
  thumbnail?: string;
  views?: string;
  duration?: string;
}
