(function () {
  const API = (window.API_BASE || '').replace(/\/+$/, '') || location.origin;
  let adminPromise = null;

  function getToken() {
    const keys = ['teacherToken', 'px_token', 'userToken', 'sb-access-token', 'supabase.auth.token'];
    for (const key of keys) {
      try {
        const value = localStorage.getItem(key);
        if (value) return value;
      } catch (_) { }
    }
    return '';
  }

  function authHeaders(extra) {
    const token = getToken();
    return Object.assign({}, extra || {}, token ? { Authorization: `Bearer ${token}` } : {});
  }

  async function ensureAdmin() {
    if (!adminPromise) {
      adminPromise = (async () => {
        const token = getToken();
        if (!token) throw new Error('Please sign in as admin first.');
        const res = await fetch(`${API}/api/admin/roles/me`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.detail || 'Admin verification failed');
        const role = String(data.role || '').toLowerCase();
        if (role !== 'admin') throw new Error('Admin role required');
        return token;
      })().catch((err) => {
        adminPromise = null;
        throw err;
      });
    }
    return adminPromise;
  }

  async function fetchJson(path, options) {
    const token = await ensureAdmin();
    const init = options || {};
    const headers = Object.assign({}, init.headers || {}, { Authorization: `Bearer ${token}` });
    if (init.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
    const res = await fetch(`${API}${path}`, Object.assign({}, init, { headers }));
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`);
    return data;
  }

  function showStatus(el, message, type) {
    if (!el) return;
    el.classList.remove('hidden', 'text-red-600', 'text-red-300', 'text-emerald-600', 'text-emerald-300', 'text-amber-600', 'text-amber-300');
    if (type === 'error') el.classList.add('text-red-600', 'dark:text-red-300');
    else if (type === 'success') el.classList.add('text-emerald-600', 'dark:text-emerald-300');
    else el.classList.add('text-amber-600', 'dark:text-amber-300');
    el.textContent = message;
  }

  function fmtDate(value) {
    if (!value) return '-';
    try { return new Date(value).toLocaleString(); } catch (_) { return String(value); }
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  function initThemeToggle() {
    const root = document.documentElement;
    const applyIcon = (mode) => {
      document.querySelectorAll('[data-theme-toggle] .material-symbols-rounded').forEach((icon) => {
        icon.textContent = mode === 'dark' ? 'light_mode' : 'dark_mode';
      });
    };
    const set = (mode) => {
      if (mode === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
      try { localStorage.setItem('px_theme', mode); } catch (_) { }
      applyIcon(mode);
    };
    const saved = (() => {
      try { return localStorage.getItem('px_theme'); } catch (_) { return null; }
    })();
    if (saved === 'dark' || saved === 'light') set(saved);
    else applyIcon(root.classList.contains('dark') ? 'dark' : 'light');
    document.addEventListener('click', (e) => {
      const button = e.target.closest('[data-theme-toggle]');
      if (!button) return;
      set(root.classList.contains('dark') ? 'light' : 'dark');
    });
  }

  function initNavAuth() {
    const token = getToken();
    const navProfile = document.getElementById('navProfile');
    const navProfileImg = document.getElementById('navProfileImg');
    const navProfileInitial = document.getElementById('navProfileInitial');
    const signOutBtn = document.getElementById('signOutBtn');

    if (!token) return;
    document.querySelectorAll('a[href="../../login.html"], a[href="../../signup.html"]').forEach((a) => {
      a.classList.add('hidden');
      a.style.display = 'none';
    });

    if (navProfile) navProfile.classList.remove('hidden');
    if (signOutBtn) {
      signOutBtn.classList.remove('hidden');
      signOutBtn.onclick = () => {
        try {
          ['teacherToken', 'px_token', 'userToken', 'sb-access-token', 'supabase.auth.token'].forEach((key) => localStorage.removeItem(key));
        } catch (_) { }
        window.location.href = '../../login.html';
      };
    }

    const applyNavProfile = (profile) => {
      if (!profile) return;
      let initialsTxt = 'ME';
      if (profile.name) {
        initialsTxt = profile.name.split(' ').filter(Boolean).map((part) => part[0]?.toUpperCase()).slice(0, 2).join('') || 'ME';
      }
      if (navProfileInitial) {
        navProfileInitial.textContent = initialsTxt;
        navProfileInitial.classList.remove('hidden');
      }
      if (profile.profile_image_url && navProfileImg) {
        navProfileImg.src = profile.profile_image_url;
        navProfileImg.classList.remove('hidden');
        if (navProfileInitial) navProfileInitial.classList.add('hidden');
      } else if (navProfileImg) {
        navProfileImg.classList.add('hidden');
      }
    };

    fetch(`${API}/api/profile/me`, { headers: authHeaders() })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => applyNavProfile(data))
      .catch(() => { });
  }

  function initControlTabs(activeKey) {
    document.querySelectorAll('[data-cp-tab]').forEach((link) => {
      const isActive = link.getAttribute('data-cp-tab') === activeKey;
      link.classList.toggle('bg-brand-500', isActive);
      link.classList.toggle('text-white', isActive);
      link.classList.toggle('border-brand-400/60', isActive);
      link.classList.toggle('bg-white/70', !isActive);
      link.classList.toggle('dark:bg-white/10', !isActive);
    });
  }

  function initPageChrome(activeKey) {
    initThemeToggle();
    initNavAuth();
    initControlTabs(activeKey);
  }

  window.CP = { API, getToken, authHeaders, ensureAdmin, fetchJson, showStatus, fmtDate, escapeHtml, initPageChrome };
})();
