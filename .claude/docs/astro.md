# Astro

Astro `^7`, static output (no adapter configured), Node 24. `astro.config.mjs` sets `site: "https://wktk.moe"` and reads `base` from the `BASE_PATH` env var (used by PR preview builds — see `github-pages.md`).

## Content collections

Defined in `src/content.config.ts` with the `glob` loader and Zod schemas:

- `articles` — `src/content/articles/<year>/*.{md,mdx}`. Frontmatter: `title`, `pubDate`, `updatedDate`, optional `description`, `url`, `draft` (default `false`), `tags` (default `[]`), `image`.
- `specs` — `src/content/specs/*.mdx` (currently `about.mdx`, `portfolio.mdx`). Frontmatter: `title`, `pubDate`, `updatedDate`.

`src/pages/articles/[...slug].astro` renders every entry from `articles` via `getStaticPaths`, with two frontmatter-driven special cases:

- `draft: true` → shows `Loading.astro` inside `MainLayout`, then client-side redirects to `/`.
- `url` set → the entry is a stub for a post published elsewhere (Zenn, etc.); client-side redirects to that `url` instead of rendering `<Content />`.

## Layout hierarchy

`Layout.astro` (root `<html>`, meta/OG/Twitter tags, Partytown-loaded GA `gtag`) → `MainLayout.astro` (adds `Header`/`Footer` around a `<slot />`) → `BlogLayout.astro` (adds article title/pub-updated dates, wraps content in `MarkDown.astro`, adds a "edit on GitHub" link built from the article id).

Non-article pages (`index.astro`, `about.astro`, `portfolio.astro`, `articles/index.astro`) compose `MainLayout` directly; `[...slug].astro` uses `BlogLayout` (or `MainLayout` + `Loading` for drafts).

## Build-time GitHub data (`src/lib/github.ts`)

Fetches, memoized per-process in module-level `Map` caches (keyed by username or `owner/repo:author`):

- `fetchContributionStats(username)` — GraphQL, per-year contribution calendar totals since account creation. Requires `GH_TOKEN`; returns `null` and logs a warning if absent.
- `fetchAccountStats(username)` — REST, repo count / followers / following / total stars / top languages by bytes (aggregated across owned, non-fork repos, capped to top 6 + "Other"). Works unauthenticated but hits stricter rate limits and can't see private repos.
- `fetchRepoStats(owner, repo, author)` — REST, description/language/url plus total and per-author commit counts (derived from the `Link: rel="last"` pagination header when possible).

Consumers: profile/portfolio pages, driven by `GITHUB_USERNAME` and `PORTFOLIO_PROJECTS` in `src/consts.ts`. Because these results are baked into the static build, see `github-actions.md` for how the site stays fresh without new commits.

## OG images

`src/pages/og/[...slug].ts` uses `astro-og-canvas`'s `OGImageRoute` to generate one PNG per non-draft article (`og/<id>.png`) plus a `_site` fallback (`og/_site.png`), using the article's `description` or an HTML excerpt (`src/lib/excerpt.ts`) as fallback copy. Branding (gradient, border color, fonts, sizes) lives inline in that file — see `design.md`.

## Search

`npm run build` runs `astro build && pagefind --site dist`, indexing the built HTML. `src/components/Search.astro` is the client-side UI against `@pagefind/default-ui`. Elements can opt out of indexing with `data-pagefind-ignore` (used on the heading-anchor icon).

## Consts

`src/consts.ts` centralizes `SITE_NAME`/`SITE_DESCRIPTION`, `REPOSITORY`, `GITHUB_USERNAME`, `PROFILE` (name/description/link lists rendered on the profile page), and `PORTFOLIO_PROJECTS` (the `{owner, repo}` pairs fetched via `lib/github.ts` for the portfolio page).
