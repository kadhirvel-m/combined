import type { AuthTokenMode } from "./lib/authToken";

/** One entry of the variant switcher (`detailed`, `cheatsheet`, `simple`…). */
export interface NotesVariantOption {
  key: string;
  label: string;
}

export interface NotesNavLink {
  href: string;
  label: string;
}

/** Context handed to `decorateOutput` after the notes HTML is rendered. */
export interface OutputDecoratorContext {
  /** File name of the page (`maths_notes.html`), for self links. */
  pageFile: string;
}

/**
 * Everything that differs between the pages of the notes family. A page is a
 * `NotesWorkspaceConfig` (usually `defineNotesConfig({ …overrides })`) plus
 * optional slots on `<NotesLayout>`.
 */
export interface NotesWorkspaceConfig {
  /** Original file name (`notes_generator.html`). Used for self links. */
  pageFile: string;
  /** SSE endpoint that generates notes (`GET`, query: topic, variant, force, degree, course_type, access_token). */
  streamPath: string;
  /** Variants offered by the switcher; the first one is the default. */
  variants: NotesVariantOption[];

  /** Which markers count as "signed in" for the redirect to login. */
  loginGate: "session" | "token";
  /** How the auth token is looked up (see `getAuthToken`). */
  authToken: AuthTokenMode;
  /** Send `Authorization` on the lookup endpoints (degrees, domains, syllabus topic, YouTube search). */
  authLookups: boolean;

  header: {
    /** Links shown next to the logo (sm and up). */
    navLinks: NotesNavLink[];
    /** Share button + Share modal. */
    share: boolean;
    /** Density toggle. */
    density: boolean;
    /** "Verified by" chip and the teacher/HOD Approve button. */
    verify: boolean;
  };

  /** Generate button content: sparkle icon or the word "Generate". */
  generateButton: "icon" | "text";

  roles: {
    /** `staff`: admin, employee, teacher, moderator, HOD or an edit permission. `adminEmployee`: admins and employees only. */
    allow: "staff" | "adminEmployee";
    /** Retry `roles/me` with cookies only when a stale bearer token is rejected. */
    cookieRetry: boolean;
    /** Skip the role lookup entirely when there is no token. */
    requireToken: boolean;
    /** Teachers/HODs review instead of editing: they get Approve, not Edit/Emphasis (and Emphasis is role gated). */
    teacherReview: boolean;
  };
  /** Edit button is `hidden sm:inline-flex` (desktop only) instead of `inline-flex`. */
  editDesktopOnly: boolean;

  /** Plan limits: access checks, plan summary, "topics left" toast and the limit-reached panel. */
  access: boolean;
  /** When the saved-note lookup is inconclusive: generate anyway, or stop. */
  dbCheckFallback: "generate" | "stop";

  /** Related videos: always fetched fresh, cached in localStorage, or disabled. */
  videos: "fresh" | "cached" | "disabled";
  /** Show the sticky "Contents" card. */
  toc: boolean;

  /** Download: server-rendered PDF or client-side html2pdf of the rendered output. */
  download: "server" | "html2pdf";
  fullscreen: {
    /** Also enter native browser fullscreen. */
    native: boolean;
    /** Extra control next to "Exit Fullscreen". */
    controls: "theme" | "home";
  };

  /** Query params that auto-start a generation; `retry` re-attempts shortly after load. */
  autoStart: { params: string[]; retry: boolean };
  /** `?<param>=question` posts to `path` and shows the returned markdown. */
  solve: { param: string; path: string } | null;

  selection: {
    /** Max characters of the selection sent to the snippet assistant. */
    payloadMax: number;
  };

  /** Loader shown in the output while generating. */
  loader: "lottie" | "none";
  /** Fallback topic source used when restoring the last note. */
  storedTopicFallback: boolean;

  /** Rewrites the markdown before it is rendered (e.g. math normalisation). */
  prepareMarkdown?: (markdown: string) => string;
  /** DOM post-processing of the rendered notes (e.g. clickable practice problems). */
  decorateOutput?: (root: HTMLElement, context: OutputDecoratorContext) => void;

  /** GARLIC V3 study-session auto-close beacon. */
  garlic: boolean;
  /** Swallow the known `createElementNS` unhandled rejection of third-party SVG code. */
  guardSvgRejections: boolean;
}

export const DEFAULT_VARIANTS: NotesVariantOption[] = [
  { key: "detailed", label: "Detailed" },
  { key: "cheatsheet", label: "Cheat Sheet" },
];

/** The `notes_generator.html` behaviour; other pages override what differs. */
export const DEFAULT_NOTES_CONFIG: NotesWorkspaceConfig = {
  pageFile: "notes_generator.html",
  streamPath: "/generate/stream",
  variants: DEFAULT_VARIANTS,
  loginGate: "session",
  authToken: "full",
  authLookups: true,
  header: { navLinks: [], share: true, density: false, verify: true },
  generateButton: "icon",
  roles: { allow: "staff", cookieRetry: true, requireToken: false, teacherReview: true },
  editDesktopOnly: false,
  access: true,
  dbCheckFallback: "generate",
  videos: "fresh",
  toc: true,
  download: "server",
  fullscreen: { native: true, controls: "theme" },
  autoStart: { params: ["topic", "q"], retry: true },
  solve: null,
  selection: { payloadMax: 2800 },
  loader: "lottie",
  storedTopicFallback: false,
  garlic: false,
  guardSvgRejections: false,
};

type DeepPartial<T> = { [K in keyof T]?: T[K] extends (...args: never[]) => unknown ? T[K] : T[K] extends unknown[] ? T[K] : T[K] extends object | null ? DeepPartial<NonNullable<T[K]>> | Extract<T[K], null> : T[K] };

/** Builds a page config from the defaults plus overrides (nested objects are merged). */
export function defineNotesConfig(overrides: DeepPartial<NotesWorkspaceConfig>): NotesWorkspaceConfig {
  const base = DEFAULT_NOTES_CONFIG;
  return {
    ...base,
    ...(overrides as Partial<NotesWorkspaceConfig>),
    header: { ...base.header, ...overrides.header } as NotesWorkspaceConfig["header"],
    roles: { ...base.roles, ...overrides.roles },
    fullscreen: { ...base.fullscreen, ...overrides.fullscreen },
    autoStart: { ...base.autoStart, ...overrides.autoStart } as NotesWorkspaceConfig["autoStart"],
    selection: { ...base.selection, ...overrides.selection },
    solve: overrides.solve === undefined ? base.solve : (overrides.solve as NotesWorkspaceConfig["solve"]),
  };
}
