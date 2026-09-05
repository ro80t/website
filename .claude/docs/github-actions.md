# GitHub Actions

Two workflows under `.github/workflows/`, plus Dependabot config.

## `ci.yml`

- Triggers: `pull_request` → `main`, `push` → `main`, daily `schedule` (`0 3 * * *` UTC), and manual `workflow_dispatch`.
- `ci` job: checkout → Node 24 (npm cache) → `npm ci` → `npm run lint` → `npm run build` (with `GH_TOKEN` secret).
- `deploy` job (`needs: ci`): runs when `(github.event_name == 'push' || github.event_name == 'schedule') && github.ref == 'refs/heads/main'`. It builds again, then checks out (or creates, if missing) `gh-pages` as a **git worktree** at `./gh-pages`, clears everything in it except `.git` and any `pr-preview-*` directories, copies `dist/` in, adds `.nojekyll`, commits (`Deploy <sha>`, skipped if nothing changed), and pushes.
- The `schedule` trigger is deliberate: article/profile pages embed GitHub stats fetched at build time (`src/lib/github.ts`), which would otherwise go stale until the next manual commit. The daily run keeps them current. If changing the cadence, edit the `cron` expression here.
- Uses a `concurrency: { group: gh-pages, cancel-in-progress: false }` guard on `deploy` so it never races the preview workflow's own `gh-pages` writes (see below) — pushes queue instead of clobbering each other.

## `preview.yml`

Builds and tears down a per-PR preview of the site, published into a subdirectory of the same `gh-pages` branch (not a separate branch/environment).

- Triggered on `pull_request` (`opened`, `synchronize`, `reopened`, `closed`) against `main`; guarded to only run for PRs from branches in the same repo (`head.repo.full_name == github.repository`), so forks don't get preview deploys.
- `build` job: `npm run build` with `BASE_PATH=/pr-preview-<PR#>/` and `GH_TOKEN`, uploads `dist/` as an artifact.
- `preview` job (skipped when the PR is closed): checks out `gh-pages` directly (not a worktree, unlike `ci.yml`), downloads the artifact into `pr-preview-<PR#>/`, commits and pushes, then upserts a PR comment (matched by an HTML marker comment) linking to `https://wktk.moe/pr-preview-<PR#>/`.
- `cleanup` job (runs only when the PR is closed): removes the `pr-preview-<PR#>` directory from `gh-pages` and pushes.
- Same `concurrency: { group: gh-pages, cancel-in-progress: false }` pattern is used per-job here too, keyed to avoid clobbering `ci.yml`'s deploy.

## Dependabot

`.github/dependabot.yml` — weekly updates for both `github-actions` and `npm` ecosystems, directory `/`. Dependency-bump PRs go through the same `ci.yml` checks as any other PR.

## Practical notes

- Both workflows require `secrets.GH_TOKEN` to be set on the repo for full GitHub-stats functionality; missing it doesn't fail the build (see `astro.md`'s notes on `lib/github.ts` graceful degradation) but stats will be incomplete/unauthenticated.
- There's no `actions/deploy-pages` / `configure-pages` usage — deployment is entirely the manual `gh-pages` branch push described above. See `github-pages.md`.
