/**
 * Shared shapes for the classic runtime scripts (public/config.js, public/auth.js).
 *
 * These types describe what the legacy code *expects*; they never narrow values
 * at runtime. The port keeps the original property reads (e.g. `profile.name ||
 * profile.full_name`) byte-for-byte, so data from JSON/storage is cast to these
 * shapes instead of being validated, exactly like the untyped originals.
 */

export type PxThemeName = 'dark' | 'light';

/** `window.Theme` (config.js theme manager). */
export interface PxThemeApi {
  /** Stored `px_theme` value, else `'dark'`/`'light'` from the `<html>` class. */
  get(): string;
  /** Anything other than `'dark'` applies light. Returns the applied theme. */
  set(val: unknown): PxThemeName;
  toggle(): PxThemeName;
  init(): void;
}

/**
 * Profile snapshot consumed by the navbar (`window.__PX_PROFILE_SNAPSHOT`,
 * `window.__PX_NAV_APPLY(profile)`). Pages may attach arbitrary extra fields.
 */
export interface PxNavProfile {
  name?: string | null;
  full_name?: string | null;
  username?: string | null;
  logo_url?: string | null;
  profile_image_url?: string | null;
  avatar_url?: string | null;
  shop?: unknown;
  [key: string]: unknown;
}
