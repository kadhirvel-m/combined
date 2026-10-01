/**
 * Window globals read and written by the classic runtime scripts that
 * scripts/build-runtime.mjs generates from src/runtime (public/config.js and
 * public/auth.js). Legacy pages rely on these names directly, e.g.
 * `window.toggleTheme()`, `window.Theme.get()`, `window.escapeHtml(...)`,
 * `window.__PX_NAV_APPLY(profile)`.
 *
 * Everything is optional: a page may run before config.js/auth.js, or set some
 * of these itself before the scripts load (API_BASE, __PX_PROFILE_SNAPSHOT,
 * AUTH_CSRF_COOKIE_NAME, toggleTheme, __PX_CLOSE_MOBILE_NAV, ...).
 */
import type { PxNavProfile, PxThemeApi } from './types';

declare global {
  interface Window {
    // --- config.js: API base resolution --------------------------------------
    /** Backend API origin (no trailing slash). A page may preset it before config.js. */
    API_BASE?: string;
    /** Mirror of API_BASE written by config.js. */
    __API_BASE?: string;

    // --- config.js: HTML sanitizer ------------------------------------------
    /** Only installed when the page has not defined its own. */
    escapeHtml?: (value: unknown) => string;
    /** Only installed when the page has not defined its own. */
    sanitizeHtml?: (raw: unknown) => string;

    // --- config.js: auth shim -----------------------------------------------
    /** Runs the shared /refresh flow when the tab looks authenticated. */
    __PX_ENSURE_AUTH_READY?: () => Promise<boolean>;
    /** CSRF cookie name override; defaults to `paperx_csrf`. */
    AUTH_CSRF_COOKIE_NAME?: string;

    // --- config.js: theme manager -------------------------------------------
    Theme?: PxThemeApi;
    /** Back-compat for `onclick="toggleTheme()"`; kept if a page defined its own first. */
    toggleTheme?: () => unknown;

    // --- config.js: TuNe AI ---------------------------------------------------
    __TUNE_AI_ENABLED?: boolean;
    __CHAT_API_BASE?: string;

    // --- auth.js: navbar auth UI ---------------------------------------------
    __PX_NAV_APPLY?: (profile: PxNavProfile | null | undefined) => void;
    __PX_PROFILE_SNAPSHOT?: PxNavProfile;
    __PX_AUTH_INIT_DONE?: boolean;
    /** Optional page hook invoked before the sign-out redirect. */
    __PX_CLOSE_MOBILE_NAV?: () => void;

    // --- Idempotency guards for the generated bundles -------------------------
    /** Set by public/config.js; a second execution on the same page is a no-op. */
    __PX_RUNTIME_CONFIG_INSTALLED?: boolean;
    /** Set by public/auth.js; a second execution on the same page is a no-op. */
    __PX_RUNTIME_AUTH_INSTALLED?: boolean;
  }
}

export {};
