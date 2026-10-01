import { install as installApiBase } from './api-base';
import { install as installConsoleHygiene } from './console-hygiene';
import { install as installHtmlSanitizer } from './html-sanitizer';
import { install as installAuthShim } from './auth-shim';
import { install as installTheme } from './theme';
import { install as installTuneAiFlags } from './tune-ai-flags';
import { install as installNavDropdowns } from './nav-dropdowns';
import { install as installTuneAiWidget } from './tune-ai-widget';

/** Report an error the way an uncaught exception in a classic script would be. */
function reportUncaught(err: unknown): void {
  if (typeof reportError === 'function') {
    reportError(err);
    return;
  }
  setTimeout(function () { throw err; }, 0);
}

function runSection(section: () => void): void {
  try {
    section();
  } catch (err) {
    reportUncaught(err);
  }
}

/**
 * Installs every config.js section once per page. Also used by the React
 * (site) pages, which share the same cookie/CSRF/refresh auth behaviour.
 */
export function installConfigRuntime(): void {
  if (typeof window === 'undefined' || window.__PX_RUNTIME_CONFIG_INSTALLED) return;
  window.__PX_RUNTIME_CONFIG_INSTALLED = true;

  runSection(installApiBase);
  runSection(installConsoleHygiene);
  runSection(installHtmlSanitizer);
  runSection(installAuthShim);
  runSection(installTheme);
  runSection(installTuneAiFlags);
  runSection(installNavDropdowns);
  runSection(installTuneAiWidget);
}

/**
 * The subset of config.js that React pages need: API base, console hygiene,
 * the cookie/CSRF/refresh auth shim for fetch, and the theme manager.
 *
 * Deliberately NOT installed for React pages:
 *  - html-sanitizer: it rewrites every innerHTML assignment, which breaks how
 *    React creates <script> elements on the client (`div.innerHTML =
 *    "<script></script>"`). React escapes what it renders, and the Markdown
 *    component sanitizes with DOMPurify.
 *  - nav-dropdowns / tune-ai-*: they wire up legacy navbar markup by id.
 */
export function installReactRuntime(): void {
  if (typeof window === 'undefined' || window.__PX_RUNTIME_CONFIG_INSTALLED) return;
  window.__PX_RUNTIME_CONFIG_INSTALLED = true;

  runSection(installApiBase);
  runSection(installConsoleHygiene);
  runSection(installAuthShim);
  runSection(installTheme);
}
