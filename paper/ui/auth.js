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
(function() {
  const API = (window.API_BASE || 'http://127.0.0.1:8000').replace(/\/$/, '');
  const USER_TOKEN_KEY = 'px_token';
  const TEACHER_TOKEN_KEY = 'teacherToken';
  const REFRESH_TOKEN_KEY = 'px_refresh_token';
  const TOKEN_EXPIRES_KEY = 'px_token_expires_at';
  const AUTH_SENTINEL = '__COOKIE_AUTH__';
  const BEARER_FALLBACK_KEY = 'paperx_bearer_fallback';
  const REFRESH_SUPPRESS_UNTIL_KEY = 'paperx_refresh_suppress_until';
  const tokenUser = safeGet(USER_TOKEN_KEY);
  const tokenTeacher = safeGet(TEACHER_TOKEN_KEY);

  function safeGet(k){ try { return localStorage.getItem(k); } catch(_) { return null; } }
  function safeSet(k,v){ try { localStorage.setItem(k,v); } catch(_) { } }
  function safeRemove(k){ try { localStorage.removeItem(k); } catch(_) { } }
  function hasAuthStateCookie(){ try { return document.cookie.indexOf('paperx_auth=') !== -1; } catch(_) { return false; } }
  function hasAuthStateMarker(){ return safeGet('paperx_session_state') === '1'; }
  function hasAuthState(){ return hasAuthStateMarker() || hasAuthStateCookie(); }
  function normalizeStoredToken(v){
    if (!v) return null;
    const t = String(v).trim();
    if (!t || t === AUTH_SENTINEL) return null;
    return t;
  }

  function getUsableRefreshToken(){
    try {
      const fromSession = String(sessionStorage.getItem(REFRESH_TOKEN_KEY) || '').trim();
      if (fromSession && fromSession !== AUTH_SENTINEL && fromSession !== 'null' && fromSession !== 'undefined') {
        return fromSession;
      }
    } catch (_) { }
    const raw = safeGet(REFRESH_TOKEN_KEY);
    if (!raw) return null;
    const tok = String(raw).trim();
    if (!tok || tok === AUTH_SENTINEL || tok === 'null' || tok === 'undefined') return null;
    return tok;
  }

  function suppressRefreshTemporarily(ms){
    try {
      const until = Date.now() + Math.max(1000, Number(ms) || 0);
      sessionStorage.setItem(REFRESH_SUPPRESS_UNTIL_KEY, String(until));
    } catch (_) { }
  }

  function isRefreshSuppressed(){
    try {
      const raw = sessionStorage.getItem(REFRESH_SUPPRESS_UNTIL_KEY);
      const until = raw ? Number(raw) : 0;
      return Number.isFinite(until) && until > Date.now();
    } catch (_) {
      return false;
    }
  }

  function getBearerFallbackToken(){
    try {
      const t = String(sessionStorage.getItem(BEARER_FALLBACK_KEY) || '').trim();
      if (t && t !== AUTH_SENTINEL) return t;
    } catch (_) {
    }
    try {
      const t2 = String(localStorage.getItem(BEARER_FALLBACK_KEY) || '').trim();
      return (!t2 || t2 === AUTH_SENTINEL) ? null : t2;
    } catch (_) {
      return null;
    }
  }

  // Auto-refresh using HttpOnly refresh cookie.
  async function refreshTokensIfNeeded() {
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
            try { safeRemove(REFRESH_TOKEN_KEY); } catch (_) { }
            try { sessionStorage.removeItem(REFRESH_TOKEN_KEY); } catch (_) { }
          }
          suppressRefreshTemporarily(5 * 60 * 1000);
        } else if (res.status === 401 || res.status === 403) {
          // If we still have cookie-auth, avoid force-clearing session markers.
          // Another tab/page may have already rotated refresh state.
          if (!hasCookieSession) {
            try { safeRemove(REFRESH_TOKEN_KEY); } catch (_) { }
            try { sessionStorage.removeItem(REFRESH_TOKEN_KEY); } catch (_) { }
            try { safeRemove('paperx_session_state'); } catch (_) { }
            try { sessionStorage.removeItem(BEARER_FALLBACK_KEY); } catch (_) { }
            try { localStorage.removeItem(BEARER_FALLBACK_KEY); } catch (_) { }
          }
          suppressRefreshTemporarily(60 * 1000);
        }
        // Do not clear session markers/tokens here; this can cause auth bounce loops
        // in privacy-hardened browsers where refresh cookies are blocked.
        return !!fallback || hasAuthState();
      }
      const data = await res.json();
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
      } catch (_) { }
      console.log('[Auth] Token refreshed successfully.', data && data.message ? data.message : 'ok');
      return true;
    } catch (e) {
      // Network/offline/CORS interruptions should not spam auth failures.
      console.warn('[Auth] Token refresh skipped due to network error');
      suppressRefreshTemporarily(30 * 1000);
      return false;
    }
  }

  function clearAllTokens() {
    safeRemove(USER_TOKEN_KEY);
    safeRemove(TEACHER_TOKEN_KEY);
    safeRemove(REFRESH_TOKEN_KEY);
    safeRemove(TOKEN_EXPIRES_KEY);
    safeRemove('paperx_session_state');
    safeRemove('paperx_session_id'); // Clear analytics session
    try { sessionStorage.removeItem(REFRESH_TOKEN_KEY); } catch (_) { }
    try { sessionStorage.removeItem(BEARER_FALLBACK_KEY); } catch (_) { }
    try { localStorage.removeItem(BEARER_FALLBACK_KEY); } catch (_) { }
  }

  const el = (id) => document.getElementById(id);

  function resolveUiRoot(){
    try {
      var p = location.pathname || '';
      var i = p.indexOf('/ui/');
      if (i >= 0) return p.slice(0, i + 4); // include '/ui/'
      // Some deployments publish all UI files at the site root (no /ui prefix).
      // In that case, use '/' so profile links resolve to '/profile.html'.
      if (p === '/ui' || p.startsWith('/ui?') || p.startsWith('/ui#')) return '/ui/';
    } catch(_){ }
    return '/';
  }

  function deriveInitials(name){
    if(!name) return 'ME';
    return name.split(/\s+/).filter(Boolean).map(p=>p[0]?.toUpperCase()).slice(0,2).join('') || 'ME';
  }

  function applyNavProfile(profile){
    if(!profile) return;
    const navProfile = el('navProfile');
    const navProfileImg = el('navProfileImg');
    const navProfileInitial = el('navProfileInitial');
    const navProfileMobile = el('navProfileMobile');
    const navProfileImgMobile = el('navProfileImgMobile');
    const navProfileInitialMobile = el('navProfileInitialMobile');
    const navProfileMobileLabel = navProfileMobile ? navProfileMobile.querySelector('[data-profile-name]') : null;
    const mobileMode = navProfileMobileLabel && navProfileMobileLabel.dataset ? navProfileMobileLabel.dataset.profileMode : null;

    let initials = deriveInitials(profile.name || profile.full_name || profile.username || '');
    if(navProfileInitial){ navProfileInitial.textContent = initials; navProfileInitial.classList.remove('hidden'); }
    if(navProfileInitialMobile){ navProfileInitialMobile.textContent = initials; navProfileInitialMobile.classList.remove('hidden'); }
    const avatar = profile.logo_url || profile.profile_image_url || profile.avatar_url;
    if(avatar && navProfileImg){
      navProfileImg.src = avatar;
      navProfileImg.classList.remove('hidden');
      if(navProfileInitial) navProfileInitial.classList.add('hidden');
    } else if(navProfileImg){
      navProfileImg.classList.add('hidden');
    }
    if(avatar && navProfileImgMobile){
      navProfileImgMobile.src = avatar;
      navProfileImgMobile.classList.remove('hidden');
      if(navProfileInitialMobile) navProfileInitialMobile.classList.add('hidden');
    } else if(navProfileImgMobile){
      navProfileImgMobile.classList.add('hidden');
      if(navProfileInitialMobile) navProfileInitialMobile.classList.remove('hidden');
    }
    const titleName = profile.name || profile.full_name || 'Profile';
    if(navProfile){ navProfile.classList.remove('hidden'); navProfile.setAttribute('title', titleName); }
    if(navProfileMobile){
      navProfileMobile.classList.remove('hidden');
      if(navProfileMobileLabel){
        if(mobileMode === 'initials'){
          navProfileMobileLabel.textContent = initials || 'ME';
        } else {
          const first = (titleName||'').split(/\s+/).filter(Boolean)[0];
          navProfileMobileLabel.textContent = first ? `Hi, ${first}` : 'My profile';
        }
      }
    }
  }

  function activeSession(){
    // If both legacy real tokens exist, prefer teacher and clear user token.
    // Cookie sentinel must never force teacher mode.
    var tUser = normalizeStoredToken(safeGet('px_token'));
    var tTeach = normalizeStoredToken(safeGet('teacherToken'));
    if (tTeach && tUser) {
      try { localStorage.removeItem('px_token'); } catch {}
    }
    if (tTeach) return { kind: 'teacher', token: tTeach };
    if (tUser) return { kind: 'user', token: tUser };
    const fb = getBearerFallbackToken();
    if (fb) return { kind: 'user', token: fb };
    if (hasAuthState()) return { kind: 'user', token: AUTH_SENTINEL };
    return { kind: null, token: null };
  }

  function resolveCustomProfileHref(node, root, session){
    if(!node || node.tagName !== 'A') return null;
    const custom = node.getAttribute('data-profile-link');
    if(!custom) return null;
    if(/^https?:\/\//i.test(custom)) return custom;
    if(custom.startsWith('/')) return custom;
    return root + custom.replace(/^\//, '');
  }

  function setProfileLinks(){
    const root = resolveUiRoot();
    const session = activeSession();
    const href = session.kind === 'teacher' ? (root + 'teacher_profile.html?user=me') : (root + 'profile.html');
    const a1 = el('navProfile');
    const a2 = el('navProfileMobile');
    if (a1 && a1.tagName === 'A') a1.href = resolveCustomProfileHref(a1, root, session) || href;
    if (a2 && a2.tagName === 'A') a2.href = resolveCustomProfileHref(a2, root, session) || href;
  }

  function wantsShopProfile(){
    return [el('navProfile'), el('navProfileMobile')].filter(Boolean).some(node => {
      if(!node || typeof node.getAttribute !== 'function') return false;
      return node.getAttribute('data-profile-source') === 'shop';
    });
  }

  window.__PX_NAV_APPLY = applyNavProfile; // expose globally so profile page can re-use

  function hideAuthButtons(){
    document.querySelectorAll('a[href$="login.html"], a[href$="signup.html"]').forEach(a=>a.classList.add('hidden'));
  }
  function showAuthButtons(){
    document.querySelectorAll('a[href$="login.html"], a[href$="signup.html"]').forEach(a=>a.classList.remove('hidden'));
  }
  function showSessionUI(){
    [el('navProfile'), el('navProfileMobile')].forEach(n=> {
      if(!n) return;
      n.classList.remove('hidden');
      if(!n.classList.contains('inline-flex') && !n.classList.contains('flex')){
        // Use inline-flex for compact alignment unless developer overrides
        n.classList.add('inline-flex');
      }
    });
    [el('signOutBtn'), el('signOutBtnMobile')].forEach(n=> {
      if(!n) return;
      n.classList.remove('hidden');
      if(!n.classList.contains('inline-flex') && !n.classList.contains('flex')){
        n.classList.add('inline-flex');
      }
    });
  }
  function hideSessionUI(){
    [el('navProfile'), el('navProfileMobile'), el('signOutBtn'), el('signOutBtnMobile')].forEach(n=> {
      if(!n) return;
      n.classList.add('hidden');
      // Do not remove display class so that once authenticated it remains consistent
    });
  }

  function handleSignOut(ev){
    if(ev) ev.preventDefault();
    fetch(`${API}/logout`, { method: 'POST', credentials: 'include' })
      .catch(() => null)
      .finally(() => {
        clearAllTokens();
        if(typeof window.__PX_CLOSE_MOBILE_NAV === 'function'){ window.__PX_CLOSE_MOBILE_NAV(); }
        window.location.href = 'login.html';
      });
  }

  function attachSignOutHandlers(){
    [el('signOutBtn'), el('signOutBtnMobile')].forEach(btn => {
      if(!btn) return;
      btn.addEventListener('click', handleSignOut, { once: false });
    });
  }

  async function fetchProfile(){
    try {
      const session = activeSession();
      if (!session.token) { showAuthButtons(); hideSessionUI(); return; }
      let url = `${API}/api/me`;
      if (session.kind === 'teacher') url = `${API}/api/teacher/profile/me`;
      const reqHeaders = {};
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
      const data = await res.json().catch(()=>({}));
      const profile = session.kind === 'teacher'
        ? ((data && (data.teacher || data.profile || data)) || {})
        : ((data && (data.profile || data)) || {});
      const existing = window.__PX_PROFILE_SNAPSHOT || {};
      const merged = Object.assign({}, existing, profile);
      if(!merged.logo_url && existing.logo_url) merged.logo_url = existing.logo_url;
      if(!merged.profile_image_url && existing.profile_image_url) merged.profile_image_url = existing.profile_image_url;
      if(!merged.avatar_url && existing.avatar_url) merged.avatar_url = existing.avatar_url;
      window.__PX_PROFILE_SNAPSHOT = merged;
      applyNavProfile(merged);
      setProfileLinks();
    } catch(e){ /* swallow network errors silently */ }
  }

  async function fetchShopProfile(){
    try {
      const session = activeSession();
      if (!session.token) { showAuthButtons(); hideSessionUI(); return; }
      const res = await fetch(`${API}/api/shop/me`, { headers: { Authorization: `Bearer ${session.token}` }});
      if (res.status === 401) {
        if (hasAuthState()) return;
        safeRemove(USER_TOKEN_KEY);
        safeRemove(TEACHER_TOKEN_KEY);
        showAuthButtons();
        hideSessionUI();
        return;
      }
      if(res.status === 404){ fetchProfile(); return; }
      if(!res.ok) return;
      const shop = await res.json().catch(()=>null);
      if(!shop) return;
      const logo = shop.logo_url || shop.logoUrl || null;
      const payload = {
        name: shop.name || shop.shop_name || '',
        logo_url: logo,
        profile_image_url: logo,
        avatar_url: logo
      };
      const snapshot = Object.assign({}, window.__PX_PROFILE_SNAPSHOT || {}, payload, { shop });
      window.__PX_PROFILE_SNAPSHOT = snapshot;
      applyNavProfile(snapshot);
      setProfileLinks();
    } catch(e){ /* swallow */ }
  }

  async function init(){
    if (window.__PX_AUTH_INIT_DONE) return;
    window.__PX_AUTH_INIT_DONE = true;
    // Auto-refresh token if needed (for persistent sessions)
    const hasRefreshToken = !!getUsableRefreshToken();
    const hasSessionState = hasAuthState();
    if (hasRefreshToken || hasSessionState) {
      const refreshFn = (typeof window.__PX_ENSURE_AUTH_READY === 'function')
        ? window.__PX_ENSURE_AUTH_READY
        : refreshTokensIfNeeded;
      const refreshed = await refreshFn();
      if (!refreshed && !safeGet(USER_TOKEN_KEY) && !getBearerFallbackToken()) {
        console.warn('[Auth] Init - Refresh failed and no active cookie session. Keeping current auth markers.');
      }
    }

    const session = activeSession();
    const useShopProfile = wantsShopProfile();
    if(session.token){
      hideAuthButtons();
      showSessionUI();
      attachSignOutHandlers();
      setProfileLinks();
      if(window.__PX_PROFILE_SNAPSHOT){
        applyNavProfile(window.__PX_PROFILE_SNAPSHOT);
      }
      if(useShopProfile){
        fetchShopProfile();
      } else if(!window.__PX_PROFILE_SNAPSHOT || (!window.__PX_PROFILE_SNAPSHOT.profile_image_url && !window.__PX_PROFILE_SNAPSHOT.avatar_url)){
        fetchProfile();
      }
    } else {
      showAuthButtons();
      hideSessionUI();
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
