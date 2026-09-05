# Markdown / MDX

Articles live in `src/content/articles/<year>/*.{md,mdx}`, specs in `src/content/specs/*.mdx`. Schemas are enforced by Zod in `src/content.config.ts` — see `astro.md` for the field list.

## Frontmatter conventions

```yaml
---
title: string
pubDate: 2026-3-2 # coerced to Date; loose formats accepted
updatedDate: 2026-3-2
url: https://zenn.dev/... # optional: mark this entry as a stub, see below
draft: true # optional, default false
description: string # optional, falls back to an HTML excerpt (lib/excerpt.ts) or SITE_DESCRIPTION
tags: [foo, bar] # optional, default []
image: /path/to/image # optional, overrides the generated OG image
---
```

Two frontmatter fields change how a page renders instead of just describing it (handled in `src/pages/articles/[...slug].astro`):

- `draft: true` — page shows a loading state and redirects to `/`; use for in-progress posts that shouldn't be public yet but need a stable id/URL.
- `url` set — treat the local file as a stub for a post actually published elsewhere (e.g. cross-posted to Zenn); the page body is effectively unused and the reader gets redirected to `url`.

## Remark/rehype pipeline (`astro.config.mjs`)

Remark (Markdown-AST) plugins, in order: `remark-link-card` (auto-embeds bare links as rich cards, `shortenUrl: true`), `remark-math`, `remark-github-admonitions-to-directives` (turns GitHub's `> [!NOTE]`-style admonitions into directive syntax), `remark-directive` (enables `:::`-style container directives), `remark-sectionize` (wraps each heading + its content in a `<section>`).

Rehype (HTML-AST) plugins, in order: `rehype-katex` (renders the math directives), `rehype-slug` (adds heading `id`s), `rehype-raw` (allows raw HTML embedded in Markdown to pass through), `rehype-external-links` (`target: "_blank"` on external links), `rehype-autolink-headings` (appends a `#`-icon anchor link to each heading, `className: anchor`/`anchor-icon`, marked `data-pagefind-ignore` so anchor icons don't pollute search results).

If you need a new remark/rehype behavior, add it to these arrays in `astro.config.mjs` rather than post-processing HTML elsewhere — content passes through this single pipeline for both `.md` and `.mdx`.

## Rendering wrapper

Rendered content is always wrapped by `MarkDown.astro` (`prose dark:prose-invert prose-base !max-w-none custom-md`, see `design.md`) inside `BlogLayout.astro`. Custom component usage inside `.mdx` files is otherwise plain Astro/MDX — no global MDX component overrides are configured.
