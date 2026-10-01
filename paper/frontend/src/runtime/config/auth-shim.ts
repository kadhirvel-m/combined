/** Cross-tab refresh lock stored as JSON in localStorage `paperx_refresh_lock`. */
interface RefreshLockRecord {
  owner?: unknown;
  expiresAt?: unknown;
  ts?: unknown;
}

/** Cross-tab refresh result stored as JSON in localStorage `paperx_refresh_event`. */
interface RefreshEventRecord {
  owner?: unknown;
  ok?: unknown;
  reason?: unknown;
  ts?: unknown;
}

/** Body of a successful POST /refresh. */
interface RefreshResponseBody {
  access_token?: unknown;
}

/** Request init as tracked by the fetch wrapper (marks the single auth retry). */
type ShimRequestInit = RequestInit & { __paperxRetried?: boolean };

/** Storage.prototype plus the non-writable guard flag this section defines on it. */
type AuthShimStorageProto = Storage & { __paperxAuthShimPatched?: boolean };

/**
 * Global auth hardening shim:
 * - Blocks persistent storage of bearer/refresh tokens in localStorage.
 * - Provides a cookie-backed auth sentinel for legacy pages that gate on localStorage token presence.
 * - Forces fetch requests to include cookies and strips placeholder Authorization headers.
 * - Attaches the CSRF header to unsafe same-origin/API requests.
 * - Retries a 401/403 API response once after a /refresh, coordinated across tabs
 *   with a localStorage lock so only one tab refreshes at a time.
 * - Exposes `window.__PX_ENSURE_AUTH_READY()`.
 */
export function install(): void {
  try {
    const TOKEN_KEYS = new Set([
      'px_token',
      'teacherToken',
      'px_refresh_token',
      'px_token_expires_at',
      'px_auth_token',
      'access_token',
      'refresh_token',
      'auth_token',
      'sb-access-token',
      'supabase.auth.token',
      'gatex-access-token',
      'userToken',
      'token'
    ]);
    const AUTH_SENTINEL = '__COOKIE_AUTH__';
    const AUTH_STATE_KEY = 'paperx_session_state';
    const BEARER_FALLBACK_KEY = 'paperx_bearer_fallback';
    const REFRESH_SUPPRESS_UNTIL_KEY = 'paperx_refresh_suppress_until';
    const REFRESH_LOCK_KEY = 'paperx_refresh_lock';
    const REFRESH_EVENT_KEY = 'paperx_refresh_event';
    const LAST_REFRESH_OK_AT_KEY = 'paperx_last_refresh_ok_at';
    const REFRESH_LOCK_TTL_MS = 15000;
    const REFRESH_WAIT_TIMEOUT_MS = 12000;
    const REFRESH_COOLDOWN_MS = 45000;
    const TAB_ID = 'px-' + Math.random().toString(36).slice(2, 10) + '-' + Date.now().toString(36);
    const stateCookieName = 'paperx_auth=';

    function hasAuthStateCookie(): boolean {
      try {
        return document.cookie.indexOf(stateCookieName) !== -1;
      } catch {
        return false;
      }
    }

    function hasAuthStateMarker(): boolean {
      try {
        return String(localStorage.getItem(AUTH_STATE_KEY) || '').trim() === '1';
      } catch {
        return false;
      }
    }

    function hasAuthState(): boolean {
      return hasAuthStateMarker() || hasAuthStateCookie();
    }

    function setAuthStateMarker(enabled: boolean): void {
      try {
        if (enabled) {
          localStorage.setItem(AUTH_STATE_KEY, '1');
        } else {
          localStorage.removeItem(AUTH_STATE_KEY);
        }
      } catch { }
    }

    function getBearerFallback(): string {
      try {
        const v = String(sessionStorage.getItem(BEARER_FALLBACK_KEY) || '').trim();
        if (v && v !== AUTH_SENTINEL) return v;
      } catch {
      }
      try {
        const v2 = String(localStorage.getItem(BEARER_FALLBACK_KEY) || '').trim();
        if (!v2 || v2 === AUTH_SENTINEL) return '';
        return v2;
      } catch {
        return '';
      }
    }

    function clearBearerFallback(): void {
      try { sessionStorage.removeItem(BEARER_FALLBACK_KEY); } catch { }
      try { localStorage.removeItem(BEARER_FALLBACK_KEY); } catch { }
    }

    function _normalizeRefreshTokenValue(v: unknown): string {
      const tok = String(v || '').trim();
      if (!tok || tok === AUTH_SENTINEL || tok === 'null' || tok === 'undefined') return '';
      return tok;
    }

    function _readRefreshCandidate(): string {
      try {
        const sessionTok = _normalizeRefreshTokenValue(sessionStorage.getItem('px_refresh_token'));
        if (sessionTok) return sessionTok;
      } catch { }
      try {
        // Use the original storage getter to bypass token sentinel shims.
        // (`_getItem` is assigned further down; this only runs after install.)
        const persistedTok = _normalizeRefreshTokenValue(_getItem.call(localStorage, 'px_refresh_token'));
        if (persistedTok) return persistedTok;
      } catch { }
      return '';
    }

    function _suppressRefreshFor(ms: number): void {
      try {
        const until = Date.now() + Math.max(1000, Number(ms) || 0);
        sessionStorage.setItem(REFRESH_SUPPRESS_UNTIL_KEY, String(until));
      } catch { }
    }

    function _isRefreshSuppressed(): boolean {
      try {
        const raw = sessionStorage.getItem(REFRESH_SUPPRESS_UNTIL_KEY);
        const until = raw ? Number(raw) : 0;
        return Number.isFinite(until) && until > Date.now();
      } catch {
        return false;
      }
    }

    /** Parsed JSON is cast (not validated), matching the original property reads. */
    function _readJsonLocalStorage<T>(key: string): T | null {
      try {
        const raw = String(localStorage.getItem(key) || '').trim();
        if (!raw) return null;
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    }

    function _writeJsonLocalStorage(key: string, value: unknown): boolean {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    }

    function _readLastRefreshOkAt(): number {
      try {
        const v = Number(localStorage.getItem(LAST_REFRESH_OK_AT_KEY) || 0);
        return Number.isFinite(v) ? v : 0;
      } catch {
        return 0;
      }
    }

    function _markRefreshOkNow(): void {
      try { localStorage.setItem(LAST_REFRESH_OK_AT_KEY, String(Date.now())); } catch { }
    }

    function _acquireRefreshLock(): boolean {
      const now = Date.now();
      const existing = _readJsonLocalStorage<RefreshLockRecord>(REFRESH_LOCK_KEY);
      if (existing && existing.owner && existing.owner !== TAB_ID) {
        const existingExp = Number(existing.expiresAt || 0);
        if (Number.isFinite(existingExp) && existingExp > now) {
          return false;
        }
      }
      const next = { owner: TAB_ID, expiresAt: now + REFRESH_LOCK_TTL_MS, ts: now };
      if (!_writeJsonLocalStorage(REFRESH_LOCK_KEY, next)) return false;
      const verify = _readJsonLocalStorage<RefreshLockRecord>(REFRESH_LOCK_KEY);
      return !!(verify && verify.owner === TAB_ID);
    }

    function _extendRefreshLock(): void {
      try {
        const current = _readJsonLocalStorage<RefreshLockRecord>(REFRESH_LOCK_KEY);
        if (!current || current.owner !== TAB_ID) return;
        _writeJsonLocalStorage(REFRESH_LOCK_KEY, {
          owner: TAB_ID,
          expiresAt: Date.now() + REFRESH_LOCK_TTL_MS,
          ts: Date.now()
        });
      } catch { }
    }

    function _releaseRefreshLock(): void {
      try {
        const current = _readJsonLocalStorage<RefreshLockRecord>(REFRESH_LOCK_KEY);
        if (current && current.owner === TAB_ID) {
          localStorage.removeItem(REFRESH_LOCK_KEY);
        }
      } catch { }
    }

    function _emitRefreshEvent(ok: unknown, reason: unknown): void {
      _writeJsonLocalStorage(REFRESH_EVENT_KEY, {
        owner: TAB_ID,
        ok: !!ok,
        reason: String(reason || ''),
        ts: Date.now()
      });
      if (ok) _markRefreshOkNow();
    }

    function _waitForRefreshFromOtherTab(): Promise<boolean> {
      return new Promise<boolean>(function (resolve) {
        let resolved = false;
        const startedAt = Date.now();

        function finish(value: unknown): void {
          if (resolved) return;
          resolved = true;
          try { window.removeEventListener('storage', onStorage); } catch { }
          resolve(!!value);
        }

        function onStorage(evt: StorageEvent): void {
          if (!evt) return;
          if (evt.key === REFRESH_EVENT_KEY && evt.newValue) {
            try {
              const payload = JSON.parse(evt.newValue) as RefreshEventRecord | null;
              if (!payload || payload.owner === TAB_ID) return;
              if ((Date.now() - Number(payload.ts || 0)) > REFRESH_WAIT_TIMEOUT_MS) return;
              finish(!!payload.ok);
            } catch { }
            return;
          }
          if (evt.key === REFRESH_LOCK_KEY && !evt.newValue) {
            // Lock released without event; fallback to checking current auth state.
            finish(hasAuthState() || !!getBearerFallback());
          }
        }

        try { window.addEventListener('storage', onStorage); } catch { }

        const timer = setInterval(function () {
          if (resolved) {
            clearInterval(timer);
            return;
          }
          const now = Date.now();
          if ((now - startedAt) >= REFRESH_WAIT_TIMEOUT_MS) {
            clearInterval(timer);
            finish(hasAuthState() || !!getBearerFallback());
            return;
          }
          const lock = _readJsonLocalStorage<RefreshLockRecord>(REFRESH_LOCK_KEY);
          if (!lock || !lock.owner) {
            clearInterval(timer);
            finish(hasAuthState() || !!getBearerFallback());
            return;
          }
          if (lock.owner !== TAB_ID) {
            const exp = Number(lock.expiresAt || 0);
            if (Number.isFinite(exp) && exp <= now) {
              clearInterval(timer);
              finish(hasAuthState() || !!getBearerFallback());
            }
          }
        }, 300);

        // Fast path: consume very recent refresh event if already published.
        const latest = _readJsonLocalStorage<RefreshEventRecord>(REFRESH_EVENT_KEY);
        if (latest && latest.owner !== TAB_ID && (Date.now() - Number(latest.ts || 0)) < 2500) {
          clearInterval(timer);
          finish(!!latest.ok);
        }
      });
    }

    function isTokenLikeKey(k: string): boolean {
      if (!k) return false;
      if (TOKEN_KEYS.has(k)) return true;
      // Supabase browser storage keys commonly look like: sb-<project>-auth-token
      if (/^sb-.*-auth-token$/i.test(k)) return true;
      return false;
    }

    const storageProto = Object.getPrototypeOf(localStorage) as AuthShimStorageProto;
    const _getItem = storageProto.getItem;
    const _setItem = storageProto.setItem;
    const _removeItem = storageProto.removeItem;
    const _key = storageProto.key;

    // One-time cleanup of any legacy auth tokens persisted before cookie migration.
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const keyName = _key.call(localStorage, i);
        const keyText = String(keyName || '');
        if (isTokenLikeKey(keyText) || keyText === 'getItem' || keyText === 'setItem' || keyText === 'removeItem') {
          keysToRemove.push(keyText);
        }
      }
      for (let j = 0; j < keysToRemove.length; j++) {
        try { _removeItem.call(localStorage, keysToRemove[j]); } catch { }
      }

      // Also clear legacy sessionStorage bearer keys from older teacher/user flows.
      // Keep paperx_bearer_fallback and session-state controls intact.
      const sessionLegacyKeys = [
        'teacherToken',
        'px_token',
        'px_auth_token',
        'userToken',
        'sb-access-token',
        'supabase.auth.token',
        'access_token',
        'auth_token',
        'px_token_expires_at'
      ];
      for (let s = 0; s < sessionLegacyKeys.length; s++) {
        try { sessionStorage.removeItem(sessionLegacyKeys[s]); } catch { }
      }
    } catch { }

    if (!storageProto.__paperxAuthShimPatched) {
      Object.defineProperty(storageProto, '__paperxAuthShimPatched', {
        value: true,
        configurable: false,
        enumerable: false,
        writable: false
      });

      storageProto.getItem = function (this: Storage, key: unknown): string | null {
        const k = String(key || '');
        if (this === localStorage && isTokenLikeKey(k)) {
          // Never expose persisted token values through localStorage reads.
          return hasAuthState() ? AUTH_SENTINEL : null;
        }
        return _getItem.call(this, k);
      };

      storageProto.setItem = function (this: Storage, key: unknown, value: unknown): void {
        const k = String(key || '');
        if (this === localStorage && isTokenLikeKey(k)) {
          // Never persist auth tokens in localStorage.
          const v = String(value || '').trim();
          if (v) setAuthStateMarker(true);
          return;
        }
        return _setItem.call(this, k, value as string);
      };

      storageProto.removeItem = function (this: Storage, key: unknown): void {
        const k = String(key || '');
        // Do not auto-call /logout here; many pages remove legacy token keys
        // during normal initialization/login cleanup. Explicit signout flows
        // should call /logout directly.
        return _removeItem.call(this, k);
      };
    }

    const _fetch = window.fetch.bind(window);
    function _originFromUrl(urlLike: unknown): string {
      try {
        return new URL(String(urlLike || ''), window.location.href).origin;
      } catch {
        return '';
      }
    }
    function _requestTarget(input: unknown): string {
      try {
        if (typeof input === 'string') return input;
        const withUrl = input as { url?: unknown } | null | undefined;
        if (withUrl && typeof withUrl.url === 'string') return withUrl.url;
      } catch { }
      return '';
    }
    /** Returns a falsy '' (not false) when the API origin is empty, as the original did. */
    function _isSameOriginUrl(urlLike: unknown): boolean | '' {
      const targetOrigin = _originFromUrl(urlLike);
      if (!targetOrigin) return true;
      try {
        const pageOrigin = window.location.origin;
        const apiOrigin = _originFromUrl(window.API_BASE || window.__API_BASE || pageOrigin);
        return targetOrigin === pageOrigin || (apiOrigin && targetOrigin === apiOrigin);
      } catch {
        return true;
      }
    }
    function _isUnsafeMethod(method: unknown): boolean {
      const m = String(method || 'GET').toUpperCase();
      return m === 'POST' || m === 'PUT' || m === 'PATCH' || m === 'DELETE';
    }
    function _pathFromRequest(input: unknown): string {
      try {
        const target = _requestTarget(input);
        if (!target) return '';
        return new URL(String(target), window.location.href).pathname || '';
      } catch {
        return '';
      }
    }
    function _readCookie(name: unknown): string {
      const key = String(name || '').trim();
      if (!key) return '';
      try {
        const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const m = document.cookie.match(new RegExp('(?:^|;\\s*)' + escaped + '=([^;]*)'));
        return m ? decodeURIComponent(m[1] || '') : '';
      } catch {
        return '';
      }
    }
    function _csrfCookieName(): string {
      const name = String(window.AUTH_CSRF_COOKIE_NAME || '').trim();
      return name || 'paperx_csrf';
    }

    function _isAuthEndpoint(pathname: string): boolean {
      return pathname === '/login' || pathname === '/refresh' || pathname === '/logout';
    }

    function _setBearerFallback(token: unknown): void {
      const t = String(token || '').trim();
      if (!t || t === AUTH_SENTINEL) return;
      try { sessionStorage.setItem(BEARER_FALLBACK_KEY, t); } catch { }
      try { localStorage.setItem(BEARER_FALLBACK_KEY, t); } catch { }
    }

    function _applyAuthStateFromResponse(pathname: string, response: Response): void {
      try {
        if (_isAuthEndpoint(pathname) && response.ok) {
          setAuthStateMarker(true);
        }
        if (pathname === '/api/me') {
          if (response.ok) setAuthStateMarker(true);
          if (response.status === 401) {
            // Keep state when cookie auth is present to prevent noisy sign-out loops
            // from transient /api/me auth races.
            if (hasAuthStateCookie()) {
              _suppressRefreshFor(30 * 1000);
            } else {
              setAuthStateMarker(false);
              clearBearerFallback();
            }
          }
        }
        if (pathname === '/logout' && response.ok) {
          setAuthStateMarker(false);
          clearBearerFallback();
        }
      } catch { }
    }

    let _refreshPromise: Promise<boolean> | null = null;
    function _attemptAutoRefresh(): Promise<boolean> {
      if (_refreshPromise) return _refreshPromise;

      const hasSessionState = hasAuthState() || !!getBearerFallback();
      if (hasSessionState) {
        const lastOkAt = _readLastRefreshOkAt();
        if (lastOkAt && (Date.now() - lastOkAt) < REFRESH_COOLDOWN_MS) {
          _refreshPromise = Promise.resolve(true);
          return _refreshPromise.finally(function () { _refreshPromise = null; });
        }
      }

      if (_isRefreshSuppressed()) {
        _refreshPromise = Promise.resolve(false);
        return _refreshPromise.finally(function () { _refreshPromise = null; });
      }

      if (!_acquireRefreshLock()) {
        _refreshPromise = _waitForRefreshFromOtherTab()
          .then(function (ok) {
            if (ok) return true;
            return hasAuthState() || !!getBearerFallback();
          })
          .finally(function () { _refreshPromise = null; });
        return _refreshPromise;
      }

      const apiBase = String(window.API_BASE || window.__API_BASE || '').replace(/\/$/, '');
      if (!apiBase) {
        _refreshPromise = Promise.resolve(false);
        return _refreshPromise.finally(function () {
          _emitRefreshEvent(false, 'missing-api-base');
          _releaseRefreshLock();
          _refreshPromise = null;
        });
      }

      const hasCookieSession = hasAuthStateCookie();
      // When cookie auth is present, prefer cookie-based refresh and avoid sending a potentially stale body token.
      const refreshTokenCandidate = hasCookieSession ? '' : _readRefreshCandidate();
      const bearerFallback = getBearerFallback();
      // If we only have a stale local "session marker" but no actual refresh credential,
      // skip /refresh to avoid repeated 400 loops and clear marker drift.
      if (!hasCookieSession && !refreshTokenCandidate) {
        if (!bearerFallback) {
          setAuthStateMarker(false);
        }
        _refreshPromise = Promise.resolve(!!bearerFallback);
        return _refreshPromise.finally(function () {
          _emitRefreshEvent(!!bearerFallback, 'no-refresh-credential');
          _releaseRefreshLock();
          _refreshPromise = null;
        });
      }

      const refreshUrl = apiBase + '/refresh';
      const refreshPayload = refreshTokenCandidate ? { refresh_token: refreshTokenCandidate } : {};
      _refreshPromise = _fetch(refreshUrl, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(refreshPayload)
      }).then(function (res): boolean | Promise<boolean> {
        _extendRefreshLock();
        if (!res.ok) {
          const hasCookie = hasAuthStateCookie();
          if (res.status === 429) {
            // Refresh storms can happen when many pages/tabs bootstrap together.
            // Back off without dropping current session markers.
            _suppressRefreshFor(2 * 60 * 1000);
            if (hasCookie) setAuthStateMarker(true);
            return false;
          }
          if (res.status === 400 || res.status === 401 || res.status === 403) {
            // Do not aggressively sign out if cookie-based auth still exists.
            if (!hasCookie) {
              setAuthStateMarker(false);
              clearBearerFallback();
            } else {
              setAuthStateMarker(true);
            }
            _suppressRefreshFor(2 * 60 * 1000);
            if (!hasCookie) {
              try { _removeItem.call(localStorage, 'px_refresh_token'); } catch { }
              try { sessionStorage.removeItem('px_refresh_token'); } catch { }
            }
          } else {
            _suppressRefreshFor(30 * 1000);
          }
          _emitRefreshEvent(false, 'refresh-http-' + String(res.status));
          return false;
        }
        return res.json().then(function (data: unknown): boolean {
          const body = data as RefreshResponseBody | null | undefined;
          const at = body && body.access_token ? String(body.access_token).trim() : '';
          if (at) {
            _setBearerFallback(at);
          } else if (hasAuthStateCookie()) {
            // If refresh succeeded through cookie-only path, ensure stale fallback bearer
            // does not override valid cookie-auth on subsequent requests.
            clearBearerFallback();
          }
          const ok = !!at || hasAuthStateCookie();
          if (ok) {
            setAuthStateMarker(true);
            try { sessionStorage.removeItem(REFRESH_SUPPRESS_UNTIL_KEY); } catch { }
          }
          _emitRefreshEvent(ok, ok ? 'refresh-ok' : 'refresh-no-token');
          return ok;
        }).catch(function (): boolean {
          const hasCookieAfter = hasAuthStateCookie();
          if (hasCookieAfter) {
            setAuthStateMarker(true);
            clearBearerFallback();
            try { sessionStorage.removeItem(REFRESH_SUPPRESS_UNTIL_KEY); } catch { }
            _emitRefreshEvent(true, 'refresh-ok-cookie-no-json');
            return true;
          }
          _emitRefreshEvent(false, 'refresh-no-json-no-cookie');
          return false;
        });
      }).catch(function (): boolean {
        _suppressRefreshFor(20 * 1000);
        _emitRefreshEvent(false, 'refresh-network-error');
        return false;
      }).finally(function () {
        _releaseRefreshLock();
        _refreshPromise = null;
      });

      return _refreshPromise;
    }

    // Public helper for pages that want to avoid first-request 401 latency.
    // It preserves security by using the same /refresh flow and cookie/CSRF behavior.
    window.__PX_ENSURE_AUTH_READY = function (): Promise<boolean> {
      try {
        if (!(hasAuthState() || !!getBearerFallback())) {
          return Promise.resolve(false);
        }
      } catch {
        return Promise.resolve(false);
      }
      return _attemptAutoRefresh().then(function (ok) { return !!ok; }).catch(function () { return false; });
    };

    window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      init = init || {};
      const req: ShimRequestInit = Object.assign({}, init);
      const isApiRequest = _isSameOriginUrl(_requestTarget(input));
      const reqPath = _pathFromRequest(input);
      if (!req.credentials) {
        req.credentials = isApiRequest ? 'include' : 'omit';
      }

      const headers = new Headers(req.headers || {});
      const authHeader = headers.get('Authorization') || headers.get('authorization');
      const cookieSessionPresent = hasAuthStateCookie();
      const bearerFallbackCurrent = getBearerFallback();
      if (authHeader) {
        const m = authHeader.match(/^\s*Bearer\s+(.+)\s*$/i);
        if (m && m[1] && String(m[1]).trim() === AUTH_SENTINEL) {
          headers.delete('Authorization');
          headers.delete('authorization');
        } else if (m && m[1] && cookieSessionPresent) {
          const incomingBearer = String(m[1] || '').trim();
          // If cookie auth exists and header is just the local fallback token,
          // prefer cookie transport to avoid stale bearer 401 races.
          if (bearerFallbackCurrent && incomingBearer === bearerFallbackCurrent) {
            headers.delete('Authorization');
            headers.delete('authorization');
          }
        }
      }

      // Cookie fallback for privacy/antivirus-restricted browsers:
      // if no Authorization header is present, attach short-lived in-tab bearer token
      // only when cookie session is not currently present.
      if (!headers.has('Authorization') && !headers.has('authorization') && isApiRequest && !cookieSessionPresent) {
        const fallbackToken = getBearerFallback();
        if (fallbackToken) {
          headers.set('Authorization', 'Bearer ' + fallbackToken);
        }
      }

      const method = String(req.method || (input && (input as { method?: unknown }).method) || 'GET').toUpperCase();
      if (_isUnsafeMethod(method) && isApiRequest) {
        const csrfToken = _readCookie(_csrfCookieName());
        if (csrfToken && !headers.has('X-CSRF-Token') && !headers.has('x-csrf-token')) {
          headers.set('X-CSRF-Token', csrfToken);
        }
      }

      req.headers = headers;
      return _fetch(input, req).then(function (response): Response | Promise<Response> {
        const canRetryOn401 =
          isApiRequest &&
          response.status === 401 &&
          !_isAuthEndpoint(reqPath) &&
          reqPath !== '/api/me' &&
          !req.__paperxRetried;

        // Some protected endpoints return 403 for expired/rotated auth state.
        // Allow a single refresh+retry only when we appear authenticated.
        const canRetryOn403 =
          isApiRequest &&
          response.status === 403 &&
          !_isAuthEndpoint(reqPath) &&
          !req.__paperxRetried &&
          (hasAuthState() || !!getBearerFallback());

        if (!canRetryOn401 && !canRetryOn403) {
          _applyAuthStateFromResponse(reqPath, response);
          return response;
        }

        return _attemptAutoRefresh().then(function (refreshed): Response | Promise<Response> {
          if (!refreshed) {
            _applyAuthStateFromResponse(reqPath, response);
            return response;
          }

          const retryReq: ShimRequestInit = Object.assign({}, req, { __paperxRetried: true });
          const retryHeaders = new Headers(retryReq.headers || {});
          // Drop stale bearer before retry; re-attach only when cookie session is absent.
          retryHeaders.delete('Authorization');
          retryHeaders.delete('authorization');
          if (!hasAuthStateCookie()) {
            const retryFallback = getBearerFallback();
            if (retryFallback) retryHeaders.set('Authorization', 'Bearer ' + retryFallback);
          }
          retryReq.headers = retryHeaders;

          return _fetch(input, retryReq).then(function (retryResponse) {
            _applyAuthStateFromResponse(reqPath, retryResponse);
            return retryResponse;
          }).catch(function () {
            _applyAuthStateFromResponse(reqPath, response);
            return response;
          });
        }).catch(function () {
          _applyAuthStateFromResponse(reqPath, response);
          return response;
        });
      }).catch(function (err: unknown) {
        throw err;
      });
    };
  } catch { }
}
