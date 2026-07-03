# Atlas

A file-based agent OS for your repos — no server, no daemon, no database.
The standard lives here; each repo carries its own copy; a static dashboard
gives you the overview. Personal data (the repo registry, generated
dashboard, loose notes) lives in a separate PRIVATE folder (`~/atlas-data`),
never here.

Zero dependencies (Node 18+). Tests: `node --test atlas/test/*.test.js`.
The companion Claude skill lives in [`skill/`](skill/) — install once per
machine with `cp -R atlas/skill ~/.claude/skills/atlas` so any session
understands "show my projects", "refresh my dashboard", "adopt this repo",
and "jot X to <repo>".

## The pieces

1. **The standard** — `STATUS.md` (a ~25-line overview: What this is / Now /
   Next / Recently done / How we work here; Recently done holds only the 3
   newest entries — the file is committed, so git history is the archive)
   plus three Claude hooks: STATUS.md
   injected at session start, a freshness gate at session end, and a skill
   reminder each prompt. Hook sources live in
   `atlas/adopt/hooks/` — edit them here, re-run adopt to refresh a repo.
2. **adopt** — one command connects any repo:

       cd /path/to/your/repo
       node /path/to/my-agent-os/atlas/adopt.js

   Idempotent, and it validates before it writes: an unparseable
   `.claude/settings.json` or a registry id collision aborts with nothing
   touched. It creates STATUS.md (only if missing, pre-filled from git),
   installs the hooks, wires them into `.claude/settings.json` (existing
   settings preserved), registers the repo, and prints a survey of any
   pre-existing Claude assets (skills, commands, extra hooks) so you can fold
   them into the standard.
3. **dashboard** — one static HTML snapshot, regenerated on demand:

       node atlas/dashboard.js        # → ~/atlas-data/dashboard.html

   Per repo: status (Now / Next / pitch), git freshness, and the applied
   Claude setup (hooks, skills, commands, plugins, docs). A broken repo shows
   its error on its own card — it never blanks the page. Open the file, read,
   then act on the repo itself (or ask your agent to).
4. **Thoughts** — plain text in the repo. Jot `- [ ] date — thought` into a
   repo's `THOUGHTS.md`; the repo's next session triages it. No pipeline, no
   sync, nothing to corrupt.

## How the pieces travel

Each adopted repo carries its own STATUS.md, THOUGHTS.md, and hooks — they
sync wherever the repo's own git remote goes. The only machine-local file is
the registry (`~/atlas-data/registry.json`, a short JSON list of repo paths);
on a new device, re-adopt your repos or recreate it by hand.
