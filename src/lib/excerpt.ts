/** Roughly strips Markdown/MDX syntax down to plain text. */
function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/^---\n[\s\S]*?\n---\n/, "") // leftover frontmatter
    .replace(/```[\s\S]*?```/g, " ") // fenced code blocks
    .replace(/`[^`]*`/g, " ") // inline code
    .replace(/<[^>]+>/g, " ") // html/jsx tags
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> link text
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/^:{3,}.*$/gm, "") // remark-directive admonitions
    .replace(/^>\s?/gm, "") // blockquotes
    .replace(/^[-*+]\s+/gm, "") // unordered list bullets
    .replace(/^\d+\.\s+/gm, "") // ordered list numbers
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, "$1") // emphasis/bold/strikethrough
    .replace(/\\([\\`*_{}[\]()#+\-.!])/g, "$1") // escaped characters
    .replace(/\s+/g, " ")
    .trim();
}

/** Builds a short plain-text excerpt from an article's raw Markdown/MDX body. */
export function excerptFromBody(body: string | undefined, maxLength = 120): string | undefined {
  const text = body && stripMarkdown(body);
  if (!text) return undefined;
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}
