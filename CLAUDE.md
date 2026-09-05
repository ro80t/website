# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

WKTK.moe — a Japanese-language personal blog/portfolio site built with Astro, statically generated and deployed to GitHub Pages. Content and UI copy are in Japanese; keep new user-facing text in Japanese unless told otherwise.

## Commands

```console
npm ci              # install dependencies (Node 24, matches CI)
npm run dev          # start Astro dev server
npm run build         # astro build && pagefind --site dist (build + generate search index)
npm run preview        # preview the production build locally
npm run lint          # prettier --check . && eslint .
npm run format         # prettier --write .
```

There is no test suite/framework in this repo. `npm run lint` and `npm run build` are the checks CI runs (see `.github/workflows/ci.yml`) and should both pass before opening a PR.

`GH_TOKEN` (a GitHub PAT) is an optional env var used at build time by `src/lib/github.ts` to fetch live GitHub stats. Without it, those fetches are skipped or fall back to unauthenticated requests — the build still succeeds.

## Git workflow policy

Do not run `git commit`, `git push`, or open a pull request (`gh pr create`) on your own initiative in this repo — even after finishing a change that looks obviously done. Those actions are only allowed when the user explicitly invokes the `/commit-push` or `/open-pr` slash command:

- `/commit-push` — stages, commits, and pushes.
- `/open-pr` — opens a pull request for the current branch (English title/body).

Otherwise, leave changes staged/unstaged in the working tree and tell the user what's ready, so they can trigger one of the commands themselves.

## Environment files

Never create, edit, or delete `.env` / `.env.*` files without the user's explicit, specific permission for that edit — ask first even if a task seems to require it (e.g. adding a new env var). Never commit them.

## Architecture

The site is an Astro content-collections blog (`articles`, `specs`) with build-time GitHub-stats fetching, generated OG images, and Pagefind search. It deploys to GitHub Pages by pushing built output to a `gh-pages` branch from GitHub Actions — including a daily scheduled rebuild that exists specifically to keep the baked-in GitHub stats fresh without needing a new commit.

Deeper, topic-specific notes live under `.claude/docs/` and are loaded automatically as part of this file's context:

@.claude/docs/astro.md
@.claude/docs/markdown.md
@.claude/docs/design.md
@.claude/docs/github-actions.md
@.claude/docs/github-pages.md
