# STATUS — my-agent-os                                   updated 2026-07-24

## What this is
My personal agent operating system, collapsed to three global Claude Code
hooks + one mandatory methodology skill + a STATUS.md convention. Repos join
just by having a root STATUS.md — no installer, registry, or dashboard.

## Now
The repo is now a Claude Code plugin — zero-install (2026-07-12). Two commands
(`marketplace add` + `plugin install`) wire the 3 hooks and the methodology
skill into every project; updates pull automatically on new commits. The old
copy-into-~/.claude flow and the claude-code/ docs are gone.

## Next
- Install the plugin on each machine (two commands)
- Retire any leftover manual ~/.claude hook copies

## Recently done
- 2026-07-24  methodology skill: add Ponytail no-new-code ladder (minus its skip-the-work rung) + Advisor-tool guidance
- 2026-07-12  convert repo to a zero-install Claude Code plugin; delete claude-code/ docs
- 2026-07-12  collapse to 3 global hooks + mandatory methodology skill; delete atlas toolkit

## How we work here
Claude reads this file at session start and keeps it updated at session end.
Project rules live in CLAUDE.md (if present). Bump the date above on every edit.
Recently done keeps only the 3 newest entries — drop older lines when adding;
git history of this file is the archive.
