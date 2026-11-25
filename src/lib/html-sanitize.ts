const ALLOWED_TAGS = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "span",
  "a",
  "img",
  "ul",
  "ol",
  "li",
  "blockquote",
  "hr",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "div",
  "figure",
  "figcaption",
  "font",
]);

const SELF_CLOSING_TAGS = new Set(["br", "hr", "img"]);

const BLOCKED_CONTENT_TAGS =
  /<(script|iframe|object|embed|style|form|noscript|svg|math|template)\b[^>]*>[\s\S]*?<\/\1>/gi;
const BLOCKED_SELF_CLOSING_TAGS =
  /<(script|iframe|object|embed|style|form|input|button|select|textarea|meta|link|base)\b[^>]*\/?>/gi;

function isSafeUrl(url: string, allowDataImage: boolean): boolean {
  const cleaned = url.replace(/[\u0000-\u0020]+/g, "").toLowerCase();
  if (
    cleaned.startsWith("javascript:") ||
    cleaned.startsWith("vbscript:") ||
    cleaned.startsWith("data:text/html")
  ) {
    return false;
  }
  if (cleaned.startsWith("data:") && !allowDataImage) {
    return false;
  }
  if (
    allowDataImage &&
    cleaned.startsWith("data:") &&
    !/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(cleaned)
  ) {
    return false;
  }
  return true;
}

function sanitizeStyleAttr(rawStyle: string): string {
  const safeProps: string[] = [];
  for (const part of rawStyle.split(";")) {
    const colonIdx = part.indexOf(":");
    if (colonIdx === -1) continue;
    const prop = part.slice(0, colonIdx).trim().toLowerCase();
    const val = part.slice(colonIdx + 1).trim();
    if (!val || /url\s*\(|expression\s*\(|javascript:/i.test(val)) continue;
    if (
      prop === "color" ||
      prop === "background-color" ||
      prop === "text-align" ||
      prop === "font-family" ||
      prop === "font-size" ||
      prop === "font-weight" ||
      prop === "font-style" ||
      prop === "text-decoration"
    ) {
      safeProps.push(`${prop}: ${val.replace(/[<>"]/g, "")}`);
    }
  }
  return safeProps.join("; ");
}

function filterAttributes(tagName: string, rawAttrs: string): string {
  if (!rawAttrs.trim()) return "";
  const attrRegex =
    /([a-zA-Z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  const kept: string[] = [];
  let hasTargetBlank = false;
  let hasRel = false;

  let match: RegExpExecArray | null;
  while ((match = attrRegex.exec(rawAttrs)) !== null) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? "";

    if (name.startsWith("on")) continue;

    if (name === "style") {
      const cleanedStyle = sanitizeStyleAttr(value);
      if (cleanedStyle) kept.push(`style="${cleanedStyle}"`);
      continue;
    }

    if (tagName === "a") {
      if (name === "href" && isSafeUrl(value, false)) {
        kept.push(`href="${value.replace(/"/g, "&quot;")}"`);
      } else if (name === "target" && value === "_blank") {
        hasTargetBlank = true;
        kept.push(`target="_blank"`);
      } else if (name === "rel") {
        hasRel = true;
        kept.push(`rel="noopener noreferrer"`);
      } else if (name === "title") {
        kept.push(`title="${value.replace(/"/g, "&quot;")}"`);
      }
      continue;
    }

    if (tagName === "img") {
      if (name === "src" && isSafeUrl(value, true)) {
        kept.push(`src="${value.replace(/"/g, "&quot;")}"`);
      } else if (name === "alt" || name === "title") {
        kept.push(`${name}="${value.replace(/"/g, "&quot;")}"`);
      } else if ((name === "width" || name === "height") && /^\d+$/.test(value)) {
        kept.push(`${name}="${value}"`);
      }
      continue;
    }

    if (tagName === "font") {
      if (name === "color" && /^[#a-zA-Z0-9(),.\s%-]+$/.test(value)) {
        kept.push(`color="${value}"`);
      } else if (name === "face" && /^[a-zA-Z0-9,\s_-]+$/.test(value)) {
        kept.push(`face="${value}"`);
      } else if (name === "size" && /^[1-7]$/.test(value)) {
        kept.push(`size="${value}"`);
      }
      continue;
    }

    if ((tagName === "td" || tagName === "th") && (name === "colspan" || name === "rowspan")) {
      if (/^\d+$/.test(value)) kept.push(`${name}="${value}"`);
      continue;
    }

    if (name === "align" && /^(left|center|right|justify)$/i.test(value)) {
      kept.push(`align="${value.toLowerCase()}"`);
    }
  }

  if (tagName === "a" && hasTargetBlank && !hasRel) {
    kept.push(`rel="noopener noreferrer"`);
  }

  return kept.length > 0 ? ` ${kept.join(" ")}` : "";
}

/**
 * Sanitizes admin-authored rich HTML before storage or rendering.
 */
export function sanitizeRichHtml(rawHtml: string): string {
  if (!rawHtml || !rawHtml.trim()) return "";

  let cleaned = rawHtml
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(BLOCKED_CONTENT_TAGS, "")
    .replace(BLOCKED_SELF_CLOSING_TAGS, "");

  cleaned = cleaned.replace(
    /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g,
    (_full, slash: string, rawTag: string, rawAttrs: string) => {
      const tag = rawTag.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) {
        return "";
      }
      if (slash === "/") {
        return SELF_CLOSING_TAGS.has(tag) ? "" : `</${tag}>`;
      }
      const attrs = filterAttributes(tag, rawAttrs || "");
      return SELF_CLOSING_TAGS.has(tag) ? `<${tag}${attrs} />` : `<${tag}${attrs}>`;
    }
  );

  return cleaned.trim();
}
