import type { PxThemeName } from '../types';

/**
 * Global Theme manager: keep theme consistent across pages.
 * Uses a single localStorage key 'px_theme' for all pages (older keys are
 * migrated once and removed).
 *
 * Applies `class="dark"`, `data-theme` and `color-scheme` on <html>, exposes
 * `window.Theme` and (unless the page defined one) `window.toggleTheme`, and
 * follows the system preference while nothing is stored.
 */
export function install(): void {
  try {
    const KEY = 'px_theme';
    const OLD_KEYS = ['cx-theme', 'theme', 'px-theme'];
    const root = document.documentElement;

    // One-time migration: copy value from any old key into px_theme, then delete old keys
    function migrateOldKeys(): void {
      try {
        const current = localStorage.getItem(KEY);
        if (!current) {
          for (let i = 0; i < OLD_KEYS.length; i++) {
            const v = localStorage.getItem(OLD_KEYS[i]);
            if (v === 'dark' || v === 'light') { localStorage.setItem(KEY, v); break; }
          }
        }
        for (let j = 0; j < OLD_KEYS.length; j++) {
          try { localStorage.removeItem(OLD_KEYS[j]); } catch { }
        }
      } catch { }
    }

    function readStored(): string | null {
      try { return localStorage.getItem(KEY); } catch { }
      return null;
    }

    function writeStored(val: string): void {
      try { localStorage.setItem(KEY, val); } catch { }
    }

    function apply(val: unknown): PxThemeName {
      const wantDark = (val === 'dark');
      root.classList.toggle('dark', wantDark);
      try { root.setAttribute('data-theme', wantDark ? 'dark' : 'light'); } catch { }
      writeStored(wantDark ? 'dark' : 'light');
      try { root.style.colorScheme = wantDark ? 'dark' : 'light'; } catch { }
      return wantDark ? 'dark' : 'light';
    }

    function init(): void {
      migrateOldKeys();
      let stored = readStored();
      if (!stored) {
        let prefersDark = false;
        try { prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; } catch { }
        stored = prefersDark ? 'dark' : 'light';
      }
      apply(stored);
    }

    function get(): string { return (readStored() || (root.classList.contains('dark') ? 'dark' : 'light')); }
    function set(val: unknown): PxThemeName { return apply(val === 'dark' ? 'dark' : 'light'); }
    function toggle(): PxThemeName { return apply(get() === 'dark' ? 'light' : 'dark'); }

    // Expose and initialize
    window.Theme = { get: get, set: set, toggle: toggle, init: init };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();

    // Back-compat for pages using onclick="toggleTheme()"
    if (typeof window.toggleTheme !== 'function') window.toggleTheme = toggle;

    // Sync on system preference changes
    try {
      if (window.matchMedia) {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        // Original: `mq.addEventListener && mq.addEventListener('change', ...)`
        // (older Safari MediaQueryList has no addEventListener).
        if (mq.addEventListener) {
          mq.addEventListener('change', function (e) {
            const stored = readStored();
            if (!stored) apply(e.matches ? 'dark' : 'light');
          });
        }
      }
    } catch { }
  } catch { }
}
