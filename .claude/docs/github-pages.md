# GitHub Pages

The site is served from the `gh-pages` branch with a custom domain, **not** via GitHub's native Pages-from-Actions deployment (no `actions/configure-pages` / `actions/deploy-pages`). See `github-actions.md` for the exact steps.

## Custom domain

`public/CNAME` contains `wktk.moe`, and `astro.config.mjs`'s `site` is `https://wktk.moe` — keep these in sync if the domain ever changes, and remember absolute-URL generation (OG image URLs in `Layout.astro`, RSS in `src/pages/rss.xml.js`, the `@astrojs/sitemap` integration) all depend on `site` being correct.

## Base path / previews

`astro.config.mjs` sets `base: process.env.BASE_PATH || "/"`. Production builds (triggered by `ci.yml`) don't set `BASE_PATH`, so the site is served from the domain root. PR preview builds (`preview.yml`) set `BASE_PATH=/pr-preview-<PR#>/` so the same build can live at `https://wktk.moe/pr-preview-<PR#>/` alongside the production site on the same `gh-pages` branch. Code that builds internal URLs should go through `import.meta.env.BASE_URL` (as `Layout.astro`, `BlogLayout.astro`, and the OG image route already do) rather than hardcoding `/`.

## Branch layout

`gh-pages` root = production site (from `dist/`). `gh-pages/pr-preview-<PR#>/` = one subdirectory per open PR preview, added by `preview.yml` and removed when that PR closes. `ci.yml`'s deploy step explicitly preserves `pr-preview-*` directories when it clears and repopulates the root, so a production deploy never deletes active previews.

## `.nojekyll`

Both the production deploy and the preview deploy touch a `.nojekyll` file at the root of `gh-pages` so GitHub Pages doesn't run Jekyll processing over the Astro-built output (e.g. it wouldn't otherwise serve `_`-prefixed asset paths correctly).
