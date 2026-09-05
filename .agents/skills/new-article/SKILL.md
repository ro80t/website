---
name: new-article
description: Scaffold a new WKTK.moe blog article with frontmatter matching this repo's content collection schema. Use when the user asks to write, start, draft, or add a new blog post/article for this site.
version: 1.0.0
---

# New article

Creates a new entry in the `articles` content collection (`src/content/articles/<year>/<slug>.{md,mdx}`), matching the Zod schema in `src/content.config.ts` (see `.claude/docs/astro.md` and `.claude/docs/markdown.md` for the full model).

## Steps

1. **Pick the file location.** `src/content/articles/<year>/<slug>.md` — `<year>` is the current year; create the year folder if it doesn't exist yet. Use `.mdx` instead of `.md` only if the post needs MDX-specific features (custom components, JSX expressions); otherwise prefer plain `.md`.
2. **Pick a slug.** Kebab-case, ASCII, short — derived from the English gist of the topic, not a transliteration of the Japanese title. Look at existing slugs for tone (`type-interence`, `is-a-dev`, `dns-check`, `github-stats-trophy`).
3. **Write the frontmatter:**
   ```yaml
   ---
   title: string # required, Japanese is fine
   pubDate: YYYY-M-D # required — today's date unless told otherwise
   updatedDate: YYYY-M-D # required — same as pubDate for a new post
   description: string # optional — otherwise the site falls back to an HTML excerpt or the site description
   tags: [tag1, tag2] # optional, default []
   image: /path/to/image # optional — otherwise an OG image is auto-generated
   ---
   ```
   Two more fields change how the page behaves instead of just describing it — only set these when they actually apply:
   - `draft: true` — the post exists (stable id/URL) but isn't public yet; the page shows a loading state and redirects to `/`. Don't set this just because a post is short or unfinished-feeling; only for posts that shouldn't be visible at all yet.
   - `url: https://...` — the post is a **stub**: content actually lives elsewhere (e.g. cross-posted to Zenn/Qiita) and this page only exists to redirect readers there. Only set this if the user is explicitly cross-posting; don't set it just because another site is mentioned as a reference/inspiration.
4. **Write the body** in Japanese, matching the site's existing tone (`SITE_DESCRIPTION`: プログラマー向けの記事). Use the Markdown features documented in `.claude/docs/markdown.md` (math, GitHub-style admonitions, link cards, etc.) as needed — no special component imports are required for plain content.
5. Suggest previewing with `npm run dev` before finishing.

## Out of scope

Do not commit, push, or open a pull request for the new article — per this repo's `CLAUDE.md` Git workflow policy, those only happen via the `/commit-push` and `/open-pr` commands, on explicit user request.
