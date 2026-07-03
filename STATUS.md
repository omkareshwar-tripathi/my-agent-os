# STATUS — my-agent-os                                   updated 2026-07-03

## What this is
The agent operating system: a per-project standard (STATUS.md + 3 session
hooks + adopt script + static Atlas dashboard) and the per-machine Claude
Code setup (skills, hooks, plugins), kept sanitized as the reference copy.

## Now
Standard just curated (2026-07-03): 6 global skills, 3 hooks, and a
12-plugin project template. This repo now self-adopts its own standard.

## Next
- Mirror the reference setup to ~/.claude (deferred)
- Keep docs in sync with the live setup

## Recently done
- 2026-07-03  chore(standard): curate the agent-OS standard — global-first, clutter out
- 2026-07-03  docs: repo is now the single agent-OS entry point
- 2026-07-02  refactor(atlas): pivot to file-based agent OS — no server, static dashboard

## How we work here
Claude reads this file at session start and keeps it updated at session end.
Project rules live in CLAUDE.md (if present). Bump the date above on every edit.
Recently done keeps only the 3 newest entries — drop older lines when adding;
git history of this file is the archive.
