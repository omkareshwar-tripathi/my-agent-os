# my-agent-os

My personal agent operating system, boiled down to three things:

1. **Three global hooks** that run in every Claude Code session on the machine.
2. **One mandatory methodology skill** every coding session must consult.
3. **A STATUS.md convention** — any repo joins the system just by having a
   `STATUS.md` at its root.

No installer, no per-repo copies, no registry, no dashboard. The hooks live
once in `~/.claude` and fire everywhere; they stay silent in any directory
that isn't a tracked project.

## The three hooks

Source of truth: [`hooks/`](hooks/).

| Hook | Fires on | What it does |
|------|----------|--------------|
| `session-start-status.sh` | SessionStart | Injects the repo's `STATUS.md` so the session starts oriented. Silent if there's no root `STATUS.md`. |
| `skill-reminder.sh` | UserPromptSubmit | Reminds the agent to consult the methodology skill and lists available skills (capped at 30, descriptions trimmed). |
| `check-status-updated.sh` | Stop | Blocks the stop once if the repo changed this turn but `STATUS.md`'s date is stale. Silent outside git repos / repos without `STATUS.md`. |

## The mandatory skill

[`skills/coding-agent-methodology/`](skills/coding-agent-methodology/) is the
engineering operating contract — think first, keep changes surgical, prove it
works, don't surprise the person or the repo. The `skill-reminder` hook
prepends a line ordering the agent to consult it before any coding action.

## Install on a machine (once)

```sh
cp hooks/*.sh ~/.claude/hooks/
cp -R skills/coding-agent-methodology ~/.claude/skills/coding-agent-methodology
```

Then add the wiring to `~/.claude/settings.json` (merge into any `hooks`
block already there):

```json
{
  "hooks": {
    "SessionStart": [
      { "hooks": [ { "type": "command", "command": "bash \"$HOME/.claude/hooks/session-start-status.sh\"" } ] }
    ],
    "UserPromptSubmit": [
      { "hooks": [ { "type": "command", "command": "bash \"$HOME/.claude/hooks/skill-reminder.sh\"" } ] }
    ],
    "Stop": [
      { "hooks": [ { "type": "command", "command": "bash \"$HOME/.claude/hooks/check-status-updated.sh\"" } ] }
    ]
  }
}
```

## Join a repo to the system

Create a `STATUS.md` at the repo root:

```
# STATUS — <repo>                                   updated YYYY-MM-DD
## What this is
## Now
## Next
## Recently done
## How we work here
```

That's it. The global hooks pick it up automatically — no per-repo setup.

## What's in here

| Folder | What it is |
|--------|------------|
| [`hooks/`](hooks/) | The three global hooks. |
| [`skills/coding-agent-methodology/`](skills/coding-agent-methodology/) | The mandatory methodology skill. |
| [`claude-code/`](claude-code/) | The per-machine Claude Code setup: global settings, status line, plugins, MCP servers, and the build-methodology docs. See [`claude-code/README.md`](claude-code/README.md). |

## A note on secrets and personal data

Everything here is sanitized — no tokens, keys, or machine-specific paths.
