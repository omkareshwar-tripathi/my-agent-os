---
name: atlas
description: Personal agent-OS control. Use when the user asks for a project overview ("show my projects", "what's going on across my repos"), wants the Atlas dashboard refreshed/opened, wants a repo set up with the standard Claude setup ("adopt this repo", "set up my agent os here"), or wants to jot a thought to a project ("jot X to thread").
---

# Atlas — the agent-OS in the repos

Everything lives in files, no server. The standard (hooks, templates, adopt
script, dashboard generator) is in the public repo
`~/Desktop/my-agent-os/atlas/`. The private repo list is
`~/atlas-data/registry.json` (never commit it anywhere public).

## Actions

**Overview — "show my projects"**
Read `~/atlas-data/registry.json`, then each repo's `STATUS.md` (root).
Summarize per repo: Now / top Next / how stale (last commit date via
`git -C <repo> log -1 --format=%cs`). Plain language, products first.
Repos without STATUS.md: say so and offer adopt.

**Dashboard — "refresh/open my dashboard"**
```bash
node ~/Desktop/my-agent-os/atlas/dashboard.js && open ~/atlas-data/dashboard.html
```
Static HTML snapshot: per repo status, hooks, skills, plugins, docs. It is a
readable view of the same info; to CHANGE anything, act on the repo directly.

**Adopt — "set up this repo" / "adopt <repo>"**
```bash
cd <repo> && node ~/Desktop/my-agent-os/atlas/adopt.js
```
Installs STATUS.md (template), the 4 standard hooks, settings wiring, and
registers the repo. It aborts (touching nothing) on invalid settings.json or
a registry id collision — relay its message, help fix, re-run. After adopting,
help the user fill STATUS.md's two placeholder sections from the repo's real
docs/history. It also prints a survey of pre-existing Claude assets — offer to
fold anything useful into the standard.

**Jot — "jot <thought> to <repo>"**
Append one line to the target repo's `THOUGHTS.md` (create with a `# Thoughts
inbox` heading if missing):
```
- [ ] YYYY-MM-DD — <thought>
```
No target repo? Append to `~/atlas-data/notes.md` instead. Never commit or
push a jot yourself — the repo's next session triages it.

## Rules

- The registry and anything derived from it (dashboard.html, notes.md) is
  personal — it lives only in `~/atlas-data/`, never in a public repo.
- Standard hooks change in ONE place (`my-agent-os/atlas/adopt/hooks/`);
  re-running adopt in a repo refreshes its copies.
- Tests for the toolkit: `node --test ~/Desktop/my-agent-os/atlas/test/*.test.js`.
