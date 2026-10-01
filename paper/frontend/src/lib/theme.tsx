"use client";

/**
 * Light/dark theme, shared with the legacy pages through the same
 * `localStorage.px_theme` key and the `dark` class on <html>.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemeName = "light" | "dark";
const STORAGE_KEY = "px_theme";

/**
 * Runs before first paint (rendered inline by the site layout) so there is no
 * light/dark flash. Mirrors the config.js theme manager's `init()`.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var k="${STORAGE_KEY}",s=localStorage.getItem(k);if(s!=="dark"&&s!=="light"){s=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}var r=document.documentElement,d=s==="dark";r.classList.toggle("dark",d);r.setAttribute("data-theme",s);r.style.colorScheme=s}catch(e){}})();`;

function currentTheme(): ThemeName {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyTheme(theme: ThemeName) {
  // Prefer the shared runtime manager so legacy listeners stay in sync.
  if (window.Theme && typeof window.Theme.set === "function") {
    window.Theme.set(theme);
    return;
  }
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {}
}

interface ThemeValue {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("light");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with the class set by THEME_INIT_SCRIPT
    setThemeState(currentTheme());
    // Follow changes made elsewhere (window.Theme, other tabs via the runtime).
    const observer = new MutationObserver(() => setThemeState(currentTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === "dark" || e.newValue === "light")) applyTheme(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => {
      observer.disconnect();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setTheme = useCallback((next: ThemeName) => applyTheme(next), []);
  const toggleTheme = useCallback(() => applyTheme(currentTheme() === "dark" ? "light" : "dark"), []);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
