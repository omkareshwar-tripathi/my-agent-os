# Atlas Hub

One dashboard for every repo on this machine: status, vision, progress, and a
thought inbox — served locally, derived live from each repo's git + markdown.
Personal data (registry, thoughts, cache) lives in a separate PRIVATE repo
(`~/atlas-data`), never here.

## Run it

    node atlas/server.js     # → http://127.0.0.1:7843

Zero dependencies (Node 18+). Tests: `node --test atlas/test/*.test.js`.

## Adopt a repo (connect any project in one command)

    cd /path/to/your/repo
    node /path/to/my-agent-os/atlas/adopt.js

Idempotent — safe to re-run. It sets up four things:

1. **`STATUS.md`** at the repo root (only if missing) — a ~25-line overview
   (What this is / Now / Next / Recently done / How we work here), pre-filled
   from git. This is the one file a human or agent reads to get oriented.
2. **Four standard hooks** in `.claude/hooks/`: STATUS.md injected at session
   start, a freshness gate at session end, a skill reminder each prompt, and
   an advisory simplify nudge.
3. **Hook wiring** merged into `.claude/settings.json` (existing settings
   preserved).
4. **Registration** in the private atlas-data registry, so the repo appears
   on the dashboard.

After adopting, open STATUS.md and fill in the two placeholder sections.

## How it works

- **Registry** (`~/atlas-data/registry.json`, private repo): the list of repos,
  tiered `product` (rich view) / `satellite` (git-basics).
- **Sync on page load:** every dashboard load re-derives each present repo's
  layers — git state, `BRICKS.md` kanban (Done/Doing/Next/Blocked), and
  `vision/README.md` (north star, pitch, capabilities) — into
  `~/atlas-data/cache/`, then auto-commits/pushes the data repo.
- **Thought inbox:** the quick-add box files a thought into `thoughts.json`
  and appends it to the target repo's `THOUGHTS.md` (`- [ ] date — text`).
  Thoughts for repos not on this device stay pending and deliver on the next
  sync where the repo exists. In-repo triage turns them into vision or
  BRICKS items.
- **New device:** clone this repo + your private `atlas-data` next to `~`,
  install the LaunchAgent below, done — the dashboard renders from cached
  status even before you clone the project repos.

## Auto-start at login (macOS)

    sed -e "s|__NODE__|$(command -v node)|" -e "s|__REPO__|$PWD|" \
      atlas/launchd/com.atlas.hub.plist > ~/Library/LaunchAgents/com.atlas.hub.plist
    launchctl load ~/Library/LaunchAgents/com.atlas.hub.plist
