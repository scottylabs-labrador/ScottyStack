# Agent Instructions

## Style

Follow the [ScottyStack Style Guides](https://github.com/ScottyLabs/ScottyStack/wiki/Style-Guides)
for code style, formatting, and project conventions.

## Secrets

Secrets are managed via OpenBao. Pull local env files from the vault or push
local changes back using:

```bash
bun run secrets:pull
bun run secrets:push
```

Run `bun run secrets:setup` first if OpenBao is not configured. See
[scripts/secrets/README.md](scripts/secrets/README.md) for details.

## Commits

When the agent creates a commit, it must include itself as a co-author in the
commit message footer:

```text
Co-authored-by: Cursor <cursoragent@cursor.com>
```

Use a HEREDOC (or equivalent) so the trailer is appended after the commit body,
separated by a blank line.

Example:

```bash
git commit -m "$(cat <<'EOF'
feat: add example feature

Brief explanation of why this change was made.

Co-authored-by: Cursor <cursoragent@cursor.com>
EOF
)"
```
