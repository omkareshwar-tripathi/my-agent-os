# STATUS — my-agent-os                                   updated 2026-07-12

## What this is
My personal agent operating system, collapsed to three global Claude Code
hooks + one mandatory methodology skill + a STATUS.md convention. Repos join
just by having a root STATUS.md — no installer, registry, or dashboard.

## Now
Simplified (2026-07-12): the per-repo model (atlas adopt script, registry,
dashboard, per-repo hook copies) is gone. Hooks now live once in ~/.claude
and run everywhere, staying silent outside tracked projects.

## Next
- Mirror the three hooks + methodology skill into ~/.claude on each machine
- Keep docs in sync with the live setup

## Recently done
- 2026-07-12  collapse to 3 global hooks + mandatory methodology skill; delete atlas toolkit
- 2026-07-03  rollout: 8 repos adopted + pushed; ~/.claude mirrored to reference
- 2026-07-03  chore(standard): curate the agent-OS standard — global-first, clutter out

## How we work here
Claude reads this file at session start and keeps it updated at session end.
Project rules live in CLAUDE.md (if present). Bump the date above on every edit.
Recently done keeps only the 3 newest entries — drop older lines when adding;
git history of this file is the archive.
