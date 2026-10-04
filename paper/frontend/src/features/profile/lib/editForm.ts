/**
 * profile_edit.html's form model: the editable rows, how they are filled from
 * the profile (with the value sanitising the original's `input.value = …`
 * assignments got from the DOM), the education cascade, the "Linked
 * experience / education" options and the PUT /api/profile/me payload.
 * Everything here is pure; `editorReducer` drives the page.
 */

import { batchRangeLabel } from "../hooks/useEducationForm";
import type {
  CertificationEntry,
  CertificationEntryInput,
  CollegeOption,
  DegreeOption,
  EducationEntry,
  EducationEntryInput,
  ExperienceEntry,
  ExperienceEntryInput,
  MediaItem,
  PortfolioProject,
  PortfolioProjectInput,
  ProfileUpdatePayload,
  PublicationEntry,
  PublicationEntryInput,
  StudentProfile,
} from "../types";

/* ------------------------------------------------------------------------- */
/* Select options                                                            */
/* ------------------------------------------------------------------------- */

export const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Internship", "Freelance", "Contract", "Self-employed", "Apprenticeship"];
export const LOCATION_TYPES = ["Onsite", "Remote", "Hybrid"];
export const MEDIA_KINDS: { value: string; label: string }[] = [
  { value: "link", label: "Link" },
  { value: "document", label: "Document" },
  { value: "video", label: "Video" },
  { value: "image", label: "Image" },
  { value: "presentation", label: "Presentation" },
];
const SECTIONS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/* ------------------------------------------------------------------------- */
/* DOM value sanitising (what `input.value = x` stores)                      */
/* ------------------------------------------------------------------------- */

/** `x || ''` as a string. */
const str = (v: unknown): string => (v ? String(v) : "");
const stripNewlines = (v: string) => v.replace(/[\r\n]/g, "");
const ASCII_WS = /^[\t\n\f\r ]+|[\t\n\f\r ]+$/g;

/** type=text / tel. */
export const textValue = (v: unknown) => stripNewlines(str(v));
/** type=url / email. */
export const urlValue = (v: unknown) => stripNewlines(str(v)).replace(ASCII_WS, "");
/** <textarea> (newlines normalised to LF). */
export const areaValue = (v: unknown) => str(v).replace(/\r\n?/g, "\n");

/** type=date: a valid yyyy-mm-dd date, else "". */
export function dateValue(v: unknown): string {
  const s = str(v);
  const m = /^(\d{4,})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return "";
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1) return "";
  const days = [31, year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= days[month - 1] ? s : "";
}

/** type=number: a valid floating-point number, else "". */
export const numberValue = (v: unknown) => {
  const s = str(v);
  return /^-?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][-+]?\d+)?$/.test(s) ? s : "";
};

/** <select>: the value when it is one of the options, else "" (nothing selected). */
const optionValue = (v: unknown, options: string[]) => {
  const s = str(v);
  return options.includes(s) ? s : "";
};

/** The original's `parseList`: comma separated, trimmed, empties dropped. */
export const parseList = (value: string) =>
  (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const joinList = (v: unknown) => (Array.isArray(v) ? v.map((x) => (x == null ? "" : String(x))).join(", ") : "");

/* ------------------------------------------------------------------------- */
/* Rows                                                                      */
/* ------------------------------------------------------------------------- */

export interface BasicFields {
  name: string;
  email: string;
  headline: string;
  location: string;
  dob: string;
  phone: string;
  bio: string;
  linkedin: string;
  github: string;
  portfolio: string;
  website: string;
  twitter: string;
  instagram: string;
  medium: string;
  leetcode: string;
  technologies: string;
  skills: string;
  certifications: string;
  languages: string;
  interests: string;
  achievements: string;
  experience: string;
  publications: string;
  projectInfo: string;
  specs: string;
}

export type BasicField = keyof BasicFields;

export interface MediaRow {
  key: number;
  title: string;
  url: string;
  kind: string;
}

export interface ExperienceRow {
  key: number;
  id: string;
  title: string;
  employmentType: string;
  company: string;
  companyLogo: string;
  location: string;
  locationType: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  media: MediaRow[];
}

/** The education row's hidden inputs (what is actually saved). */
export interface EducationHidden {
  school: string;
  degree: string;
  department: string;
  batchRange: string;
  collegeId: string;
  degreeId: string;
  departmentId: string;
  batchId: string;
}

export interface EducationRow {
  key: number;
  id: string;
  hidden: EducationHidden;
  /** Select values. */
  college: string;
  degree: string;
  department: string;
  batch: string;
  /** True once this row's college options were filled from GET /api/colleges. */
  collegesFilled: boolean;
  degreeEnabled: boolean;
  departmentEnabled: boolean;
  batchEnabled: boolean;
  /** Degrees of the selected college (GET /api/colleges/{id}). */
  degrees: DegreeOption[];
  /** Names to match while the row initialises; null afterwards. */
  initial: { collegeName: string; degreeName: string; departmentName: string; batchRange: string } | null;
  section: string;
  semester: string;
  regno: string;
  grade: string;
  activities: string;
  description: string;
}

export interface CertificationRow {
  key: number;
  id: string;
  name: string;
  org: string;
  issue: string;
  expiry: string;
  noExpiry: boolean;
  credentialId: string;
  credentialUrl: string;
  description: string;
}

export interface PortfolioRow {
  key: number;
  id: string;
  name: string;
  /** Linked experience / education select values. */
  experience: string;
  education: string;
  /** The saved association (`data-selected`), re-applied on every options refresh. */
  savedExperience: string;
  savedEducation: string;
  start: string;
  end: string;
  url: string;
  description: string;
  stack: string;
  team: string;
}

export interface PublicationRow {
  key: number;
  id: string;
  title: string;
  publisher: string;
  date: string;
  authors: string;
  url: string;
  abstract: string;
}

export interface AssociationOption {
  id: string;
  label: string;
}

export interface EditorState {
  /** Last row key handed out. */
  seq: number;
  fields: BasicFields;
  experiences: ExperienceRow[];
  education: EducationRow[];
  certifications: CertificationRow[];
  projects: PortfolioRow[];
  publications: PublicationRow[];
  /** Options of every project's "Linked experience / education" select, as of the last refresh. */
  associations: { experience: AssociationOption[]; education: AssociationOption[] };
  /** GET /api/colleges (rows with id and name). */
  colleges: CollegeOption[];
}

const EMPTY_FIELDS: BasicFields = {
  name: "",
  email: "",
  headline: "",
  location: "",
  dob: "",
  phone: "",
  bio: "",
  linkedin: "",
  github: "",
  portfolio: "",
  website: "",
  twitter: "",
  instagram: "",
  medium: "",
  leetcode: "",
  technologies: "",
  skills: "",
  certifications: "",
  languages: "",
  interests: "",
  achievements: "",
  experience: "",
  publications: "",
  projectInfo: "",
  specs: "",
};

export const initialEditorState: EditorState = {
  seq: 0,
  fields: EMPTY_FIELDS,
  experiences: [],
  education: [],
  certifications: [],
  projects: [],
  publications: [],
  associations: { experience: [], education: [] },
  colleges: [],
};

/* ---- filling rows from the profile (the original's add*Row(data)) ---- */

function fieldsFrom(data: StudentProfile): BasicFields {
  return {
    name: textValue(data.name),
    email: urlValue(data.email),
    headline: textValue(data.headline),
    location: textValue(data.location),
    dob: dateValue(data.dob),
    phone: textValue(data.phone),
    bio: areaValue(data.bio),
    linkedin: urlValue(data.linkedin),
    github: urlValue(data.github),
    portfolio: urlValue(data.portfolio_url),
    website: urlValue(data.website),
    twitter: urlValue(data.twitter),
    instagram: urlValue(data.instagram),
    medium: urlValue(data.medium),
    leetcode: urlValue(data.leetcode),
    technologies: textValue(data.technologies),
    skills: textValue(data.skills),
    certifications: textValue(data.certifications),
    languages: textValue(data.languages),
    interests: textValue(data.interests),
    achievements: areaValue(data.achievements),
    experience: areaValue(data.experience),
    publications: areaValue(data.publications),
    projectInfo: areaValue(data.project_info),
    specs: textValue(Array.isArray(data.specializations) ? data.specializations.join(", ") : data.specializations),
  };
}

function mediaFrom(key: number, data: MediaItem = {}): MediaRow {
  const kind = str(data.kind) || "link";
  return {
    key,
    title: textValue(data.title),
    url: urlValue(data.url),
    // An unknown kind leaves nothing selected, which saves as "link".
    kind: MEDIA_KINDS.some((k) => k.value === kind) ? kind : "link",
  };
}

function experienceFrom(next: () => number, data: ExperienceEntry = {}): ExperienceRow {
  const isCurrent = Boolean(data.is_current);
  return {
    key: next(),
    id: str(data.id),
    title: textValue(data.title),
    employmentType: optionValue(data.employment_type, EMPLOYMENT_TYPES),
    company: textValue(data.company),
    companyLogo: urlValue(data.company_logo_url),
    location: textValue(data.location),
    locationType: optionValue(data.location_type, LOCATION_TYPES),
    startDate: dateValue(data.start_date),
    // "Currently here" clears and disables the end date.
    endDate: isCurrent ? "" : dateValue(data.end_date),
    isCurrent,
    description: areaValue(data.description),
    media: (Array.isArray(data.media) ? data.media : []).map((m) => mediaFrom(next(), m ?? {})),
  };
}

function educationFrom(next: () => number, data: EducationEntry = {}): EducationRow {
  const section = String(data.section || "")
    .trim()
    .toUpperCase();
  return {
    key: next(),
    id: str(data.id),
    hidden: {
      school: str(data.school),
      degree: str(data.degree),
      department: str(data.department),
      batchRange: str(data.batch_range),
      collegeId: str(data.college_id),
      degreeId: str(data.degree_id),
      departmentId: str(data.department_id),
      batchId: str(data.batch_id),
    },
    college: "",
    degree: "",
    department: "",
    batch: "",
    collegesFilled: false,
    degreeEnabled: false,
    departmentEnabled: false,
    batchEnabled: false,
    degrees: [],
    initial: {
      collegeName: str(data.school),
      degreeName: str(data.degree),
      departmentName: str(data.department),
      batchRange: str(data.batch_range),
    },
    section: SECTIONS.includes(section) ? section : "",
    semester: numberValue(data.current_semester ?? ""),
    regno: textValue(data.regno),
    grade: textValue(data.grade),
    activities: textValue(data.activities),
    description: areaValue(data.description),
  };
}

function certificationFrom(next: () => number, data: CertificationEntry = {}): CertificationRow {
  const noExpiry = Boolean(data.does_not_expire);
  return {
    key: next(),
    id: str(data.id),
    name: textValue(data.name),
    org: textValue(data.issuing_org),
    issue: dateValue(data.issue_date),
    expiry: noExpiry ? "" : dateValue(data.expiration_date),
    noExpiry,
    credentialId: textValue(data.credential_id),
    credentialUrl: urlValue(data.credential_url),
    description: areaValue(data.description),
  };
}

function portfolioFrom(next: () => number, data: PortfolioProject = {}): PortfolioRow {
  const team = Array.isArray(data.team) ? (data.team as unknown[]) : [];
  const teamNames = team
    .map((member) => (typeof member === "string" ? member : str((member as { name?: unknown } | null)?.name)))
    .filter(Boolean);
  return {
    key: next(),
    id: str(data.id),
    name: textValue(data.name),
    experience: "",
    education: "",
    savedExperience: str(data.associated_experience_id),
    savedEducation: str(data.associated_education_id),
    start: dateValue(data.start_date),
    end: dateValue(data.end_date),
    url: urlValue(data.url),
    description: areaValue(data.description),
    stack: textValue(joinList(data.tech_stack)),
    team: textValue(teamNames.join(", ")),
  };
}

function publicationFrom(next: () => number, data: PublicationEntry = {}): PublicationRow {
  return {
    key: next(),
    id: str(data.id),
    title: textValue(data.title),
    publisher: textValue(data.publisher),
    date: dateValue(data.publication_date),
    authors: textValue(joinList(data.authors)),
    url: urlValue(data.url),
    abstract: areaValue(data.abstract),
  };
}

/* ------------------------------------------------------------------------- */
/* Linked experience / education options (the original's refreshAssociations) */
/* ------------------------------------------------------------------------- */

/**
 * Rebuilds the options from the rows' current ids and labels (only rows that
 * were already saved have an id) and re-selects each project's saved link,
 * else its current choice, else nothing. The original only did this at
 * specific moments, so labels are a snapshot of that moment.
 */
function refreshAssociations(state: EditorState): EditorState {
  const experience = state.experiences.map((r) => ({ id: r.id, label: r.title || "Experience" })).filter((o) => o.id);
  const education = state.education.map((r) => ({ id: r.id, label: r.hidden.school || "Education" })).filter((o) => o.id);
  const pick = (options: AssociationOption[], saved: string, current: string) => {
    const wanted = saved || current;
    return options.some((o) => o.id === wanted) ? wanted : "";
  };
  return {
    ...state,
    associations: { experience, education },
    projects: state.projects.map((p) => ({
      ...p,
      experience: pick(experience, p.savedExperience, p.experience),
      education: pick(education, p.savedEducation, p.education),
    })),
  };
}

/* ------------------------------------------------------------------------- */
/* Education cascade (college → degree → department → batch)                 */
/* ------------------------------------------------------------------------- */

const lower = (v: unknown) => String(v || "").trim().toLowerCase();
const upper = (v: unknown) => String(v || "").trim().toUpperCase();

function departmentsOf(row: EducationRow) {
  const degree = row.degrees.find((d) => String(d.id) === row.degree) ?? null;
  return Array.isArray(degree?.departments) ? degree.departments : [];
}

/** Options shown by an education row's cascade selects. */
export function educationOptions(row: EducationRow, colleges: CollegeOption[]) {
  const departments = departmentsOf(row);
  const department = departments.find((d) => String(d.id) === row.department) ?? null;
  const batches = Array.isArray(department?.batches) ? department.batches : [];
  return {
    colleges: row.collegesFilled ? colleges.map((c) => ({ value: c.id, label: c.name })) : [],
    degrees: row.degreeEnabled ? row.degrees.map((d) => ({ value: String(d.id), label: d.name })) : [],
    departments: row.departmentEnabled ? departments.map((d) => ({ value: String(d.id), label: d.name })) : [],
    batches: row.batchEnabled
      ? batches
          .map(batchRangeLabel)
          .filter(Boolean)
          .map((label) => ({ value: label, label }))
      : [],
  };
}

/** The college the row starts on: the catalogue entry named like the saved school. */
export function initialCollegeId(row: EducationRow, colleges: CollegeOption[]): string {
  const name = row.initial?.collegeName;
  if (!name) return "";
  return colleges.find((c) => lower(c.name) === lower(name))?.id ?? "";
}

function applyBatchChange(row: EducationRow): EducationRow {
  return { ...row, hidden: { ...row.hidden, batchRange: row.batch || "" } };
}

function applyDepartmentChange(row: EducationRow, isInitial: boolean): EducationRow {
  if (!row.department) {
    return {
      ...row,
      hidden: { ...row.hidden, department: "", departmentId: "", batchRange: "" },
      batchEnabled: false,
      batch: "",
    };
  }
  const department = departmentsOf(row).find((d) => String(d.id) === row.department) ?? null;
  const batches = (Array.isArray(department?.batches) ? department.batches : []).map(batchRangeLabel).filter(Boolean);
  const wanted = isInitial ? row.initial?.batchRange || "" : "";
  const next: EducationRow = {
    ...row,
    hidden: { ...row.hidden, department: department?.name || "", departmentId: row.department },
    batchEnabled: true,
    batch: wanted && batches.includes(wanted) ? wanted : "",
  };
  return applyBatchChange(next);
}

/**
 * Degree changed. Clearing it clears the department and batch, but (as in the
 * original) not the saved department id.
 */
function applyDegreeChange(row: EducationRow, isInitial: boolean): EducationRow {
  if (!row.degree) {
    return {
      ...row,
      hidden: { ...row.hidden, degree: "", degreeId: "", department: "", batchRange: "" },
      departmentEnabled: false,
      department: "",
      batchEnabled: false,
      batch: "",
    };
  }
  const degree = row.degrees.find((d) => String(d.id) === row.degree) ?? null;
  const departments = Array.isArray(degree?.departments) ? degree.departments : [];
  const wantedName = isInitial ? row.initial?.departmentName : "";
  const match = wantedName ? departments.find((d) => upper(d.name) === upper(wantedName)) : undefined;
  const next: EducationRow = {
    ...row,
    hidden: { ...row.hidden, degree: degree?.name || "", degreeId: row.degree },
    departmentEnabled: true,
    department: match ? String(match.id) : "",
  };
  return applyDepartmentChange(next, isInitial);
}

/**
 * College select changed (synchronous part). Returns whether the college's
 * details must now be loaded.
 */
function applyCollegeChange(row: EducationRow, colleges: CollegeOption[]): EducationRow {
  if (!row.college) {
    return {
      ...row,
      hidden: { ...row.hidden, school: "", collegeId: "", degree: "", department: "", batchRange: "" },
      degreeEnabled: false,
      degrees: [],
      degree: "",
      departmentEnabled: false,
      department: "",
      batchEnabled: false,
      batch: "",
      initial: null,
    };
  }
  const college = colleges.find((c) => String(c.id) === row.college) ?? null;
  return { ...row, hidden: { ...row.hidden, school: college?.name || "", collegeId: row.college }, degreeEnabled: true };
}

/** The college's degrees arrived: pick the initial degree (or none) and cascade. */
function applyCollegeDetails(row: EducationRow, degrees: DegreeOption[], isInitial: boolean): EducationRow {
  const wantedName = isInitial ? row.initial?.degreeName : "";
  const match = wantedName ? degrees.find((d) => lower(d.name) === lower(wantedName)) : undefined;
  const next = applyDegreeChange({ ...row, degrees, degree: match ? String(match.id) : "" }, isInitial);
  return { ...next, initial: null };
}

/* ------------------------------------------------------------------------- */
/* Reducer                                                                   */
/* ------------------------------------------------------------------------- */

type RowList = "experiences" | "education" | "certifications" | "projects" | "publications";
type RowOf<L extends RowList> = EditorState[L][number];

export type EditorAction =
  | { type: "load"; profile: StudentProfile }
  | { type: "field"; field: BasicField; value: string }
  | { type: "add"; list: RowList }
  | { type: "remove"; list: RowList; key: number }
  | { type: "experience"; key: number; patch: Partial<Omit<ExperienceRow, "key" | "media">> }
  | { type: "media/add"; key: number }
  | { type: "media"; key: number; mediaKey: number; patch: Partial<Omit<MediaRow, "key">> }
  | { type: "media/remove"; key: number; mediaKey: number }
  | { type: "certification"; key: number; patch: Partial<Omit<CertificationRow, "key">> }
  | { type: "project"; key: number; patch: Partial<Omit<PortfolioRow, "key">> }
  | { type: "publication"; key: number; patch: Partial<Omit<PublicationRow, "key">> }
  | { type: "education"; key: number; patch: Partial<Pick<EducationRow, "section" | "semester" | "regno" | "grade" | "activities" | "description">> }
  /** This row's `await loadCollegesList()` resolved: fill the options, select the saved college. */
  | { type: "education/colleges"; key: number; colleges: CollegeOption[] }
  | { type: "education/college"; key: number; value: string }
  /** GET /api/colleges/{college} resolved for a still-current request. */
  | { type: "education/details"; key: number; college: string; degrees: DegreeOption[]; initial: boolean }
  | { type: "education/degree"; key: number; value: string }
  | { type: "education/department"; key: number; value: string }
  | { type: "education/batch"; key: number; value: string };

function updateRow<L extends RowList>(state: EditorState, list: L, key: number, fn: (row: RowOf<L>) => RowOf<L>): EditorState {
  const rows = state[list] as RowOf<L>[];
  if (!rows.some((r) => r.key === key)) return state;
  return { ...state, [list]: rows.map((r) => (r.key === key ? fn(r) : r)) };
}

function updateEducation(state: EditorState, key: number, fn: (row: EducationRow) => EducationRow): EditorState {
  return updateRow(state, "education", key, fn);
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  let seq = state.seq;
  const next = () => ++seq;

  switch (action.type) {
    case "load": {
      const data = action.profile;
      const loaded: EditorState = {
        ...state,
        fields: fieldsFrom(data),
        experiences: (Array.isArray(data.experiences) ? data.experiences : []).map((e) => experienceFrom(next, e ?? {})),
        education: (Array.isArray(data.education_entries) ? data.education_entries : []).map((e) => educationFrom(next, e ?? {})),
        certifications: (Array.isArray(data.certification_entries) ? data.certification_entries : []).map((e) =>
          certificationFrom(next, e ?? {}),
        ),
        projects: (Array.isArray(data.portfolio_projects) ? data.portfolio_projects : []).map((e) => portfolioFrom(next, e ?? {})),
        publications: (Array.isArray(data.publication_entries) ? data.publication_entries : []).map((e) =>
          publicationFrom(next, e ?? {}),
        ),
      };
      return refreshAssociations({ ...loaded, seq });
    }

    case "field":
      return { ...state, fields: { ...state.fields, [action.field]: action.value } };

    case "add": {
      switch (action.list) {
        case "experiences":
          return { ...state, experiences: [...state.experiences, experienceFrom(next)], seq };
        case "education":
          return { ...state, education: [...state.education, educationFrom(next)], seq };
        case "certifications":
          return { ...state, certifications: [...state.certifications, certificationFrom(next)], seq };
        case "projects":
          return refreshAssociations({ ...state, projects: [...state.projects, portfolioFrom(next)], seq });
        case "publications":
          return { ...state, publications: [...state.publications, publicationFrom(next)], seq };
      }
      return state;
    }

    case "remove": {
      const rows = state[action.list] as { key: number }[];
      const removed = { ...state, [action.list]: rows.filter((r) => r.key !== action.key) } as EditorState;
      // Removing an experience or education row refreshes the project links; the others do not.
      return action.list === "experiences" || action.list === "education" ? refreshAssociations(removed) : removed;
    }

    case "experience":
      return updateRow(state, "experiences", action.key, (row) => {
        const updated = { ...row, ...action.patch };
        // "Currently here" clears and disables the end date.
        return updated.isCurrent ? { ...updated, endDate: "" } : updated;
      });

    case "media/add":
      return {
        ...updateRow(state, "experiences", action.key, (row) => ({ ...row, media: [...row.media, mediaFrom(next())] })),
        seq,
      };

    case "media":
      return updateRow(state, "experiences", action.key, (row) => ({
        ...row,
        media: row.media.map((m) => (m.key === action.mediaKey ? { ...m, ...action.patch } : m)),
      }));

    case "media/remove":
      return updateRow(state, "experiences", action.key, (row) => ({ ...row, media: row.media.filter((m) => m.key !== action.mediaKey) }));

    case "certification":
      return updateRow(state, "certifications", action.key, (row) => {
        const updated = { ...row, ...action.patch };
        return updated.noExpiry ? { ...updated, expiry: "" } : updated;
      });

    case "project":
      return updateRow(state, "projects", action.key, (row) => ({ ...row, ...action.patch }));

    case "publication":
      return updateRow(state, "publications", action.key, (row) => ({ ...row, ...action.patch }));

    case "education":
      return updateEducation(state, action.key, (row) => ({ ...row, ...action.patch }));

    case "education/colleges": {
      const colleges = action.colleges;
      const withRow = updateEducation({ ...state, colleges }, action.key, (row) => {
        const filled = { ...row, collegesFilled: true, college: initialCollegeId(row, colleges) };
        return applyCollegeChange(filled, colleges);
      });
      const row = withRow.education.find((r) => r.key === action.key);
      // No college selected: the cascade is cleared and the links refresh right away.
      return row && !row.college ? refreshAssociations(withRow) : withRow;
    }

    case "education/college": {
      const updated = updateEducation(state, action.key, (row) => applyCollegeChange({ ...row, college: action.value }, state.colleges));
      return action.value ? updated : refreshAssociations(updated);
    }

    case "education/details": {
      const row = state.education.find((r) => r.key === action.key);
      if (!row || row.college !== action.college) return state;
      return refreshAssociations(updateEducation(state, action.key, (r) => applyCollegeDetails(r, action.degrees, action.initial)));
    }

    case "education/degree":
      return updateEducation(state, action.key, (row) => applyDegreeChange({ ...row, degree: action.value }, false));

    case "education/department":
      return updateEducation(state, action.key, (row) => applyDepartmentChange({ ...row, department: action.value }, false));

    case "education/batch":
      return updateEducation(state, action.key, (row) => applyBatchChange({ ...row, batch: action.value }));
  }
  return state;
}

/* ------------------------------------------------------------------------- */
/* PUT /api/profile/me payload                                               */
/* ------------------------------------------------------------------------- */

const orNull = (v: string) => v || null;
const trimmedOrNull = (v: string) => v.trim() || null;

function experienceInput(row: ExperienceRow): ExperienceEntryInput | null {
  const title = row.title.trim();
  const start = row.startDate;
  if (!title || !start) return null;
  const media = row.media
    .map((m) => {
      const url = m.url.trim();
      if (!url) return null;
      return { title: trimmedOrNull(m.title), url, kind: m.kind || "link" };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);
  return {
    id: orNull(row.id),
    title,
    employment_type: orNull(row.employmentType),
    company: trimmedOrNull(row.company),
    company_logo_url: trimmedOrNull(row.companyLogo),
    location: trimmedOrNull(row.location),
    location_type: orNull(row.locationType),
    start_date: start || null,
    end_date: row.isCurrent ? null : orNull(row.endDate),
    is_current: row.isCurrent,
    description: trimmedOrNull(row.description),
    media,
  };
}

function educationInput(row: EducationRow): EducationEntryInput | null {
  const school = row.hidden.school.trim();
  if (!school) return null;
  const semesterRaw = row.semester.trim();
  const semester = semesterRaw ? parseInt(semesterRaw, 10) : null;
  return {
    id: orNull(row.id),
    school,
    degree: trimmedOrNull(row.hidden.degree),
    department: trimmedOrNull(row.hidden.department),
    batch_range: orNull(row.hidden.batchRange),
    regno: trimmedOrNull(row.regno),
    current_semester: semester !== null && Number.isFinite(semester) && semester > 0 ? semester : null,
    grade: trimmedOrNull(row.grade),
    activities: trimmedOrNull(row.activities),
    description: trimmedOrNull(row.description),
    college_id: trimmedOrNull(row.hidden.collegeId),
    degree_id: trimmedOrNull(row.hidden.degreeId),
    department_id: trimmedOrNull(row.hidden.departmentId),
    batch_id: trimmedOrNull(row.hidden.batchId),
    section: (row.section || "").trim() || null,
  };
}

function certificationInput(row: CertificationRow): CertificationEntryInput | null {
  const name = row.name.trim();
  if (!name) return null;
  return {
    id: orNull(row.id),
    name,
    issuing_org: trimmedOrNull(row.org),
    issue_date: orNull(row.issue),
    expiration_date: row.noExpiry ? null : orNull(row.expiry),
    does_not_expire: row.noExpiry,
    credential_id: trimmedOrNull(row.credentialId),
    credential_url: trimmedOrNull(row.credentialUrl),
    description: trimmedOrNull(row.description),
  };
}

function portfolioInput(row: PortfolioRow): PortfolioProjectInput | null {
  const name = row.name.trim();
  if (!name) return null;
  return {
    id: orNull(row.id),
    name,
    associated_experience_id: orNull(row.experience),
    associated_education_id: orNull(row.education),
    start_date: orNull(row.start),
    end_date: orNull(row.end),
    url: trimmedOrNull(row.url),
    description: trimmedOrNull(row.description),
    tech_stack: parseList(row.stack),
    team: parseList(row.team).map((member) => ({ name: member })),
  };
}

function publicationInput(row: PublicationRow): PublicationEntryInput | null {
  const title = row.title.trim();
  if (!title) return null;
  return {
    id: orNull(row.id),
    title,
    publisher: trimmedOrNull(row.publisher),
    publication_date: orNull(row.date),
    authors: parseList(row.authors),
    url: trimmedOrNull(row.url),
    abstract: trimmedOrNull(row.abstract),
  };
}

const present = <T>(v: T | null): v is T => v !== null;

/** The original submit handler's payload, key for key. */
export function buildEditPayload(state: EditorState): ProfileUpdatePayload {
  const f = state.fields;
  return {
    name: orNull(f.name),
    phone: f.phone.replace(/\D/g, "") || null,
    headline: orNull(f.headline),
    location: orNull(f.location),
    dob: orNull(f.dob),
    bio: orNull(f.bio),
    linkedin: orNull(f.linkedin),
    github: orNull(f.github),
    leetcode: orNull(f.leetcode),
    portfolio_url: orNull(f.portfolio),
    website: orNull(f.website),
    twitter: orNull(f.twitter),
    instagram: orNull(f.instagram),
    medium: orNull(f.medium),
    specializations: parseList(f.specs),
    technologies: orNull(f.technologies),
    skills: orNull(f.skills),
    certifications: orNull(f.certifications),
    languages: orNull(f.languages),
    interests: orNull(f.interests),
    achievements: orNull(f.achievements),
    experience: orNull(f.experience),
    publications: orNull(f.publications),
    project_info: orNull(f.projectInfo),
    experiences: state.experiences.map(experienceInput).filter(present),
    education_entries: state.education.map(educationInput).filter(present),
    certification_entries: state.certifications.map(certificationInput).filter(present),
    portfolio_projects: state.projects.map(portfolioInput).filter(present),
    publication_entries: state.publications.map(publicationInput).filter(present),
  };
}

/** Avatar initials: first letters of the first two words, upper-cased ('U' when empty). */
export function initialsFor(name: unknown): string {
  if (!name) return "U";
  const parts = String(name).trim().split(/\s+/).slice(0, 2);
  return parts.map((x) => x[0]?.toUpperCase()).join("") || "U";
}
