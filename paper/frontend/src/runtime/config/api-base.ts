import { PROD_API_BASE as CONFIGURED_PROD_API_BASE } from '../env';

/**
 * Global API base config for UI pages.
 *
 * Priority:
 * 1) A non-empty string already assigned to `window.API_BASE` by the page.
 * 2) LocalStorage key 'API_BASE' (localhost URLs are normalized to the page host).
 * 3) If running on localhost/127.0.0.1/::1, use the local FastAPI default on port 8000.
 * 4) Fallback to the production backend (PROD_API_BASE). On *.ondigitalocean.app
 *    the page origin itself is used.
 *
 * Writes `window.API_BASE`, `window.__API_BASE` and persists localStorage 'API_BASE'.
 */
export function install(): void {
  try {
    const pageHost = (typeof location !== 'undefined' && location.hostname) ? location.hostname : '';
    const isLocalPageHost = /^(localhost|127\.0\.0\.1|::1)$/i.test(pageHost);
    const PROD_API_BASE = CONFIGURED_PROD_API_BASE;

    function isKnownBadProdApiBase(urlLike: unknown): boolean {
      try {
        if (!urlLike) return false;
        const u = new URL(String(urlLike));
        const h = String(u.hostname || '').toLowerCase();
        // paperx.tech serves UI pages; API is hosted on the backend app origin.
        return /(^|\.)paperx\.tech$/i.test(h);
      } catch {
        return false;
      }
    }

    function normalizeLocalApiBase(urlLike: unknown): string | null {
      try {
        if (!urlLike) return null;
        const u = new URL(String(urlLike));
        const localHost = /^(localhost|127\.0\.0\.1|::1)$/i.test(u.hostname || '');
        if (!localHost) return u.toString().replace(/\/$/, '');
        const targetHost = isLocalPageHost ? pageHost : (u.hostname || '127.0.0.1');
        let port = String(u.port || '');
        if (!port) port = '8000';
        return (u.protocol || 'http:') + '//' + targetHost + ':' + port;
      } catch {
        return null;
      }
    }

    const preset = (typeof window.API_BASE === 'string' && window.API_BASE.trim()) || null;
    let saved: string | null | false = !preset && localStorage.getItem('API_BASE');
    if (!preset && saved) {
      const normalizedSaved = normalizeLocalApiBase(saved);
      if (normalizedSaved) {
        saved = normalizedSaved;
        try { localStorage.setItem('API_BASE', saved); } catch { }
      }
    }

    let resolved: string | null = preset || (saved && /^https?:\/\//i.test(saved) ? saved : null);
    if (!isLocalPageHost && isKnownBadProdApiBase(resolved)) {
      resolved = null;
    }
    if (!resolved) {
      const origin = (typeof location !== 'undefined' && location.origin) ? location.origin : '';
      if (/localhost|127\.0\.0\.1|\[::1\]/i.test(origin) || isLocalPageHost) {
        const h = isLocalPageHost ? pageHost : '127.0.0.1';
        resolved = 'http://' + h + ':8000';
      } else {
        // In production, never fall back to localhost.
        const host = String(pageHost || '').toLowerCase();
        if (host && /ondigitalocean\.app$/.test(host)) {
          resolved = origin || PROD_API_BASE;
        } else {
          resolved = PROD_API_BASE;
        }
      }
    }
    resolved = resolved.replace(/\/$/, '');
    window.API_BASE = resolved;
    window.__API_BASE = resolved;
    try { localStorage.setItem('API_BASE', resolved); } catch { }
  } catch {
    const fallbackHost = (typeof location !== 'undefined' && /^(localhost|127\.0\.0\.1|::1)$/i.test(location.hostname || ''))
      ? location.hostname
      : '127.0.0.1';
    const fallback = 'http://' + fallbackHost + ':8000';
    window.API_BASE = fallback;
    window.__API_BASE = fallback;
  }
}
