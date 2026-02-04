// Shared helpers for HOD portal pages
(function(){
  const API_BASE = (window.API_BASE || window.__API_BASE || 'http://127.0.0.1:8000').replace(/\/$/, '');

  function getToken(){
    const keys = ['teacherToken','px_token','userToken','sb-access-token','supabase.auth.token'];
    for (const k of keys){
      try { const v = localStorage.getItem(k); if (v) return v; } catch(_){ }
    }
    return '';
  }

  async function fetchJSON(url, opts, retries){
    opts = opts || {};
    retries = typeof retries === 'number' ? retries : 2;
    try {
      const res = await fetch(url, opts);
      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch(_){ data = { detail: text }; }
      if (!res.ok){
        const err = new Error((data && data.detail) ? data.detail : ('Request failed: ' + res.status));
        err.status = res.status;
        err.data = data;
        throw err;
      }
      return data;
    } catch (e){
      const isNetwork = (e instanceof TypeError) || /Failed to fetch|NetworkError|disconnected/i.test(String(e && e.message || ''));
      const isTransient = isNetwork || (e && (e.status === 502 || e.status === 503 || e.status === 504));
      if (retries > 0 && isTransient){
        await new Promise(r => setTimeout(r, 450));
        return fetchJSON(url, opts, retries - 1);
      }
      throw e;
    }
  }

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  }

  function uiRoot(){
    try {
      const p = location.pathname || '';
      const i = p.indexOf('/ui/');
      if (i >= 0) return p.slice(0, i + 4);
    } catch(_){ }
    return '/ui/';
  }

  function redirectToTeacherLogin(){
    const root = uiRoot();
    const here = (location.pathname || '') + (location.search || '');
    const ret = encodeURIComponent(here);
    location.href = root + 'teachers/teacher_login.html?redirect=' + ret;
  }

  function bindThemeToggle(){
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-theme-toggle]');
      if (!btn) return;
      const root = document.documentElement;
      const dark = root.classList.toggle('dark');
      try { localStorage.setItem('px_theme', dark ? 'dark' : 'light'); } catch(_){ }
      const icon = btn.querySelector('.material-symbols-rounded') || (btn.classList && btn.classList.contains('material-symbols-rounded') ? btn : null);
      if (icon) icon.textContent = dark ? 'light_mode' : 'dark_mode';
    });
  }

  async function requireHod(){
    const token = getToken();
    if (!token) redirectToTeacherLogin();
    try {
      return await fetchJSON(API_BASE + '/api/hod/me', { headers: { Authorization: 'Bearer ' + token } });
    } catch (e){
      if (e && (e.status === 401)) redirectToTeacherLogin();
      throw e;
    }
  }

  function mountNav(active){
    const el = document.getElementById('hodNav');
    if (!el) return;
    const root = './';
    const links = [
      { id:'dashboard', href: root + 'hod_dashboard.html', label:'Dashboard', icon:'space_dashboard' },
      { id:'classes', href: root + 'hod_classes.html', label:'Classes', icon:'class' },
      { id:'batches', href: root + 'batch_management.html', label:'Batch Mgmt', icon:'calendar_month' },
      { id:'staff', href: root + 'hod_staff.html', label:'Staff', icon:'groups' },
      { id:'apps', href: root + 'hod_applications.html', label:'Applications', icon:'badge' },
      { id:'ai', href: root + 'hod_ai.html', label:'AI Insights', icon:'auto_awesome' },
    ];
    el.innerHTML = links.map(l => {
      const is = l.id === active;
      const cls = is
        ? 'bg-brand-500 text-white shadow'
        : 'bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white/90 dark:hover:bg-white/20';
      return `<a href="${esc(l.href)}" class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${cls}">
        <span class="material-symbols-rounded text-[18px]">${esc(l.icon)}</span>${esc(l.label)}
      </a>`;
    }).join('');
  }

  window.HOD = {
    API_BASE,
    getToken,
    fetchJSON,
    esc,
    requireHod,
    mountNav,
    bindThemeToggle,
  };
})();
