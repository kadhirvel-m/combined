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
    escapeHtml
  };
})();
