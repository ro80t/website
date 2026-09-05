# Design

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
