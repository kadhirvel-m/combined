/*
 * Paper X Navbar Auth/UI Helper
 * -------------------------------------------------
 * Responsibilities:
 * 1. Detect login state via secure auth cookie bridge (legacy localStorage lookups are shimmed).
 * 2. (Optional) Load lightweight /api/me snapshot if not already exposed by another page.
 * 3. Toggle visibility of:
 *    - Login / Signup buttons (hide when logged in)
 *    - Profile avatar (show when logged in)
 *    - Sign out buttons (show when logged in)
 * 4. Provide global hook window.__PX_NAV_APPLY(profile) to allow profile pages to push user data
 *    so other pages (already loaded) can update avatar.
 * 5. Gracefully fallback to initials avatar if no image.
 *
 * Usage:
 *  - Include this script AFTER the navbar markup on every page that needs dynamic auth UI.
 *  - Ensure navbar contains elements with the following (optional) IDs / data attributes:
 *      #navProfile              Anchor to profile page wrapping avatar/initials
 *      #navProfileImg           <img> inside #navProfile
 *      #navProfileInitial       Span for initials fallback
 *      #signOutBtn              Desktop signout button (optional)
 *      #navProfileMobile        Mobile "My profile" link
 *      #signOutBtnMobile        Mobile signout button
 *      Elements for login/signup detection: any <a> (or button) whose href ends with 'login.html' or 'signup.html'.
 *  - If a page already fetched profile data it can assign window.__PX_PROFILE_SNAPSHOT BEFORE this script loads
 *    or call window.__PX_NAV_APPLY(profile) afterwards.
 */
import { PROD_API_BASE } from '../env';
import type { PxNavProfile } from '../types';

type SessionKind = 'teacher' | 'user' | null;

interface ActiveSession {
  kind: SessionKind;
  token: string | null;
}

/** GET /api/me or /api/teacher/profile/me body (profile may be nested or top-level). */
interface ProfileEnvelope extends PxNavProfile {
  teacher?: PxNavProfile | null;
  profile?: PxNavProfile | null;
}

/** GET /api/shop/me body. */
interface ShopRecord {
  name?: string | null;
  shop_name?: string | null;
  logo_url?: string | null;
  logoUrl?: string | null;
  [key: string]: unknown;
}

interface RefreshResponseBody {
  access_token?: unknown;
  refresh_token?: unknown;
  message?: unknown;
}

export function install(): void {
  const API = (window.API_BASE || PROD_API_BASE).replace(/\/$/, '');
  const USER_TOKEN_KEY = 'px_token';
  const TEACHER_TOKEN_KEY = 'teacherToken';
  const REFRESH_TOKEN_KEY = 'px_refresh_token';
  const TOKEN_EXPIRES_KEY = 'px_token_expires_at';
  const AUTH_SENTINEL = '__COOKIE_AUTH__';
  const BEARER_FALLBACK_KEY = 'paperx_bearer_fallback';
  const REFRESH_SUPPRESS_UNTIL_KEY = 'paperx_refresh_suppress_until';
  // Unused, but read at startup exactly like the original (the reads go through
  // the config.js storage shim).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tokenUser = safeGet(USER_TOKEN_KEY);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tokenTeacher = safeGet(TEACHER_TOKEN_KEY);

  function safeGet(k: string): string | null { try { return localStorage.getItem(k); } catch { return null; } }
  // Unused in the original as well; kept for parity.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function safeSet(k: string, v: string): void { try { localStorage.setItem(k, v); } catch { } }
  function safeRemove(k: string): void { try { localStorage.removeItem(k); } catch { } }
  function hasAuthStateCookie(): boolean { try { return document.cookie.indexOf('paperx_auth=') !== -1; } catch { return false; } }
  function hasAuthStateMarker(): boolean { return safeGet('paperx_session_state') === '1'; }
  function hasAuthState(): boolean { return hasAuthStateMarker() || hasAuthStateCookie(); }
  function normalizeStoredToken(v: string | null): string | null {
    if (!v) return null;
    const t = String(v).trim();
    if (!t || t === AUTH_SENTINEL) return null;
    return t;
  }

  function getUsableRefreshToken(): string | null {
    try {
      const fromSession = String(sessionStorage.getItem(REFRESH_TOKEN_KEY) || '').trim();
      if (fromSession && fromSession !== AUTH_SENTINEL && fromSession !== 'null' && fromSession !== 'undefined') {
        return fromSession;
      }
    } catch { }
    const raw = safeGet(REFRESH_TOKEN_KEY);
    if (!raw) return null;
    const tok = String(raw).trim();
    if (!tok || tok === AUTH_SENTINEL || tok === 'null' || tok === 'undefined') return null;
    return tok;
  }

  function suppressRefreshTemporarily(ms: number): void {
    try {
      const until = Date.now() + Math.max(1000, Number(ms) || 0);
      sessionStorage.setItem(REFRESH_SUPPRESS_UNTIL_KEY, String(until));
    } catch { }
  }

  function isRefreshSuppressed(): boolean {
    try {
      const raw = sessionStorage.getItem(REFRESH_SUPPRESS_UNTIL_KEY);
      const until = raw ? Number(raw) : 0;
      return Number.isFinite(until) && until > Date.now();
    } catch {
      return false;
    }
  }

  function getBearerFallbackToken(): string | null {
    try {
      const t = String(sessionStorage.getItem(BEARER_FALLBACK_KEY) || '').trim();
      if (t && t !== AUTH_SENTINEL) return t;
    } catch {
    }
    try {
      const t2 = String(localStorage.getItem(BEARER_FALLBACK_KEY) || '').trim();
      return (!t2 || t2 === AUTH_SENTINEL) ? null : t2;
    } catch {
      return null;
    }
  }

  // Auto-refresh using HttpOnly refresh cookie.
  // Only used when config.js has not installed window.__PX_ENSURE_AUTH_READY.
  async function refreshTokensIfNeeded(): Promise<boolean> {
    console.log('[Auth] Attempting cookie-based token refresh...');
    try {
      const hasCookieSession = hasAuthStateCookie();
      const refreshToken = hasCookieSession ? null : getUsableRefreshToken();
      const fallback = getBearerFallbackToken();
      const hasSessionState = hasAuthState();
      // If no token and no session signal, skip refresh attempt.
      if (!refreshToken && !hasSessionState) {
        return !!fallback || hasAuthState();
      }
      if (isRefreshSuppressed()) {
        return !!fallback || hasAuthState();
      }
      const body = refreshToken
        ? JSON.stringify({ refresh_token: refreshToken })
        : '{}';
      const res = await fetch(`${API}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body
      });
      if (!res.ok) {
        console.error('[Auth] Refresh request failed:', res.status);
        if (res.status === 429) {
          // Too many refresh attempts (often from multi-tab/page-load bursts).
          // Keep current auth state and back off briefly.
          suppressRefreshTemporarily(2 * 60 * 1000);
          return !!fallback || hasAuthState();
        }
        // Stale/invalid refresh token should be dropped to avoid endless 400 loops.
        if (res.status === 400) {
          if (!hasCookieSession) {
            try { safeRemove(REFRESH_TOKEN_KEY); } catch { }
            try { sessionStorage.removeItem(REFRESH_TOKEN_KEY); } catch { }
          }
          suppressRefreshTemporarily(5 * 60 * 1000);
        } else if (res.status === 401 || res.status === 403) {
          // If we still have cookie-auth, avoid force-clearing session markers.
          // Another tab/page may have already rotated refresh state.
          if (!hasCookieSession) {
            try { safeRemove(REFRESH_TOKEN_KEY); } catch { }
            try { sessionStorage.removeItem(REFRESH_TOKEN_KEY); } catch { }
            try { safeRemove('paperx_session_state'); } catch { }
            try { sessionStorage.removeItem(BEARER_FALLBACK_KEY); } catch { }
            try { localStorage.removeItem(BEARER_FALLBACK_KEY); } catch { }
          }
          suppressRefreshTemporarily(60 * 1000);
        }
        // Do not clear session markers/tokens here; this can cause auth bounce loops
        // in privacy-hardened browsers where refresh cookies are blocked.
        return !!fallback || hasAuthState();
      }
      const data = (await res.json()) as RefreshResponseBody | null | undefined;
      try {
        const at = String((data && data.access_token) || '').trim();
        if (at) {
          sessionStorage.setItem(BEARER_FALLBACK_KEY, at);
          localStorage.setItem(BEARER_FALLBACK_KEY, at);
        }
        const rt = String((data && data.refresh_token) || '').trim();
        if (rt && rt !== AUTH_SENTINEL) {
          sessionStorage.setItem(REFRESH_TOKEN_KEY, rt);
        }
      } catch { }
      console.log('[Auth] Token refreshed successfully.', data && data.message ? data.message : 'ok');
      return true;
    } catch {
      // Network/offline/CORS interruptions should not spam auth failures.
      console.warn('[Auth] Token refresh skipped due to network error');
      suppressRefreshTemporarily(30 * 1000);
      return false;
    }
  }

  function clearAllTokens(): void {
    safeRemove(USER_TOKEN_KEY);
    safeRemove(TEACHER_TOKEN_KEY);
    safeRemove(REFRESH_TOKEN_KEY);
    safeRemove(TOKEN_EXPIRES_KEY);
    safeRemove('paperx_session_state');
    safeRemove('paperx_session_id'); // Clear analytics session
    try { sessionStorage.removeItem(REFRESH_TOKEN_KEY); } catch { }
    try { sessionStorage.removeItem(BEARER_FALLBACK_KEY); } catch { }
    try { localStorage.removeItem(BEARER_FALLBACK_KEY); } catch { }
  }

  const el = (id: string): HTMLElement | null => document.getElementById(id);

  function resolveUiRoot(): string {
    try {
      const p = location.pathname || '';
      const i = p.indexOf('/ui/');
      if (i >= 0) return p.slice(0, i + 4); // include '/ui/'
      // Some deployments publish all UI files at the site root (no /ui prefix).
      // In that case, use '/' so profile links resolve to '/profile.html'.
      if (p === '/ui' || p.startsWith('/ui?') || p.startsWith('/ui#')) return '/ui/';
    } catch { }
    return '/';
  }

  function deriveInitials(name: string): string {
    if (!name) return 'ME';
    return name.split(/\s+/).filter(Boolean).map(p => p[0]?.toUpperCase()).slice(0, 2).join('') || 'ME';
  }

  function applyNavProfile(profile: PxNavProfile | null | undefined): void {
    if (!profile) return;
    const navProfile = el('navProfile');
    const navProfileImg = el('navProfileImg') as HTMLImageElement | null;
    const navProfileInitial = el('navProfileInitial');
    const navProfileMobile = el('navProfileMobile');
    const navProfileImgMobile = el('navProfileImgMobile') as HTMLImageElement | null;
    const navProfileInitialMobile = el('navProfileInitialMobile');
    const navProfileMobileLabel = navProfileMobile ? navProfileMobile.querySelector<HTMLElement>('[data-profile-name]') : null;
    const mobileMode = navProfileMobileLabel && navProfileMobileLabel.dataset ? navProfileMobileLabel.dataset.profileMode : null;

    const initials = deriveInitials(profile.name || profile.full_name || profile.username || '');
    if (navProfileInitial) { navProfileInitial.textContent = initials; navProfileInitial.classList.remove('hidden'); }
    if (navProfileInitialMobile) { navProfileInitialMobile.textContent = initials; navProfileInitialMobile.classList.remove('hidden'); }
    const avatar = profile.logo_url || profile.profile_image_url || profile.avatar_url;
    if (avatar && navProfileImg) {
      navProfileImg.src = avatar;
      navProfileImg.classList.remove('hidden');
      if (navProfileInitial) navProfileInitial.classList.add('hidden');
    } else if (navProfileImg) {
      navProfileImg.classList.add('hidden');
    }
    if (avatar && navProfileImgMobile) {
      navProfileImgMobile.src = avatar;
      navProfileImgMobile.classList.remove('hidden');
      if (navProfileInitialMobile) navProfileInitialMobile.classList.add('hidden');
    } else if (navProfileImgMobile) {
      navProfileImgMobile.classList.add('hidden');
      if (navProfileInitialMobile) navProfileInitialMobile.classList.remove('hidden');
    }
    const titleName = profile.name || profile.full_name || 'Profile';
    if (navProfile) { navProfile.classList.remove('hidden'); navProfile.setAttribute('title', titleName); }
    if (navProfileMobile) {
      navProfileMobile.classList.remove('hidden');
      if (navProfileMobileLabel) {
        if (mobileMode === 'initials') {
          navProfileMobileLabel.textContent = initials || 'ME';
        } else {
          const first = (titleName || '').split(/\s+/).filter(Boolean)[0];
          navProfileMobileLabel.textContent = first ? `Hi, ${first}` : 'My profile';
        }
      }
    }
  }

  function activeSession(): ActiveSession {
    // If both legacy real tokens exist, prefer teacher and clear user token.
    // Cookie sentinel must never force teacher mode.
    const tUser = normalizeStoredToken(safeGet('px_token'));
    const tTeach = normalizeStoredToken(safeGet('teacherToken'));
    if (tTeach && tUser) {
      try { localStorage.removeItem('px_token'); } catch { }
    }
    if (tTeach) return { kind: 'teacher', token: tTeach };
    if (tUser) return { kind: 'user', token: tUser };
    const fb = getBearerFallbackToken();
    if (fb) return { kind: 'user', token: fb };
    if (hasAuthState()) return { kind: 'user', token: AUTH_SENTINEL };
    return { kind: null, token: null };
  }

  // `session` is unused, as in the original.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function resolveCustomProfileHref(node: HTMLElement | null, root: string, session: ActiveSession): string | null {
    if (!node || node.tagName !== 'A') return null;
    const custom = node.getAttribute('data-profile-link');
    if (!custom) return null;
    if (/^https?:\/\//i.test(custom)) return custom;
    if (custom.startsWith('/')) return custom;
    return root + custom.replace(/^\//, '');
  }

  function setProfileLinks(): void {
    const root = resolveUiRoot();
    const session = activeSession();
    const href = session.kind === 'teacher' ? (root + 'teacher_profile.html?user=me') : (root + 'profile.html');
    const a1 = el('navProfile');
    const a2 = el('navProfileMobile');
    if (a1 && a1.tagName === 'A') (a1 as HTMLAnchorElement).href = resolveCustomProfileHref(a1, root, session) || href;
    if (a2 && a2.tagName === 'A') (a2 as HTMLAnchorElement).href = resolveCustomProfileHref(a2, root, session) || href;
  }

  function wantsShopProfile(): boolean {
    return [el('navProfile'), el('navProfileMobile')].filter(Boolean).some(node => {
      if (!node || typeof node.getAttribute !== 'function') return false;
      return node.getAttribute('data-profile-source') === 'shop';
    });
  }

  window.__PX_NAV_APPLY = applyNavProfile; // expose globally so profile page can re-use

  function hideAuthButtons(): void {
    document.querySelectorAll('a[href$="login.html"], a[href$="signup.html"]').forEach(a => a.classList.add('hidden'));
  }
  function showAuthButtons(): void {
    document.querySelectorAll('a[href$="login.html"], a[href$="signup.html"]').forEach(a => a.classList.remove('hidden'));
  }
  function showSessionUI(): void {
    [el('navProfile'), el('navProfileMobile')].forEach(n => {
      if (!n) return;
      n.classList.remove('hidden');
      if (!n.classList.contains('inline-flex') && !n.classList.contains('flex')) {
        // Use inline-flex for compact alignment unless developer overrides
        n.classList.add('inline-flex');
      }
    });
    [el('signOutBtn'), el('signOutBtnMobile')].forEach(n => {
      if (!n) return;
      n.classList.remove('hidden');
      if (!n.classList.contains('inline-flex') && !n.classList.contains('flex')) {
        n.classList.add('inline-flex');
      }
    });
  }
  function hideSessionUI(): void {
    [el('navProfile'), el('navProfileMobile'), el('signOutBtn'), el('signOutBtnMobile')].forEach(n => {
      if (!n) return;
      n.classList.add('hidden');
      // Do not remove display class so that once authenticated it remains consistent
    });
  }

  function handleSignOut(ev?: Event): void {
    if (ev) ev.preventDefault();
    const session = activeSession();
    const root = resolveUiRoot();
    const path = String(location.pathname || '').toLowerCase();
    const isTeacherSurface = path.includes('/teachers/') || path.includes('teacher_');
    const signOutRedirect = (session.kind === 'teacher' || isTeacherSurface)
      ? (root + 'teachers/teacher_login.html')
      : (root + 'login.html');
    fetch(`${API}/logout`, { method: 'POST', credentials: 'include' })
      .catch(() => null)
      .finally(() => {
        clearAllTokens();
        if (typeof window.__PX_CLOSE_MOBILE_NAV === 'function') { window.__PX_CLOSE_MOBILE_NAV(); }
        window.location.href = signOutRedirect;
      });
  }

  function attachSignOutHandlers(): void {
    [el('signOutBtn'), el('signOutBtnMobile')].forEach(btn => {
      if (!btn) return;
      btn.addEventListener('click', handleSignOut, { once: false });
    });
  }

  async function fetchProfile(): Promise<void> {
    try {
      const session = activeSession();
      if (!session.token) { showAuthButtons(); hideSessionUI(); return; }
      let url = `${API}/api/me`;
      if (session.kind === 'teacher') url = `${API}/api/teacher/profile/me`;
      const reqHeaders: Record<string, string> = {};
      if (session.token && session.token !== AUTH_SENTINEL) {
        reqHeaders.Authorization = `Bearer ${session.token}`;
      }
      const res = await fetch(url, { headers: reqHeaders, credentials: 'include' });
      if (res.status === 401) {
        // Avoid UI sign-out flicker during transient auth/refresh races.
        if (hasAuthState()) return;
        safeRemove(USER_TOKEN_KEY);
        safeRemove(TEACHER_TOKEN_KEY);
        showAuthButtons();
        hideSessionUI();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as ProfileEnvelope | null | undefined;
      const profile: PxNavProfile = session.kind === 'teacher'
        ? ((data && (data.teacher || data.profile || data)) || {})
        : ((data && (data.profile || data)) || {});
      const existing: PxNavProfile = window.__PX_PROFILE_SNAPSHOT || {};
      const merged: PxNavProfile = Object.assign({}, existing, profile);
      if (!merged.logo_url && existing.logo_url) merged.logo_url = existing.logo_url;
      if (!merged.profile_image_url && existing.profile_image_url) merged.profile_image_url = existing.profile_image_url;
      if (!merged.avatar_url && existing.avatar_url) merged.avatar_url = existing.avatar_url;
      window.__PX_PROFILE_SNAPSHOT = merged;
      applyNavProfile(merged);
      setProfileLinks();
    } catch { /* swallow network errors silently */ }
  }

  async function fetchShopProfile(): Promise<void> {
    try {
      const session = activeSession();
      if (!session.token) { showAuthButtons(); hideSessionUI(); return; }
      const res = await fetch(`${API}/api/shop/me`, { headers: { Authorization: `Bearer ${session.token}` } });
      if (res.status === 401) {
        if (hasAuthState()) return;
        safeRemove(USER_TOKEN_KEY);
        safeRemove(TEACHER_TOKEN_KEY);
        showAuthButtons();
        hideSessionUI();
        return;
      }
      if (res.status === 404) { fetchProfile(); return; }
      if (!res.ok) return;
      const shop = (await res.json().catch(() => null)) as ShopRecord | null;
      if (!shop) return;
      const logo = shop.logo_url || shop.logoUrl || null;
      const payload = {
        name: shop.name || shop.shop_name || '',
        logo_url: logo,
        profile_image_url: logo,
        avatar_url: logo
      };
      const snapshot: PxNavProfile = Object.assign({}, window.__PX_PROFILE_SNAPSHOT || {}, payload, { shop });
      window.__PX_PROFILE_SNAPSHOT = snapshot;
      applyNavProfile(snapshot);
      setProfileLinks();
    } catch { /* swallow */ }
  }

  async function init(): Promise<void> {
    if (window.__PX_AUTH_INIT_DONE) return;
    window.__PX_AUTH_INIT_DONE = true;
    // Auto-refresh token if needed (for persistent sessions)
    const hasRefreshToken = !!getUsableRefreshToken();
    const hasSessionState = hasAuthState();
    if (hasRefreshToken || hasSessionState) {
      const refreshFn: () => Promise<boolean> = (typeof window.__PX_ENSURE_AUTH_READY === 'function')
        ? window.__PX_ENSURE_AUTH_READY
        : refreshTokensIfNeeded;
      const refreshed = await refreshFn();
      if (!refreshed && !safeGet(USER_TOKEN_KEY) && !getBearerFallbackToken()) {
        console.warn('[Auth] Init - Refresh failed and no active cookie session. Keeping current auth markers.');
      }
    }

    const session = activeSession();
    const useShopProfile = wantsShopProfile();
    if (session.token) {
      hideAuthButtons();
      showSessionUI();
      attachSignOutHandlers();
      setProfileLinks();
      if (window.__PX_PROFILE_SNAPSHOT) {
        applyNavProfile(window.__PX_PROFILE_SNAPSHOT);
      }
      if (useShopProfile) {
        fetchShopProfile();
      } else if (!window.__PX_PROFILE_SNAPSHOT || (!window.__PX_PROFILE_SNAPSHOT.profile_image_url && !window.__PX_PROFILE_SNAPSHOT.avatar_url)) {
        fetchProfile();
      }
    } else {
      showAuthButtons();
      hideSessionUI();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
