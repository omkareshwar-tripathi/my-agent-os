# STATUS — my-agent-os                                   updated 2026-07-03

## What this is
The agent operating system: a per-project standard (STATUS.md + 3 session
hooks + adopt script + static Atlas dashboard) and the per-machine Claude
Code setup (skills, hooks, plugins), kept sanitized as the reference copy.

## Now
Rollout complete (2026-07-03): standard curated, all 8 registry repos adopted
+ pushed (Remembry deliberately excluded), and ~/.claude mirrored to this
reference. Steady state — the OS is running.

## Next
- Keep docs in sync with the live setup
- Optional follow-ups (personal-site .gitignore/.claude conflict, AstrologyCounsel
  stale remote, SpeakType build artifacts, Remembry onboarding) — only on ask

## Recently done
- 2026-07-03  rollout: 8 repos adopted + pushed; ~/.claude mirrored to reference
- 2026-07-03  chore(standard): curate the agent-OS standard — global-first, clutter out
- 2026-07-03  chore: self-adopt the agent-OS standard

## How we work here
Claude reads this file at session start and keeps it updated at session end.
Project rules live in CLAUDE.md (if present). Bump the date above on every edit.
Recently done keeps only the 3 newest entries — drop older lines when adding;
git history of this file is the archive.
