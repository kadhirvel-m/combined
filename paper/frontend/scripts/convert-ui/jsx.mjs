// Converts a parse5 DOM subtree into JSX source text that server-renders to the
// same DOM the browser built from the original HTML.

import { serialize, serializeOuter } from "parse5";
import {
  HTML_ATTRS,
  SVG_SPECIAL_ATTRS,
  WHITESPACE_INSENSITIVE_PARENTS,
  BLOCK_TAGS,
  VOID_ELEMENTS,
  INPUT_VALUE_ATTR_TYPES,
} from "./attributes.mjs";

const HTML_NS = "http://www.w3.org/1999/xhtml";
/** React props that are only typed on some elements; elsewhere they are passed through raw. */
const ELEMENT_SPECIFIC_ATTRS = {
  loading: ["img", "iframe"],
};
const SVG_NS = "http://www.w3.org/2000/svg";
const INDENT = "  ";

const JSX_ATTR_NAME = /^[A-Za-z_$][\w$-]*$/;
const JS_IDENT = /^[A-Za-z_$][\w$]*$/;
const PRE_TAGS = new Set(["pre", "listing", "xmp", "plaintext"]);
const PRE_CLASS = /(^|\s)(?:[\w-]+:)*whitespace-(?:pre|pre-line|pre-wrap|break-spaces)(\s|$)/;
const PRE_STYLE = /white-space\s*:\s*(?:pre|pre-line|pre-wrap|break-spaces)/i;
const INLINE_CLASS = /(^|\s|:)inline(\s|$)/;
const INLINE_ANY_CLASS = /(^|\s|:)(inline(-block|-flex|-grid|-table)?|contents|table-cell)(\s|$)/;
const NON_RENDERED = new Set(["script", "style", "link", "meta", "template", "noscript", "title", "base"]);
const BLOCK_SIBLING_TAGS = new Set([
  "address", "article", "aside", "blockquote", "dd", "details", "dialog", "div", "dl", "dt", "fieldset",
  "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hgroup", "hr",
  "li", "main", "nav", "ol", "p", "pre", "section", "summary", "table", "ul", "tr", "td", "th",
]);

function isBlockSibling(node) {
  if (!node || !node.tagName || node.namespaceURI !== HTML_NS) return false;
  if (!BLOCK_SIBLING_TAGS.has(node.tagName)) return false;
  if (INLINE_ANY_CLASS.test(getAttr(node, "class") ?? "")) return false;
  if (/display\s*:\s*(inline|contents|table-cell)/i.test(getAttr(node, "style") ?? "")) return false;
  return true;
}

export function attrName(attr) {
  return attr.prefix ? `${attr.prefix}:${attr.name}` : attr.name;
}

export function getAttr(el, name) {
  const a = el.attrs?.find((x) => attrName(x) === name);
  return a ? a.value : undefined;
}

export function hasAttr(el, name) {
  return !!el.attrs?.some((x) => attrName(x) === name);
}

/** Quote a string as a JSX attribute value. */
function jsxAttrValue(value) {
  if (!/["&\n\r\\{}]/.test(value)) return `"${value}"`;
  if (!/['&\n\r\\{}]/.test(value)) return `'${value}'`;
  return `{${JSON.stringify(value)}}`;
}

function jsString(value) {
  return JSON.stringify(value);
}

function propKey(key) {
  return JS_IDENT.test(key) ? key : JSON.stringify(key);
}

function camelCaseCss(prop) {
  if (prop.startsWith("--")) return prop;
  let p = prop.toLowerCase();
  let prefix = "";
  if (p.startsWith("-ms-")) {
    prefix = "ms";
    p = p.slice(4);
  } else if (p.startsWith("-")) {
    const m = p.match(/^-(\w+)-(.*)$/);
    if (m) {
      prefix = m[1][0].toUpperCase() + m[1].slice(1);
      p = m[2];
    }
  }
  const camel = p.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  if (!prefix) return camel;
  return prefix + camel[0].toUpperCase() + camel.slice(1);
}

/** Parse an inline `style` attribute into [property, value] pairs (last one wins). */
export function parseStyleAttr(style) {
  const text = style.replace(/\/\*[\s\S]*?\*\//g, "");
  const decls = [];
  let buf = "";
  let depth = 0;
  let quote = null;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      buf += ch;
      if (ch === "\\" && i + 1 < text.length) {
        buf += text[++i];
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      buf += ch;
      continue;
    }
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === ";" && depth === 0) {
      decls.push(buf);
      buf = "";
      continue;
    }
    buf += ch;
  }
  decls.push(buf);
  const out = new Map();
  for (const decl of decls) {
    const idx = decl.indexOf(":");
    if (idx < 0) continue;
    const prop = decl.slice(0, idx).trim();
    const value = decl.slice(idx + 1).trim();
    if (!prop || !value) continue;
    const key = camelCaseCss(prop);
    out.delete(key);
    out.set(key, value);
  }
  return [...out.entries()];
}

function styleExpression(style) {
  const entries = parseStyleAttr(style);
  if (!entries.length) return null;
  return `{{ ${entries.map(([k, v]) => `${propKey(k)}: ${jsString(v)}`).join(", ")} }}`;
}

/**
 * Collapse a text node the way CSS `white-space: normal` renders it.
 */
function collapse(text) {
  return text.replace(/[ \t\n\r\f]+/g, " ");
}

function isWhitespaceText(node) {
  return node.nodeName === "#text" && /^[ \t\n\r\f]*$/.test(node.value);
}

function isPreContext(el, parentPre) {
  if (parentPre) return true;
  if (PRE_TAGS.has(el.tagName)) return true;
  const cls = getAttr(el, "class");
  if (cls && PRE_CLASS.test(cls)) return true;
  const style = getAttr(el, "style");
  if (style && PRE_STYLE.test(style)) return true;
  return false;
}

function textToJsx(text, pre) {
  if (pre) return `{${jsString(text)}}`;
  const collapsed = collapse(text);
  if (!collapsed) return null;
  const safe = !/[{}<>&"']/.test(collapsed) && !/^ | $/.test(collapsed) && !collapsed.includes("  ");
  if (safe) return collapsed;
  return `{${jsString(collapsed)}}`;
}

function commentToJsx(text) {
  const body = text.replace(/\*\//g, "*\\/").trim();
  if (!body) return null;
  if (body.includes("\n")) {
    return `{/*\n${body}\n*/}`;
  }
  return `{/* ${body} */}`;
}

/**
 * The conversion context shared by one page.
 * @typedef {object} PageContext
 * @property {(el: any, ctx: any) => string[] | null} [elementHook] - returns JSX lines to replace an element, or null.
 * @property {Set<string>} customElements
 * @property {string[]} warnings
 */

export class JsxEmitter {
  /** @param {PageContext} page */
  constructor(page) {
    this.page = page;
  }

  /** Emit a list of child nodes as JSX lines. */
  children(parent, nodes, ctx, depth) {
    const lines = [];
    const tag = parent?.tagName;
    const wsInsensitive = parent && WHITESPACE_INSENSITIVE_PARENTS.has(tag);
    const block =
      parent &&
      BLOCK_TAGS.has(tag) &&
      !INLINE_CLASS.test(getAttr(parent, "class") ?? "") &&
      !/display\s*:\s*inline\s*(;|$)/i.test(getAttr(parent, "style") ?? "");

    // Treat comments as transparent when merging runs of whitespace.
    const items = [];
    for (const node of nodes) {
      if (node.nodeName === "#text" && !ctx.pre && isWhitespaceText(node)) {
        const last = items[items.length - 1];
        if (last && last.kind === "ws") continue;
        if (last && last.kind === "comment" && items[items.length - 2]?.kind === "ws") continue;
        items.push({ kind: "ws", node });
      } else if (node.nodeName === "#comment") {
        items.push({ kind: "comment", node });
      } else {
        items.push({ kind: "node", node });
      }
    }
    const firstContent = items.findIndex((it) => it.kind === "node");
    let lastContent = -1;
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].kind === "node") {
        lastContent = i;
        break;
      }
    }

    items.forEach((item, index) => {
      if (item.kind === "comment") {
        const c = commentToJsx(item.node.data);
        if (c) lines.push(...c.split("\n").map((l) => INDENT.repeat(depth) + l));
        return;
      }
      if (item.kind === "ws") {
        if (wsInsensitive) return;
        const leading = firstContent === -1 || index < firstContent;
        const trailing = index > lastContent;
        if ((leading || trailing) && block) return;
        const neighbour = (step) => {
          for (let j = index + step; j >= 0 && j < items.length; j += step) {
            const it = items[j];
            if (it.kind !== "node") continue;
            if (it.node.tagName && NON_RENDERED.has(it.node.tagName)) continue;
            return it.node;
          }
          return null;
        };
        const prev = neighbour(-1);
        const next = neighbour(1);
        if ((!prev || isBlockSibling(prev)) && (!next || isBlockSibling(next)) && (prev || next) && !leading && !trailing) return;
        lines.push(INDENT.repeat(depth) + `{" "}`);
        return;
      }
      lines.push(...this.node(item.node, ctx, depth));
    });
    return lines;
  }

  node(node, ctx, depth) {
    const pad = INDENT.repeat(depth);
    switch (node.nodeName) {
      case "#text": {
        const t = textToJsx(node.value, ctx.pre);
        return t === null ? [] : [pad + t];
      }
      case "#comment": {
        const c = commentToJsx(node.data);
        return c ? c.split("\n").map((l) => pad + l) : [];
      }
      case "#documentType":
        return [];
      default:
        return this.element(node, ctx, depth);
    }
  }

  element(el, ctx, depth) {
    const hooked = this.page.elementHook?.(el, ctx, depth, this);
    if (hooked) return hooked;

    const pad = INDENT.repeat(depth);
    const ns = el.namespaceURI;
    const tag = el.tagName;
    const isHtml = ns === HTML_NS;
    const isCustom = isHtml && tag.includes("-");
    const svg = ns === SVG_NS || (ctx.svg && ns !== HTML_NS);
    if (isCustom) this.page.customElements.add(tag);

    const { props, spread, marked } = this.attributes(el, { isHtml, isCustom, svg });

    // Element-specific content handling.
    let childLines = null;
    let innerHtml = null;
    if (isHtml && tag === "template") {
      innerHtml = serialize(el.content);
    } else if (isHtml && (tag === "noscript" || tag === "iframe")) {
      const raw = el.childNodes.map((n) => (n.nodeName === "#text" ? n.value : serializeOuter(n))).join("");
      if (raw.trim()) innerHtml = raw;
    } else if (tag === "style" || tag === "script") {
      const raw = el.childNodes.map((n) => n.value ?? "").join("");
      if (raw) innerHtml = raw;
    } else if (isHtml && tag === "textarea") {
      const raw = el.childNodes.map((n) => n.value ?? "").join("");
      if (raw) props.push(`defaultValue={${jsString(raw)}}`);
    } else if (isHtml && tag === "select") {
      const selected = [];
      const walk = (n) => {
        for (const c of n.childNodes ?? []) {
          if (c.tagName === "option") {
            if (hasAttr(c, "selected")) {
              const v = getAttr(c, "value");
              selected.push(v !== undefined ? v : collapse(textContent(c)).trim());
            }
          } else if (c.tagName === "optgroup") walk(c);
        }
      };
      walk(el);
      if (selected.length) {
        const multiple = hasAttr(el, "multiple");
        props.push(
          multiple
            ? `defaultValue={${JSON.stringify(selected)}}`
            : `defaultValue={${jsString(selected[selected.length - 1])}}`,
        );
      }
    }

    if (innerHtml !== null) {
      props.push(`dangerouslySetInnerHTML={{ __html: ${jsString(innerHtml)} }}`);
    } else if (!(isHtml && (VOID_ELEMENTS.has(tag) || tag === "textarea"))) {
      const childCtx = {
        svg,
        pre: isHtml ? isPreContext(el, ctx.pre) : ctx.pre,
      };
      childLines = this.children(el, el.childNodes ?? [], childCtx, depth + 1);
    }

    if (marked) props.push(`data-px=""`);
    if (spread.length) {
      const obj = `{ ${spread.map(([k, v]) => `${JSON.stringify(k)}: ${jsString(v)}`).join(", ")} }`;
      // A spread of only non-React attribute names trips TypeScript's weak-type check.
      props.push(props.length ? `{...${obj}}` : `{...(${obj} as Record<string, string>)}`);
    }

    const oneLine = `${pad}<${tag}${props.length ? " " + props.join(" ") : ""}`;
    const multiline = oneLine.length > 110 && props.length > 1;
    const head = multiline ? [`${pad}<${tag}`, ...props.map((p) => `${pad}${INDENT}${p}`)] : [oneLine];
    const hasChildren = childLines && childLines.length > 0;
    if (!hasChildren) {
      return multiline ? [...head, `${pad}/>`] : [`${oneLine} />`];
    }
    return [...(multiline ? [...head, `${pad}>`] : [`${oneLine}>`]), ...childLines, `${pad}</${tag}>`];
  }

  attributes(el, { isHtml, isCustom, svg }) {
    const props = [];
    const spread = [];
    let marked = false;
    const tag = el.tagName;
    const inputType = isHtml && tag === "input" ? (getAttr(el, "type") ?? "text").toLowerCase() : null;

    for (const attr of el.attrs ?? []) {
      const name = attrName(attr);
      const value = attr.value;
      const lower = name.toLowerCase();

      // Inline event handlers and javascript: URLs are restored by boot.ts.
      if (/^on[a-z]/.test(lower) && !isCustom) {
        props.push(`data-px-${lower}=${jsxAttrValue(value)}`);
        marked = true;
        continue;
      }
      // React blocks javascript: URLs and drops empty src/href attributes.
      if (
        ["href", "src", "action", "formaction"].includes(lower) &&
        (/^\s*javascript:/i.test(value) || ((lower === "src" || lower === "href") && value === ""))
      ) {
        props.push(`data-px-${lower}=${jsxAttrValue(value)}`);
        marked = true;
        continue;
      }
      if (lower === "style") {
        const expr = styleExpression(value);
        if (expr) props.push(`style=${expr}`);
        continue;
      }
      if (name.startsWith("@")) {
        spread.push([`x-on:${name.slice(1)}`, value]);
        continue;
      }
      if (lower.startsWith("data-") || lower.startsWith("aria-")) {
        if (JSX_ATTR_NAME.test(name)) props.push(`${name}=${jsxAttrValue(value)}`);
        else spread.push([name, value]);
        continue;
      }

      if (isCustom) {
        if (lower === "class") props.push(`className=${jsxAttrValue(value)}`);
        else if (JSX_ATTR_NAME.test(name)) props.push(`${name}=${jsxAttrValue(value)}`);
        else spread.push([name, value]);
        continue;
      }

      if (svg) {
        const special = SVG_SPECIAL_ATTRS[name];
        if (special) {
          props.push(special === "tabIndex" && /^-?\d+$/.test(value) ? `tabIndex={${value}}` : `${special}=${jsxAttrValue(value)}`);
          continue;
        }
        if (name.includes(":")) {
          spread.push([name, value]);
          continue;
        }
        const camel = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        if (JSX_ATTR_NAME.test(camel)) props.push(`${camel}=${jsxAttrValue(value)}`);
        else spread.push([name, value]);
        continue;
      }

      // HTML element.
      if (lower === "value" && tag === "input" && !INPUT_VALUE_ATTR_TYPES.has(inputType)) {
        props.push(`defaultValue=${jsxAttrValue(value)}`);
        continue;
      }
      if (lower === "selected" && tag === "option") {
        continue; // moved to <select defaultValue>
      }
      if (lower === "checked" && tag !== "input") {
        spread.push([name, value]);
        continue;
      }
      if (lower === "hidden" && value && value.toLowerCase() !== "hidden") {
        spread.push([name, value]);
        continue;
      }
      const allowedOn = ELEMENT_SPECIFIC_ATTRS[lower];
      if (allowedOn && !allowedOn.includes(tag)) {
        spread.push([name, value]);
        continue;
      }
      const mapping = HTML_ATTRS[lower];
      if (!mapping) {
        if (JSX_ATTR_NAME.test(name) && name.includes("-")) props.push(`${name}=${jsxAttrValue(value)}`);
        else spread.push([name, value]);
        continue;
      }
      const [reactName, kind] = mapping;
      switch (kind) {
        case "bool":
          props.push(reactName);
          break;
        case "num":
          if (/^-?\d+$/.test(value.trim())) props.push(`${reactName}={${Number(value.trim())}}`);
          else spread.push([name, value]);
          break;
        case "boolish":
          props.push(`${reactName}=${jsxAttrValue(value === "" ? "true" : value)}`);
          break;
        default:
          if (reactName === "download" && value === "") props.push("download");
          else if (reactName === "crossOrigin" && value === "") props.push(`crossOrigin=""`);
          else props.push(`${reactName}=${jsxAttrValue(value)}`);
      }
    }
    return { props, spread, marked };
  }
}

export function textContent(node) {
  if (node.nodeName === "#text") return node.value;
  return (node.childNodes ?? []).map(textContent).join("");
}
