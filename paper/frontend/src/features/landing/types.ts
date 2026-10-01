/** One row of `GET /api/leaderboard` (the page reads only these fields). */
export interface LeaderboardEntry {
  name?: string | null;
  profile_image_url?: string | null;
  current_streak?: number | string | null;
}

export interface LeaderboardResponse {
  leaderboard?: LeaderboardEntry[] | null;
}

/** `GET /api/teacher/me/status` */
export interface TeacherStatusResponse {
  role?: string | null;
}

/** Profile fields shared by `/api/teacher/profile/me` and `/api/hod/me`. */
export interface RoleProfile {
  name?: string | null;
  full_name?: string | null;
  username?: string | null;
  profile_image_url?: string | null;
  logo_url?: string | null;
  avatar_url?: string | null;
}

/** `GET /api/public/supabase` */
export interface SupabasePublicConfig {
  url?: string;
  anonKey?: string;
}

/** Which call-to-action the hero shows. */
export type LandingCta = "loading" | "signed-out" | "student" | "hod" | "teacher";

export interface LandingSessionState {
  cta: LandingCta;
  teacherProfile: RoleProfile | null;
  hodProfile: RoleProfile | null;
}
