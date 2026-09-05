---
description: Stage relevant changes, commit them, and push to the remote.
---

Run the repo's standard commit workflow (this is the only context in which `git commit`/`git push` are allowed — see `CLAUDE.md`'s Git workflow policy):

1. In parallel, run `git status`, `git diff` (staged and unstaged), and `git log --oneline -10` to see what changed and match this repo's existing commit message style.
2. If there is nothing to commit, say so and stop — never create an empty commit.
3. Stage only the files relevant to the current change, by name (never `git add -A` or `git add .`). If anything that looks like a secret (`.env`, credentials, tokens) shows up as changed, stop and warn the user instead of staging it — see the Environment files policy in `CLAUDE.md`.
4. Write a concise commit message focused on *why*, in the same style as recent commits (`git log`), ending with:

   ```
   Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
   ```

5. Push the current branch to `origin` (add `-u` if it has no upstream yet).
6. Run `git status` again to confirm a clean tree, and report what was pushed.

Never use `--force`, `--no-verify`, or amend an existing commit unless the user explicitly asks for it in this invocation.
