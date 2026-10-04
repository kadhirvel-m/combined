/**
 * Student profile shapes (GET /api/me → `profile`, PUT /api/profile/me body)
 * as read by profile.html and profile_edit.html. Every field is optional: the
 * backend returns nulls for anything the student has not filled in.
 */

export interface MediaItem {
  url?: string | null;
  title?: string | null;
  /** link | document | video | image | presentation (profile_edit.html). */
  kind?: string | null;
  [key: string]: unknown;
}

export interface ExperienceEntry {
  id?: string | null;
  title?: string | null;
  company?: string | null;
  company_logo_url?: string | null;
  employment_type?: string | null;
  location?: string | null;
  location_type?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_current?: boolean | null;
  description?: string | null;
  media?: MediaItem[] | null;
  [key: string]: unknown;
}

export interface EducationEntry {
  id?: string | null;
  school?: string | null;
  degree?: string | null;
  department?: string | null;
  batch_range?: string | null;
  current_semester?: number | string | null;
  regno?: string | null;
  section?: string | null;
  grade?: string | null;
  activities?: string | null;
  description?: string | null;
  college_id?: string | null;
  degree_id?: string | null;
  department_id?: string | null;
  batch_id?: string | null;
  /** Legacy fields still present on older rows. */
  field_of_study?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  [key: string]: unknown;
}

export interface CertificationEntry {
  id?: string | null;
  name?: string | null;
  issuing_org?: string | null;
  issue_date?: string | null;
  expiration_date?: string | null;
  does_not_expire?: boolean | null;
  credential_id?: string | null;
  credential_url?: string | null;
  description?: string | null;
  [key: string]: unknown;
}

export interface TeamMember {
  name?: string | null;
  [key: string]: unknown;
}

export interface PortfolioProject {
  id?: string | null;
  name?: string | null;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  url?: string | null;
  tech_stack?: string[] | null;
  team?: TeamMember[] | null;
  /** Experience / education row ids the project is linked to (profile_edit.html). */
  associated_experience_id?: string | null;
  associated_education_id?: string | null;
  [key: string]: unknown;
}

export interface PublicationEntry {
  id?: string | null;
  title?: string | null;
  publisher?: string | null;
  publication_date?: string | null;
  authors?: string[] | null;
  abstract?: string | null;
  url?: string | null;
  [key: string]: unknown;
}

export interface StudentProfile {
  id?: string;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  headline?: string | null;
  location?: string | null;
  dob?: string | null;
  bio?: string | null;
  profile_image_url?: string | null;
  resume_url?: string | null;
  verification_score?: number | string | null;
  linkedin?: string | null;
  github?: string | null;
  leetcode?: string | null;
  portfolio_url?: string | null;
  website?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  medium?: string | null;
  specializations?: string[] | string | null;
  technologies?: string | null;
  skills?: string | null;
  certifications?: string | null;
  languages?: string | null;
  interests?: string | null;
  achievements?: string | null;
  experience?: string | null;
  publications?: string | null;
  project_info?: string | null;
  experiences?: ExperienceEntry[] | null;
  education_entries?: EducationEntry[] | null;
  certification_entries?: CertificationEntry[] | null;
  portfolio_projects?: PortfolioProject[] | null;
  publication_entries?: PublicationEntry[] | null;
  college?: { id?: string; name?: string | null; [key: string]: unknown } | string | null;
  batch?: { from?: number | string | null; to?: number | string | null; [key: string]: unknown } | null;
  [key: string]: unknown;
}

/** GET /api/me */
export interface MeResponse {
  profile?: StudentProfile | null;
  [key: string]: unknown;
}

/** Education row as sent in PUT /api/profile/me. */
export interface EducationEntryInput {
  id: string | null;
  school: string;
  degree: string | null;
  department: string | null;
  batch_range: string | null;
  regno: string | null;
  current_semester: number | null;
  grade: string | null;
  activities: string | null;
  description: string | null;
  college_id: string | null;
  degree_id: string | null;
  department_id: string | null;
  batch_id: string | null;
  section: string | null;
}

/** Experience row as sent in PUT /api/profile/me by profile_edit.html. */
export interface ExperienceEntryInput {
  id: string | null;
  title: string;
  employment_type: string | null;
  company: string | null;
  company_logo_url: string | null;
  location: string | null;
  location_type: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  media: { title: string | null; url: string; kind: string }[];
}

/** Certification row as sent in PUT /api/profile/me. */
export interface CertificationEntryInput {
  id: string | null;
  name: string;
  issuing_org: string | null;
  issue_date: string | null;
  expiration_date: string | null;
  does_not_expire: boolean;
  credential_id: string | null;
  credential_url: string | null;
  description: string | null;
}

/** Portfolio project as sent in PUT /api/profile/me. */
export interface PortfolioProjectInput {
  id: string | null;
  name: string;
  associated_experience_id: string | null;
  associated_education_id: string | null;
  start_date: string | null;
  end_date: string | null;
  url: string | null;
  description: string | null;
  tech_stack: string[];
  team: { name: string }[];
}

/** Publication as sent in PUT /api/profile/me. */
export interface PublicationEntryInput {
  id: string | null;
  title: string;
  publisher: string | null;
  publication_date: string | null;
  authors: string[];
  url: string | null;
  abstract: string | null;
}

/** POST /api/profile/upload `kind` form field. */
export type ProfileAssetKind = "image" | "resume";

/** PUT /api/profile/me body (the full editable profile). */
export interface ProfileUpdatePayload {
  name: string | null;
  phone: string | null;
  headline: string | null;
  location: string | null;
  dob: string | null;
  bio: string | null;
  linkedin: string | null;
  github: string | null;
  leetcode: string | null;
  portfolio_url: string | null;
  website: string | null;
  twitter: string | null;
  instagram: string | null;
  medium: string | null;
  specializations: string[];
  technologies: string | null;
  skills: string | null;
  certifications: string | null;
  languages: string | null;
  interests: string | null;
  achievements: string | null;
  experience: string | null;
  publications: string | null;
  project_info: string | null;
  experiences: (ExperienceEntryInput | ExperienceEntry)[];
  education_entries: (EducationEntryInput | EducationEntry)[];
  certification_entries: (CertificationEntryInput | CertificationEntry)[];
  portfolio_projects: (PortfolioProjectInput | PortfolioProject)[];
  publication_entries: (PublicationEntryInput | PublicationEntry)[];
}

/** GET /api/me/devices → `devices[]` */
export interface DeviceSession {
  session_id?: string | null;
  family_id?: string | null;
  device_model?: string | null;
  device_type?: string | null;
  ip?: string | null;
  last_login?: string | null;
  last_active?: string | null;
  browser?: string | null;
  os?: string | null;
  location?: string | null;
  is_current?: boolean | null;
  [key: string]: unknown;
}

export type DeviceSignOutRequest =
  | { action: "current" }
  | { action: "others" }
  | { action: "session"; session_id: string; family_id: string };

/** GET /api/colleges item (only rows with id and name are kept). */
export interface CollegeOption {
  id: string;
  name: string;
}

export interface BatchOption {
  id?: string;
  from?: number | string | null;
  to?: number | string | null;
  from_year?: number | string | null;
  to_year?: number | string | null;
}

export interface DepartmentOption {
  id: string;
  name: string;
  batches?: BatchOption[] | null;
}

export interface DegreeOption {
  id: string;
  name: string;
  departments?: DepartmentOption[] | null;
}

/** GET /api/colleges/{id} */
export interface CollegeDetail {
  id: string;
  name: string;
  degrees?: DegreeOption[] | null;
  [key: string]: unknown;
}
