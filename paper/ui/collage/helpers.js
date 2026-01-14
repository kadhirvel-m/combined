(function(){
  const API_BASE = ((window.__API_BASE || window.API_BASE || '') + '').replace(/\/$/, '') || 'http://127.0.0.1:8000';

  function parseQuery(){
    const out = {};
    if (typeof location === 'undefined' || !location.search) return out;
    const params = new URLSearchParams(location.search);
    params.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  }

  async function fetchJson(path, options){
    const opts = options ? { ...options } : {};
    const skipAuth = !!opts.skipAuth;
    if ('skipAuth' in opts) delete opts.skipAuth;
    const headers = { 'Accept': 'application/json' };
    if (opts && opts.headers) Object.assign(headers, opts.headers);
    const token = (typeof window !== 'undefined' && localStorage.getItem('token')) || null;
    if (!skipAuth) {
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    if (opts && opts.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
      if (typeof opts.body !== 'string') {
        opts.body = JSON.stringify(opts.body);
      }
    }
    opts.headers = headers;
    const target = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
    const res = await fetch(target, opts);
    if (!res.ok) {
      let detail = res.statusText;
      try {
        const data = await res.json();
        detail = data.detail || data.message || JSON.stringify(data);
      } catch(_){}
      const err = new Error(detail || `Request failed (${res.status})`);
      err.status = res.status;
      throw err;
    }
    const text = await res.text();
    try {
      return text ? JSON.parse(text) : null;
    } catch(err){
      console.warn('Invalid JSON from', target, err);
      return null;
    }
  }

  function formatYearRange(fromYear, toYear){
    if (!fromYear && !toYear) return '—';
    if (!fromYear) return `${toYear}`;
    if (!toYear) return `${fromYear}`;
    return `${fromYear} – ${toYear}`;
  }

  function makeBreadcrumb(items){
    if (!(Array.isArray(items))) return '';
    return items.map((item, index) => {
      if (!item) return '';
      if (item.href && index !== items.length - 1) {
        return `<a href="${item.href}">${escapeHtml(item.label || item.text || '')}</a>`;
      }
      return `<span>${escapeHtml(item.label || item.text || '')}</span>`;
    }).filter(Boolean).join('<span class="material-symbols-rounded" aria-hidden="true">chevron_right</span>');
  }

  function escapeHtml(str){
    return (str || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[c]);
  }

  window.Collage = {
    API_BASE,
    parseQuery,
    fetchJson,
    formatYearRange,
    makeBreadcrumb,
    escapeHtml,
    getAnyToken,
    requireRoles,
    requireAdminOrEmployee,
    renderAccessDenied
  };
})();

function getAnyToken(){
  const keys = ['token', 'px_token', 'access_token', 'auth_token', 'sb-access-token'];
  for (const key of keys) {
    try {
      const value = localStorage.getItem(key);
      if (value) return value;
    } catch (_) {}
  }
  return null;
}

async function requireRoles(allowedRoles){
  const token = getAnyToken();
  if (!token) {
    const err = new Error('Missing token');
    err.status = 401;
    throw err;
  }
  const list = Array.isArray(allowedRoles) ? allowedRoles : [];
  const me = await window.Collage.fetchJson('/api/admin/roles/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const role = String(me?.role || 'student').toLowerCase().trim();
  if (!list.length) return role;
  if (!list.includes(role)) {
    const err = new Error('Access denied');
    err.status = 403;
    throw err;
  }
  return role;
}

async function requireAdminOrEmployee(){
  return requireRoles(['admin', 'employee']);
}

function renderAccessDenied(containerEl, message){
  const container = containerEl || null;
  const msg = window.Collage && window.Collage.escapeHtml
    ? window.Collage.escapeHtml(message || 'You do not have permission to view this page.')
    : (message || 'You do not have permission to view this page.');
  const html = `
    <div class="col-span-full p-10 text-center space-y-4 rounded-3xl border border-black/5 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur-xl shadow-soft">
      <div class="mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-red-500/10 text-red-600 dark:text-red-400">
        <span class="material-symbols-rounded">block</span>
      </div>
      <h2 class="text-xl font-bold text-neutral-900 dark:text-white">Access denied</h2>
      <p class="text-sm text-neutral-600 dark:text-white/70 max-w-md mx-auto">${msg}</p>
    </div>`;
  if (container) {
    container.innerHTML = html;
  } else {
    try { alert(message || 'Access denied'); } catch (_) {}
  }
}
