# my-agent-os

My agent operating system: everything needed to set up my AI-agent working
environment lives in this one repo. Point an agent here and ask it to set
things up — the instructions below are written for it.

## For agents: "set this up"

If a human points you at this repo and asks you to apply the setup:

**In a project** (the common case):

    cd <the project repo>
    node <this-repo>/atlas/adopt.js

That installs the per-project standard: a `STATUS.md` overview file, three
hooks (status injected at session start, freshness gate at session end,
skill reminder each prompt), and their wiring in
`.claude/settings.json` — validating before it writes, preserving anything
already there. Then help the human fill STATUS.md's two placeholder sections
from the project's real docs and history. Details: [`atlas/README.md`](atlas/README.md).

**On a new machine** (once):

1. Install the atlas skill: `cp -R <this-repo>/atlas/skill ~/.claude/skills/atlas`
2. Apply the global Claude Code config from
   [`claude-code/artifacts/global/`](claude-code/artifacts/global/) —
   settings, status line, global CLAUDE.md (review before copying; see
   [`claude-code/README.md`](claude-code/README.md)).

## What's in here

| Folder | What it is |
|--------|------------|
| [`atlas/`](atlas/) | The per-**project** standard: `STATUS.md` + 3 hooks, the one-command `adopt.js` installer, and a static dashboard generator (`node atlas/dashboard.js`) showing every repo's status and applied Claude setup. File-based — no server. |
| [`claude-code/`](claude-code/) | The per-**machine** Claude Code setup: global settings, status line, plugins, MCP servers, skills, and the brick-by-brick build methodology docs. |

The three standard hooks have ONE source of truth: `atlas/adopt/hooks/`.
Re-running adopt in a repo refreshes its copies.

## A note on secrets and personal data

Everything here is **sanitized** — no tokens, keys, or machine-specific
paths. Personal data (the repo registry, generated dashboard, notes) lives
only in a local `~/atlas-data/` folder, never in this repo.
