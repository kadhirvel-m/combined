/** Element.prototype plus the non-writable guard flag this section defines on it. */
type SanitizerProto = Element & { __paperxInnerHtmlSanitized?: boolean };

/**
 * Global HTML hardening:
 * - Exposes `window.escapeHtml` / `window.sanitizeHtml` (unless the page defined its own).
 * - Sanitizes all string assignments to `element.innerHTML` by default.
 * - Sanitizes `insertAdjacentHTML` and `outerHTML` string writes as well.
 * - Opt out only for trusted static markup via `data-trusted-html="true"` on the
 *   element being written to.
 *
 * Patches Element.prototype once per page (guarded by the non-writable
 * `__paperxInnerHtmlSanitized` flag).
 */
export function install(): void {
  try {
    const proto: SanitizerProto | undefined = Element && Element.prototype;
    const originalDescriptor = proto ? Object.getOwnPropertyDescriptor(proto, 'innerHTML') : null;
    const outerDescriptor = proto ? Object.getOwnPropertyDescriptor(proto, 'outerHTML') : null;
    const originalInsertAdjacentHTML = proto && proto.insertAdjacentHTML;

    function escapeHtml(value: unknown): string {
      return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[ch];
      });
    }

    function _setRawInnerHTML(el: Element, html: string): void {
      if (originalDescriptor && typeof originalDescriptor.set === 'function') {
        return originalDescriptor.set.call(el, html);
      }
      el.innerHTML = html;
    }

    function _getRawInnerHTML(el: Element): string {
      if (originalDescriptor && typeof originalDescriptor.get === 'function') {
        return originalDescriptor.get.call(el);
      }
      return el.innerHTML;
    }

    function sanitizeHtml(raw: unknown): string {
      const template = document.createElement('template');
      _setRawInnerHTML(template, String(raw == null ? '' : raw));

      const blockedTags = new Set(['script', 'iframe', 'object', 'embed', 'meta', 'link', 'base']);
      const urlAttrs = new Set(['href', 'src', 'xlink:href', 'formaction', 'poster', 'action']);
      const toRemove: Element[] = [];
      const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT, null);
      let node: Element | null;

      while ((node = walker.nextNode() as Element | null)) {
        const tag = String(node.tagName || '').toLowerCase();
        if (blockedTags.has(tag)) {
          toRemove.push(node);
          continue;
        }

        const attrs = Array.from(node.attributes || []);
        for (let i = 0; i < attrs.length; i++) {
          const attr = attrs[i];
          const name = String(attr.name || '').toLowerCase();
          const value = String(attr.value || '');

          if (name.indexOf('on') === 0) {
            node.removeAttribute(attr.name);
            continue;
          }
          if (name === 'srcdoc') {
            node.removeAttribute(attr.name);
            continue;
          }
          if (urlAttrs.has(name) && /^\s*javascript:/i.test(value)) {
            node.removeAttribute(attr.name);
            continue;
          }
          if (name === 'style' && /expression\s*\(|url\s*\(\s*['"]?\s*javascript:/i.test(value)) {
            node.removeAttribute(attr.name);
          }
        }
      }

      for (let j = 0; j < toRemove.length; j++) {
        try { toRemove[j].remove(); } catch { }
      }
      return _getRawInnerHTML(template);
    }

    if (typeof window.escapeHtml !== 'function') {
      window.escapeHtml = escapeHtml;
    }
    if (typeof window.sanitizeHtml !== 'function') {
      window.sanitizeHtml = sanitizeHtml;
    }

    if (!proto || proto.__paperxInnerHtmlSanitized) return;

    if (!originalDescriptor || typeof originalDescriptor.set !== 'function' || typeof originalDescriptor.get !== 'function') return;

    // The descriptor object is private to this closure, so holding its accessors
    // directly is equivalent to re-reading `originalDescriptor.get/set` per call.
    const innerGet = originalDescriptor.get;
    const innerSet = originalDescriptor.set;

    Object.defineProperty(proto, '__paperxInnerHtmlSanitized', {
      value: true,
      configurable: false,
      enumerable: false,
      writable: false
    });

    Object.defineProperty(proto, 'innerHTML', {
      configurable: true,
      enumerable: originalDescriptor.enumerable,
      get: function (this: Element) {
        return innerGet.call(this);
      },
      set: function (this: Element, value: unknown) {
        if (typeof value === 'string' && !(this && this.getAttribute && this.getAttribute('data-trusted-html') === 'true')) {
          return innerSet.call(this, sanitizeHtml(value));
        }
        return innerSet.call(this, value);
      }
    });

    if (outerDescriptor && typeof outerDescriptor.set === 'function' && typeof outerDescriptor.get === 'function') {
      const outerGet = outerDescriptor.get;
      const outerSet = outerDescriptor.set;
      Object.defineProperty(proto, 'outerHTML', {
        configurable: true,
        enumerable: outerDescriptor.enumerable,
        get: function (this: Element) {
          return outerGet.call(this);
        },
        set: function (this: Element, value: unknown) {
          if (typeof value === 'string' && !(this && this.getAttribute && this.getAttribute('data-trusted-html') === 'true')) {
            return outerSet.call(this, sanitizeHtml(value));
          }
          return outerSet.call(this, value);
        }
      });
    }

    if (typeof originalInsertAdjacentHTML === 'function') {
      proto.insertAdjacentHTML = function (this: Element, position: InsertPosition, text: unknown): void {
        if (typeof text === 'string' && !(this && this.getAttribute && this.getAttribute('data-trusted-html') === 'true')) {
          return originalInsertAdjacentHTML.call(this, position, sanitizeHtml(text));
        }
        return originalInsertAdjacentHTML.call(this, position, text as string);
      };
    }
  } catch { }
}
