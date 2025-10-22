/*
 * Paper X Navbar Auth/UI Helper
 * -------------------------------------------------
 * Responsibilities:
 * 1. Detect login state via presence of localStorage key 'px_token'.
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
  const API = (window.API_BASE || 'http://localhost:8000').replace(/\/$/, '');
  const USER_TOKEN_KEY = 'px_token';
  const TEACHER_TOKEN_KEY = 'teacherToken';
  const tokenUser = safeGet(USER_TOKEN_KEY);
  const tokenTeacher = safeGet(TEACHER_TOKEN_KEY);

  function safeGet(k){ try { return localStorage.getItem(k); } catch(_) { return null; } }
  function safeSet(k,v){ try { localStorage.setItem(k,v); } catch(_) { } }
  function safeRemove(k){ try { localStorage.removeItem(k); } catch(_) { } }

  const el = (id) => document.getElementById(id);

  function resolveUiRoot(){
    try {
      var p = location.pathname || '';
      var i = p.indexOf('/ui/');
      if (i >= 0) return p.slice(0, i + 4); // include '/ui/'
    } catch(_){ }
    return '/ui/';
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
    // If both exist, prefer teacher session and clear user token
    var tUser = safeGet('px_token');
    var tTeach = safeGet('teacherToken');
    if (tTeach && tUser) {
      try { localStorage.removeItem('px_token'); } catch {}
    }
    if (tTeach) return { kind: 'teacher', token: tTeach };
    if (tUser) return { kind: 'user', token: tUser };
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
    // Clear both possible sessions to enforce exclusivity
    safeRemove(USER_TOKEN_KEY);
    safeRemove(TEACHER_TOKEN_KEY);
    if(typeof window.__PX_CLOSE_MOBILE_NAV === 'function'){ window.__PX_CLOSE_MOBILE_NAV(); }
    window.location.href = 'login.html';
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
      const res = await fetch(url, { headers: { Authorization: `Bearer ${session.token}` }});
      if(res.status === 401){ safeRemove(USER_TOKEN_KEY); safeRemove(TEACHER_TOKEN_KEY); showAuthButtons(); hideSessionUI(); return; }
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
      if(res.status === 401){ safeRemove(USER_TOKEN_KEY); safeRemove(TEACHER_TOKEN_KEY); showAuthButtons(); hideSessionUI(); return; }
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

  function init(){
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
