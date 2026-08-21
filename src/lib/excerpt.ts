/** Strips tags and decodes entities from rendered article HTML down to plain text. */
function stripHtml(html: string): string {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ") // drop non-visible content
    .replace(/<a[^>]*class="anchor"[^>]*>[\s\S]*?<\/a>/gi, " ") // heading anchor links (e.g. "#")
    .replace(/<[^>]+>/g, " ") // strip tags
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** Builds a short plain-text excerpt from an article's rendered HTML. */
export function excerptFromHtml(html: string | undefined, maxLength = 120): string | undefined {
  const text = html && stripHtml(html);
  if (!text) return undefined;
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}
