(function(){
  const API_BASE = ((window.__API_BASE || window.API_BASE || '') + '').replace(/\/$/, '') || 'http://127.0.0.1:8000';
  const COLLAGE_CTX_KEY = 'collage_ctx_v1';
  const COLLAGE_PATH_MARKER = '/ui/collage/';
  const SENSITIVE_QUERY_KEYS = new Set([
    'collegeId',
    'degreeId',
    'departmentId',
    'batchId',
    'courseId',
    'subjectId',
  ]);

  function readStoredContext(){
    try {
      const raw = sessionStorage.getItem(COLLAGE_CTX_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function writeStoredContext(ctx){
    try {
      sessionStorage.setItem(COLLAGE_CTX_KEY, JSON.stringify(ctx || {}));
    } catch (_) {}
  }

  function mergeStoredContext(nextCtx){
    const merged = { ...readStoredContext(), ...(nextCtx || {}) };
    writeStoredContext(merged);
    return merged;
  }

  function isCollageUrl(urlObj){
    return !!(urlObj && typeof urlObj.pathname === 'string' && urlObj.pathname.includes(COLLAGE_PATH_MARKER));
  }

  function toQueryObject(searchParams){
    const out = {};
    if (!searchParams) return out;
    searchParams.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  }

  function toCleanRelativePath(urlObj){
    if (!urlObj || !urlObj.pathname) return '';
    const path = String(urlObj.pathname);
    const markerIdx = path.lastIndexOf(COLLAGE_PATH_MARKER);
    const rel = markerIdx >= 0 ? path.slice(markerIdx + COLLAGE_PATH_MARKER.length) : path;
    return `${rel}${urlObj.hash || ''}`;
  }

  function parseNavTarget(raw){
    if (!raw || typeof window === 'undefined' || typeof window.location === 'undefined') {
      return { urlObj: null, context: {}, cleanRelativeHref: '' };
    }
    let urlObj = null;
    try {
      urlObj = new URL(String(raw), window.location.href);
    } catch (_) {
      return { urlObj: null, context: {}, cleanRelativeHref: '' };
    }
    const context = toQueryObject(urlObj.searchParams);
    const cleanRelativeHref = toCleanRelativePath(urlObj);
    return { urlObj, context, cleanRelativeHref };
  }

  function decodeAnchorContext(anchor){
    if (!anchor || typeof anchor.getAttribute !== 'function') return {};
    const raw = anchor.getAttribute('data-collage-context');
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function stripSensitiveParamsFromAddress(rawQuery){
    if (typeof window === 'undefined' || typeof window.history === 'undefined' || typeof window.location === 'undefined') {
      return;
    }
    // Keep collage URLs queryless to avoid exposing IDs or names in address bar.
    const nextUrl = `${window.location.pathname}${window.location.hash || ''}`;
    const currentUrl = `${window.location.pathname}${window.location.search || ''}${window.location.hash || ''}`;
    if (nextUrl !== currentUrl) {
      try {
        window.history.replaceState({}, '', nextUrl);
      } catch (_) {}
    }
  }

  function parseQuery(){
    const out = {};
    const hasLocation = (typeof location !== 'undefined');
    if (hasLocation && location.search) {
      const params = new URLSearchParams(location.search);
      params.forEach((value, key) => {
        out[key] = value;
      });
    }

    const merged = mergeStoredContext(out);
    stripSensitiveParamsFromAddress(out);
    return merged;
  }

  function sanitizeAnchorHref(anchor){
    if (!anchor || typeof anchor.getAttribute !== 'function' || typeof anchor.setAttribute !== 'function') return;
    const rawHref = anchor.getAttribute('href');
    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:')) return;
    const parsed = parseNavTarget(rawHref);
    if (!parsed.urlObj || !isCollageUrl(parsed.urlObj)) return;
    if (parsed.urlObj.search && parsed.urlObj.search.length > 1) {
      try {
        anchor.setAttribute('data-collage-context', JSON.stringify(parsed.context || {}));
      } catch (_) {}
      if (parsed.cleanRelativeHref) {
        anchor.setAttribute('href', parsed.cleanRelativeHref);
      }
      if (!anchor.hasAttribute('data-collage-context-bound')) {
        anchor.addEventListener('click', () => {
          const ctx = decodeAnchorContext(anchor);
          if (ctx && typeof ctx === 'object') {
            mergeStoredContext(ctx);
          }
        });
        anchor.setAttribute('data-collage-context-bound', '1');
      }
    }
  }

  function sanitizeAllAnchors(){
    if (typeof document === 'undefined') return;
    const anchors = document.querySelectorAll('a[href]');
    anchors.forEach((a) => sanitizeAnchorHref(a));
  }

  function setupAnchorSanitizer(){
    if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
    sanitizeAllAnchors();
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.type === 'attributes' && m.target && m.target.tagName === 'A') {
          sanitizeAnchorHref(m.target);
        }
        if (m.type === 'childList' && m.addedNodes && m.addedNodes.length) {
          m.addedNodes.forEach((node) => {
            if (!node || node.nodeType !== 1) return;
            if (node.tagName === 'A') sanitizeAnchorHref(node);
            if (typeof node.querySelectorAll === 'function') {
              node.querySelectorAll('a[href]').forEach((a) => sanitizeAnchorHref(a));
            }
          });
        }
      });
    });
    observer.observe(document.documentElement || document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['href'],
    });
  }

  function navigate(rawTarget, extraContext){
    if (typeof window === 'undefined' || typeof window.location === 'undefined') return;
    const parsed = parseNavTarget(rawTarget || '');
    const ctx = { ...(parsed.context || {}), ...(extraContext || {}) };
    mergeStoredContext(ctx);
    const fallback = String(rawTarget || '').split('?')[0] || window.location.pathname;
    const dest = parsed.cleanRelativeHref || fallback;
    window.location.href = dest;
  }

  setupAnchorSanitizer();
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', sanitizeAllAnchors);
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
    navigate,
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
