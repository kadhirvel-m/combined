/**
 * Inline bootstrap that runs in <head> before any page content is parsed.
 *
 * React cannot server-render a few things the legacy markup relies on, so the
 * converter encodes them as `data-px-*` attributes (plus a `data-px` marker)
 * and this script restores the real attributes while the document is parsed:
 *
 *  - inline event handlers (`onclick="…"`, `onchange="…"`, …): React drops
 *    string `on*` attributes, so they are emitted as `data-px-onclick="…"`.
 *  - `javascript:` URLs, which React replaces with an error-throwing URL.
 *  - Alpine shorthand attributes (`@click`) that React refuses to render.
 *
 * A MutationObserver converts elements as the parser inserts them. Mutation
 * records are delivered at the microtask checkpoint the parser performs
 * before running each <script>, so every page script sees the original
 * attributes, exactly as it did when the page was a static .html file.
 *
 * `__pxBoot(cfg)` is called as the first element of every converted page: it
 * copies the original `<html>`/`<body>` attributes onto the shared root layout.
 */
export const LEGACY_BOOT_SCRIPT = `(function () {
  var MARK = "data-px";
  var PREFIX = "data-px-";

  function restore(el) {
    if (!el || el.nodeType !== 1 || !el.hasAttribute(MARK)) return;
    el.removeAttribute(MARK);
    var attrs = Array.prototype.slice.call(el.attributes);
    for (var i = 0; i < attrs.length; i++) {
      var name = attrs[i].name;
      if (name.indexOf(PREFIX) !== 0) continue;
      el.removeAttribute(name);
      try { el.setAttribute(name.slice(PREFIX.length), attrs[i].value); } catch (_) {}
    }
  }

  function sweep() {
    var pending = document.querySelectorAll("[" + MARK + "]");
    for (var i = 0; i < pending.length; i++) restore(pending[i]);
  }

  var observer = new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
      var added = records[i].addedNodes;
      for (var j = 0; j < added.length; j++) restore(added[j]);
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", function () {
    sweep();
    observer.disconnect();
  }, { once: true });

  function apply(el, attrs, mergeClasses) {
    if (!el || !attrs) return;
    for (var name in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, name)) continue;
      var value = attrs[name];
      if (name === "class" && mergeClasses) {
        var classes = String(value).split(/\\s+/);
        for (var i = 0; i < classes.length; i++) if (classes[i]) el.classList.add(classes[i]);
        continue;
      }
      var attrName = name.charAt(0) === "@" ? "x-on:" + name.slice(1) : name;
      try { el.setAttribute(attrName, value); } catch (_) {}
    }
  }

  window.__pxBoot = function (cfg) {
    var root = document.documentElement;
    var html = (cfg && cfg.html) || {};
    if (!Object.prototype.hasOwnProperty.call(html, "lang")) root.removeAttribute("lang");
    apply(root, html, true);
    apply(document.body, (cfg && cfg.body) || {}, false);
    sweep();
  };
})();`;
