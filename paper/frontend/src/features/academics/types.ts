/** Response/request shapes used by the Academics hub (see ../../main.py). */

export interface SyllabusTopic {
  id: string | null;
  topic: string;
  order_in_unit?: number | null;
  image_url?: string | null;
  lab_url?: string | null;
}

export interface SyllabusUnit {
  id?: string | null;
  unit_id?: string | null;
  unit_title?: string | null;
  title?: string | null;
  order_in_course?: number | null;
  topics?: SyllabusTopic[];
}

export interface SyllabusCourse {
  id?: string | null;
  course_id?: string | null;
  subject_id?: string | null;
  course_code?: string | null;
  title?: string | null;
  semester?: string | number | null;
  type?: string | null;
  course_type?: string | null;
  subject_type?: string | null;
  units?: SyllabusUnit[];
}

export interface NamedRef {
  id?: string | null;
  name?: string | null;
}

export interface EducationEntry {
  id?: string | null;
  school?: string | null;
  degree?: string | null;
  department?: string | null;
  batch_range?: string | null;
  section?: string | null;
  current_semester?: number | string | null;
  regno?: string | null;
  [key: string]: unknown;
}

/** `profile` of GET /api/me. */
export interface AcademicProfile {
  id?: string;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  semester?: number | string | null;
  regno?: string | null;
  profile_image_url?: string | null;
  degree_stream?: string | null;
  college?: NamedRef | string | null;
  department?: NamedRef | string | null;
  batch?: { id?: string | null; from?: number | null; to?: number | null } | null;
  education_entries?: EducationEntry[];
  specializations?: string[] | string | null;
  experiences?: unknown[];
  certification_entries?: unknown[];
  portfolio_projects?: unknown[];
  publication_entries?: unknown[];
  [key: string]: unknown;
}

export interface MeResponse {
  profile?: AcademicProfile | null;
  syllabus?: SyllabusCourse[];
}

export interface TeacherNote {
  id: string | number;
  title?: string | null;
  price_cents?: number | null;
  seller?: { name?: string | null } | null;
  updated_at?: string | null;
  created_at?: string | null;
}

export interface WeekDay {
  day: string;
  date: number;
  is_today: boolean;
  is_active: boolean;
  is_future: boolean;
}

/** GET /api/streak (StreakResponse). */
export interface StreakData {
  current_streak?: number;
  longest_streak?: number;
  last_activity_date?: string | null;
  next_milestone?: number;
  prev_milestone?: number;
  milestone_progress?: number;
  days_completed?: number;
  week_data?: WeekDay[];
}

/** POST /api/access/check-and-consume response. */
export interface AccessDecision {
  allowed?: boolean;
  reason?: string | null;
  detail?: string | null;
  remaining?: number | null;
}

export interface TopicSuggestion {
  id?: string | number;
  topic?: string;
}

export interface CollegeDepartment {
  id: string | number;
  name: string;
  batches?: { from?: number | null; to?: number | null; from_year?: number | null; to_year?: number | null }[];
}

export interface CollegeDegree {
  id: string | number;
  name: string;
  departments?: CollegeDepartment[];
}

export interface CollegeDetails {
  id?: string;
  name?: string;
  degrees?: CollegeDegree[];
}

/** Everything the explorer renders, as produced by the load pipeline. */
export interface SyllabusBundle {
  courses: SyllabusCourse[];
  teacherNotes: Map<string, TeacherNote[]>;
  unitBlink: Map<string, boolean>;
  ratings: Map<string, number>;
  labx: Map<string, boolean>;
}

/** KPI values (computed once per load, like the original). */
export interface AggregateStats {
  done: number;
  total: number;
  courses: number;
  completion: number;
}
