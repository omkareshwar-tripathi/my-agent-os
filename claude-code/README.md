# Claude Code — my setup

This is a complete capture of how I run Claude Code: the global preferences that
apply everywhere, the per-project configuration that enforces my build discipline,
the plugins and MCP servers I rely on, the skills I've installed, and the
brick-by-brick methodology that ties it all together.

**Two things live here:**

- **`docs/`** — plain-language explanations of every piece (read these to *understand*).
- **`artifacts/`** — the actual sanitized config files and scripts (copy these to *reproduce*).

## What this setup is, in one paragraph

Claude Code runs in **auto-approve mode** with **maximum thinking effort**, a custom
**status line** showing git branch + model + context usage, and **voice + sound
cues**. A handful of **plugins** (superpowers, gitnexus, serena, context7,
code-review, remember, …) and **MCP servers** extend it. The flagship project
(`remembryMemoriesApp`, a native iOS app) is governed by a **strict brick-by-brick
waterfall**: tiny, test-first increments, each one planned → built → tested →
documented → simplified → reviewed before the next begins. A custom **`/ship`
command** automates that whole 6-phase loop across multiple bricks, and a set of
**hooks** mechanically enforce the discipline (inject build status at session
start, block turn-end if docs fall behind code, remind about skills on every
prompt).

## Documentation index

| Doc | Covers |
|-----|--------|
| [`docs/01-global-config.md`](docs/01-global-config.md) | `~/.claude/settings.json`: permission mode, thinking/effort, theme, voice, sounds, status line. |
| [`docs/02-plugins.md`](docs/02-plugins.md) | Marketplaces and every installed plugin, with scope (user vs project). |
| [`docs/03-mcp-servers.md`](docs/03-mcp-servers.md) | GitNexus, Serena, Context7, Claude-in-Chrome, Vercel, and the Google connectors. |
| [`docs/04-skills.md`](docs/04-skills.md) | Superpowers skills, graphify, the ~30 user skills, and the project's Swift/iOS skills. |
| [`docs/05-hooks.md`](docs/05-hooks.md) | Every global + project hook: event, trigger, and exactly what it does. |
| [`docs/06-brick-methodology.md`](docs/06-brick-methodology.md) | The brick-by-brick waterfall, sizing rules, and the `/ship` 6-phase orchestrator. |
| [`docs/07-memory-system.md`](docs/07-memory-system.md) | The `.remember/` tiers, auto-memory, and the `STATUS.md` build dashboard. |

## How to reproduce on a fresh machine

The artifacts map onto two locations:

| Artifact | Goes to |
|----------|---------|
| `artifacts/global/settings.json` | `~/.claude/settings.json` |
| `artifacts/global/statusline.sh` | `~/.claude/statusline.sh` |
| `artifacts/global/CLAUDE.md` | `~/.claude/CLAUDE.md` |
| `artifacts/project/CLAUDE.md` | `<project>/CLAUDE.md` |
| `artifacts/project/settings.json` | `<project>/.claude/settings.json` |
| `artifacts/project/hooks/*.sh` | `<project>/.claude/hooks/` |
| `artifacts/project/commands/ship.md` | `<project>/.claude/commands/ship.md` |

After copying:

1. **Make hooks + statusline executable:** `chmod +x` the `.sh` files.
2. **Install plugins** — see [`docs/02-plugins.md`](docs/02-plugins.md) for marketplaces and enable list.
3. **Install MCP servers** — see [`docs/03-mcp-servers.md`](docs/03-mcp-servers.md). Most are launched via the plugins; GitNexus also needs `npx gitnexus analyze` to build the index.
4. **Re-authenticate** anything OAuth-based (Vercel, Google connectors) on your own account.
5. **Adapt the project artifacts** — `CLAUDE.md` and the doc-update hook are written for an iOS/Swift project; the path-to-doc mappings in `check-docs-updated.sh` should be retargeted for other stacks.

## Caveats

- The project artifacts are **iOS/SwiftUI/Core Data specific** (Swift file globs, `xcodebuild`, brick conventions). Treat them as a *pattern* to adapt, not a drop-in for arbitrary projects.
- The `/ship` command references a machine-local plan file path; that file is the long-form orchestration spec and isn't included here (it's project-journal, not reusable config).
- Sounds use macOS `afplay` and system `.aiff` files — Linux/Windows need a different player.
