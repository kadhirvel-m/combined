/**
 * Production log hygiene:
 * - Keep console noise out of production by default (console.log/info/debug
 *   become no-ops; warn/error are untouched).
 * - Local/dev can opt in with localStorage.DEBUG_CONSOLE = '1'.
 */
export function install(): void {
  try {
    const host = (typeof location !== 'undefined' && location.hostname) ? location.hostname : '';
    const isLocalHost = /^(localhost|127\.0\.0\.1|::1)$/i.test(host);
    let debugEnabled = false;
    try {
      debugEnabled = String(localStorage.getItem('DEBUG_CONSOLE') || '').trim() === '1';
    } catch { }
    if (isLocalHost || debugEnabled || !window.console) return;

    const noop = function () { };
    try { window.console.log = noop; } catch { }
    try { window.console.info = noop; } catch { }
    try { window.console.debug = noop; } catch { }
  } catch { }
}
