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
  const tokenKey = 'px_token';
  const token = safeGet(tokenKey);

  function safeGet(k){ try { return localStorage.getItem(k); } catch(_) { return null; } }
  function safeSet(k,v){ try { localStorage.setItem(k,v); } catch(_) { } }
  function safeRemove(k){ try { localStorage.removeItem(k); } catch(_) { } }

  const el = (id) => document.getElementById(id);

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
    const navProfileMobileLabel = navProfileMobile ? navProfileMobile.querySelector('[data-profile-name]') : null;

    let initials = deriveInitials(profile.name);
    if(navProfileInitial){ navProfileInitial.textContent = initials; navProfileInitial.classList.remove('hidden'); }
    if(profile.profile_image_url && navProfileImg){
      navProfileImg.src = profile.profile_image_url;
      navProfileImg.classList.remove('hidden');
      if(navProfileInitial) navProfileInitial.classList.add('hidden');
    } else if(navProfileImg){
      navProfileImg.classList.add('hidden');
    }
    if(navProfile){ navProfile.classList.remove('hidden'); navProfile.setAttribute('title', profile.name || 'Profile'); }
    if(navProfileMobile){
      navProfileMobile.classList.remove('hidden');
      if(navProfileMobileLabel){
        const first = (profile.name||'').split(/\s+/).filter(Boolean)[0];
        navProfileMobileLabel.textContent = first ? `Hi, ${first}` : 'My profile';
      }
    }
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
    safeRemove(tokenKey);
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
      const res = await fetch(`${API}/api/me`, { headers: { Authorization: `Bearer ${token}` }});
      if(res.status === 401){ safeRemove(tokenKey); showAuthButtons(); hideSessionUI(); return; }
      const data = await res.json();
      const profile = data?.profile || {};
      window.__PX_PROFILE_SNAPSHOT = profile;
      applyNavProfile(profile);
    } catch(e){ /* swallow network errors silently */ }
  }

  function init(){
    if(token){
      hideAuthButtons();
      showSessionUI();
      attachSignOutHandlers();
      if(window.__PX_PROFILE_SNAPSHOT){
        applyNavProfile(window.__PX_PROFILE_SNAPSHOT);
      } else {
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
