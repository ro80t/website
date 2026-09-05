---
description: Open a GitHub pull request for the current branch.
---

Run the repo's standard pull request workflow (this is the only context in which `gh pr create` is allowed — see `CLAUDE.md`'s Git workflow policy):

1. Confirm the current branch is pushed and up to date with `origin`. If it isn't, run the `/commit-push` workflow first (or push manually) before opening the PR.
2. Look at the full set of commits going into the PR, not just the latest one: `git log main..HEAD` and `git diff main...HEAD`.
3. Write the PR title and body in **English**, regardless of the conversation language — this repo's existing PRs are all in English.
   - Title: under ~70 characters.
   - Body: a `## Summary` section (1-3 bullets on what changed and why) and a `## Test plan` checklist (what to verify, e.g. CI passing, manual checks).
4. Create it with `gh pr create --title "..." --body "..."`.
5. Report the PR URL back to the user.

Do not open a second PR for a branch that already has one open — check with `gh pr view` first if unsure.
