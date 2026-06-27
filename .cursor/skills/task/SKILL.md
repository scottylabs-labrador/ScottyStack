---
name: task
description: >-
  End-to-end GitHub issue workflow: grill requirements, update the issue,
  implement in a git worktree, open a PR, and resolve AI review comments and CI
  failures until merge-ready. Use when the user invokes /task with a GitHub issue
  URL or number.
disable-model-invocation: true
---

# Task

Argument: a GitHub issue — URL (`https://github.com/org/repo/issues/123`) or
number (`123`).

Run all four phases in order. Do not skip ahead until the current phase is done.

## Phase 1 — Grill requirements

Read the [grill-with-docs](../grill-with-docs/SKILL.md) skill and follow it.
The issue is the plan to stress-test.

1. Fetch the issue:

   ```bash
   gh issue view <number-or-url> --json title,body,labels,comments,state,url
   ```

2. Explore the codebase first. Answer what you can without asking the user.

3. Run a `/grilling` session (one question at a time). Use
   [domain-modeling](../domain-modeling/SKILL.md) to capture terms in
   `CONTEXT.md` and ADRs in `docs/adr/` as decisions crystallise.

4. Stop grilling when **all** of these are true:

   - **Context** — why this work exists and who it affects
   - **Description** — what to build or change, scoped tightly
   - **Acceptance criteria** — testable, unambiguous checklist
   - **No open design blockers** — every branch of the decision tree is resolved
   - **Domain language** — overloaded terms are pinned in `CONTEXT.md` when relevant

   If the issue already satisfies these, confirm with the user once, then proceed.

## Phase 2 — Update the issue

Write the grilled result back to GitHub. Use `##` section headings:

```md
## Context

## Description

## Acceptance Criteria

## Additional Notes
```

- Replace the issue body (not just a comment) when the original was sparse or wrong.
- Add a comment summarising what changed when you rewrite the body.
- Include links to any ADRs or `CONTEXT.md` updates from Phase 1.

```bash
gh issue edit <number> --body-file /tmp/issue-body.md
gh issue comment <number> --body "Updated issue body after requirements grilling. …"
```

## Phase 3 — Implement in a worktree and open a PR

Work in an isolated worktree so the main checkout stays clean.

### Setup

```bash
ISSUE=<number>
SLUG=<short-kebab-slug-from-title>
BRANCH="issue-${ISSUE}-${SLUG}"
WORKTREE="../$(basename "$PWD")-${ISSUE}"

git fetch origin main
git worktree add -b "$BRANCH" "$WORKTREE" origin/main
```

Move into the worktree (`cd "$WORKTREE"`) for all implementation work.

### Implement

1. Re-read the updated issue and acceptance criteria.
2. Implement the smallest change that satisfies every criterion.
3. Run relevant checks (`bun run lint`, `bun run format`, tests) before committing.
4. Commit with conventional messages. Reference the issue in the body.

### Open PR

```bash
git push -u origin HEAD

gh pr create --title "<type>: <concise title> (#${ISSUE})" --body "$(cat <<'EOF'
## Summary
- …

## Acceptance criteria
- [ ] …

Closes #ISSUE

## Test plan
- [ ] …
EOF
)"
```

Record the PR URL — Phase 4 needs it.

### Cleanup (after merge or when abandoning)

```bash
git worktree remove "$WORKTREE"
git branch -d "$BRANCH"   # or -D if needed
```

## Phase 4 — Resolve AI review comments and CI

Loop until the PR is merge-ready. Borrow triage rules from the babysit skill:
validate each comment; only fix valid issues; explain when you disagree. Fix CI
failures caused by this PR's changes and re-run until every check passes.

### What counts as "AI review"

- **CodeRabbit** — review comments and summary on the PR
- **Bugbot / Cursor Bugbot** — bot comments flagged as bugs
- Any other bot reviewer on the PR

Ignore human review threads unless the user asks to address them.

### Loop

```text
Task Progress:
- [ ] Fetch unresolved review threads
- [ ] Triage each comment (valid / invalid / needs clarification)
- [ ] Fix valid issues in the worktree
- [ ] Push fixes
- [ ] Re-check until no unresolved AI comments remain
- [ ] Fetch CI status for the PR
- [ ] Fix failing checks caused by this PR
- [ ] Push CI fixes and re-watch until all checks pass
```

1. Fetch unresolved threads:

   ```bash
   gh pr view <url> --json reviews,comments,statusCheckRollup
   gh api repos/{owner}/{repo}/pulls/{number}/comments
   ```

   Filter to **unresolved** bot threads. Read only comment bodies and the
   minimum file/line context needed to act.

2. For each valid comment, fix in the worktree, commit, and push.

3. Reply on threads you won't fix, with a brief reason.

4. Wait for new reviews after pushing (CodeRabbit re-reviews on new commits).
   Poll with `gh pr view` or ask the user to ping when review completes if
   the bot is slow.

5. **CI checks** — after each push, confirm every required check passes:

   ```bash
   gh pr checks <url> --watch
   gh pr view <url> --json statusCheckRollup,mergeable,mergeStateStatus
   ```

   Fix failures caused by this PR's changes. Run the same checks locally
   before pushing when possible (`bun run build:api`, `bunx turbo run quality`,
   etc.).

   CI rules:

   - Never change workflows or checks just to make failures pass.
   - Never make unrelated code changes to fix CI.
   - If a failure seems unrelated, merge latest `main` into the branch first —
     another PR may have fixed it.
   - If a fix would require out-of-scope changes, stop and report back.

6. Exit the loop when **all** of these are true:

   - All AI review threads are resolved or replied to
   - Every CI check on the PR is green
   - Acceptance criteria from Phase 2 are met

Report the PR URL, CI status, and a short summary of what was done.

## Examples

```text
/task 42
/task https://github.com/ScottyLabs/ScottyStack/issues/42
```
