/** Request/response shapes used by the authentication pages. */

/** Body of `POST /login` and `POST /signup`. */
export interface CredentialsPayload {
  email: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
  turnstile_token: string;
}

/** Fields the pages read from a login / signup / refresh response. */
export interface AuthTokenResponse {
  access_token?: string;
  refresh_token?: string;
  detail?: unknown;
  message?: unknown;
  error?: unknown;
  /** Non-JSON bodies are kept here by `safeJson`. */
  raw?: string;
}

/** `GET /api/public/supabase`. */
export interface SupabasePublicConfig {
  url?: string;
  anonKey?: string;
}

/** `GET /api/teacher/me/status`. */
export interface TeacherStatusResponse {
  role?: string;
  status?: string;
}

export interface AcademicCollege {
  id: string;
  name: string;
}

export interface AcademicDegree {
  id: string;
  name: string;
  college_id?: string;
}

export interface AcademicDepartment {
  id: string;
  name: string;
  college_id?: string;
  degree_id?: string;
}

/** `GET /api/public/academic-meta`. */
export interface AcademicMeta {
  colleges?: AcademicCollege[];
  degrees?: AcademicDegree[];
  departments?: AcademicDepartment[];
}

/** One primary-navigation link of the auth header. */
export interface AuthNavLink {
  label: string;
  href: string;
  /** Extra classes (e.g. the emphasised "Apply" link). */
  className?: string;
}
