import { fromHtml } from "hast-util-from-html";
import { toText } from "hast-util-to-text";
import { remove } from "unist-util-remove";
import type { Node } from "unist";
import type { Element } from "hast";

function isHeadingAnchor(node: Node): node is Element {
  const element = node as Element;
  return (
    node.type === "element" &&
    element.tagName === "a" &&
    Array.isArray(element.properties.className) &&
    element.properties.className.includes("anchor")
  );
}

/** Builds a short plain-text excerpt from an article's rendered HTML. */
export function excerptFromHtml(html: string | undefined, maxLength = 120): string | undefined {
  if (!html) return undefined;

  const tree = fromHtml(html, { fragment: true });

  // Drop the "#" anchor links rehype-autolink-headings appends to headings;
  // they're navigation, not article content.
  remove(tree, isHeadingAnchor);

  const text = toText(tree).replace(/\s+/g, " ").trim();
  if (!text) return undefined;
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}
