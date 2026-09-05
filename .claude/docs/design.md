# Design

## Component design philosophy: thinking in Atomic Design

`src/components/` is a flat directory — there are no `atoms/`/`molecules/`/`organisms/` folders, and this doc isn't asking you to create them. Atomic Design is used here as a **mental model for judging where a new piece of UI belongs and how small it should be**, not as an enforced file layout. When adding or refactoring a component, place it on this spectrum and let that judgment guide how much it should know about site-wide data/layout vs. how reusable/context-free it stays:

- **Atoms** — a single-responsibility, presentation-only primitive with no composition of other components and no knowledge of site data. e.g. `Loading.astro`.
- **Molecules** — a small, focused combination of markup/atoms that still doesn't know about site-wide data or layout. e.g. `Link.astro` (icon + title + url row), `ContentsBlock.astro` (the rounded white card shell reused across pages), `ProjectCard.astro`, `ArticleLink.astro` (composes `ContentsBlock`).
- **Organisms** — a larger, self-contained section that assembles molecules/atoms and is allowed to reach into site-wide data (`consts.ts`, content collections, `lib/github.ts`). e.g. `Header.astro`, `Footer.astro`, `Profile.astro`, `Search.astro`, `MarkDown.astro`.
- **Templates** — page skeletons (`Layout.astro`, `MainLayout.astro`, `BlogLayout.astro`) that arrange organisms into a shape, with no real content of their own — see the Layout hierarchy in `astro.md`.
- **Pages** — `src/pages/**/*.astro`, which fill a template with real data (`getCollection`, route props) for one route.

Practical implication: prefer pushing data-fetching and site-specific knowledge (imports from `consts.ts`, `astro:content`, `lib/github.ts`) up toward organisms/pages, and keep atoms/molecules taking plain props so they stay reusable — as the existing components above already do.

## Styling stack

Tailwind CSS v4 via the `@tailwindcss/vite` plugin (registered in `astro.config.mjs`'s `vite.plugins`) plus `@tailwindcss/typography`. Both are pulled in with a single `@import`/`@plugin` pair in `src/styles/global.css`, which is otherwise minimal (just a page `background-color: #e5e7eb`). There's no separate Tailwind config file or design-token file — utility classes and per-component `<style>` blocks (scoped by default in `.astro` files) are the two styling mechanisms in use; reach for Tailwind utilities first, and drop into a scoped `<style>` block for layout/positioning that's awkward as utility classes (as `Header.astro`, `MainLayout.astro`, `BlogLayout.astro` already do).

## Prose content

Article/spec Markdown is rendered inside `MarkDown.astro`, which wraps the slot in Tailwind Typography's `prose dark:prose-invert prose-base !max-w-none custom-md`. Any custom Markdown-content styling should go on `.custom-md` (or descendants) rather than fighting `prose` overrides directly.

## Fonts

Loaded per-component via `@fontsource*` imports, not globally:

- `Dela Gothic One` and `Kiwi Maru` (`Header.astro`) for the site title/nav — headings use `Dela Gothic One`, nav-adjacent text uses `Kiwi Maru`.
- `M PLUS 1 Variable` (`@fontsource-variable/m-plus-1`) for body/link text on the top page (`index.astro`) and article link cards (`ArticleLink.astro`).
- `Mochiy Pop One` (`@fontsource/mochiy-pop-one`) for the profile card (`Profile.astro`) and top page.

OG images (`src/pages/og/[...slug].ts`) load their own fonts remotely at build time (`Noto Sans JP`, weights 400/700, full-Japanese-coverage `.ttf` from `api.fontsource.org`) since `astro-og-canvas` renders server-side and can't use the browser-oriented `@fontsource` unicode-range split files.

## Brand colors

- Theme color / accent: `#00fa9a` (spring green) — set as `<meta name="theme-color">` default in `Layout.astro` and reused as the OG image card's border color (`[0, 250, 154]`).
- OG image background: a dark-slate-to-emerald gradient (`[15,23,42] → [6,78,59]`) with white title text and light slate-blue description text — see `src/pages/og/[...slug].ts` for exact values if replicating elsewhere.
- Body background outside the OG card: light gray (`#e5e7eb`, `global.css`).
- Link-card embeds (`src/styles/link-card.css`, from `remark-link-card`) use a plain black-border/black-text card, independent of the theme-color/OG palette above.

## Icons

`astro-icon` is configured in `astro.config.mjs` with the `fa6-brands`, `fa6-regular`, `fa6-solid` icon sets fully included, for use via the `<Icon />` component. Static brand icons for profile links (`public/icon/*.webp`) are referenced directly by URL in `src/consts.ts` (`PROFILE.orgs`/`coding`/`links`) instead of going through `astro-icon`.
