# 02 — Plugins & marketplaces

Plugins extend Claude Code with extra skills, slash commands, agents, hooks, and MCP
servers. They're installed from **marketplaces** (a source repo/registry) and enabled
per-scope: **user** (everywhere) or **project** (one repo).

## Marketplaces

| Marketplace | Source | Notes |
|---|---|---|
| **claude-plugins-official** | GitHub `anthropics/claude-plugins-official` | The main official registry. Most plugins below come from here. |
| **gitnexus-marketplace** | GitHub `abhigyanpatwari/GitNexus` | Source for the GitNexus code-intelligence plugin. |
| **ponytail** | GitHub `DietrichGebert/ponytail` | Source for the ponytail simplicity-enforcer plugin. |

## Enabled at user scope (everywhere)

| Plugin | What it gives you |
|---|---|
| **superpowers** | The big one — a library of process skills (brainstorming, TDD, systematic-debugging, writing/executing plans, code-review, parallel agents, verification). See [`04-skills.md`](04-skills.md). |
| **ponytail** | The simplicity enforcer — lazy-senior-dev mode, YAGNI ladder, shortest-diff discipline, plus /ponytail-review and /ponytail-audit. |

## Enabled at project scope — the standard template

From [`../artifacts/project/settings.json`](../artifacts/project/settings.json) — 12 plugins every project starts with:

| Plugin | Role |
|---|---|
| **gitnexus** | Code knowledge graph: execution-flow tracing, blast-radius/impact analysis, augmented search. Wired into MCP. |
| **serena** | Semantic code analysis MCP (LSP-backed symbol understanding, refactoring, navigation). |
| **context7** | Up-to-date library documentation lookup MCP (pull version-specific docs/examples on demand). |
| **code-review** | Multi-agent PR review with confidence scoring (the `/review` family). |
| **code-simplifier** | The `/simplify` skill — reviews changed code for reuse/quality/efficiency. |
| **claude-md-management** | Audit/improve `CLAUDE.md` files; capture session learnings. |
| **remember** | Continuous memory — extracts/compresses conversations into the `.remember/` tiered logs. See [`07-memory-system.md`](07-memory-system.md). |
| **ralph-loop** | Continuous self-referential "Ralph" loops for autonomous iterative development. |
| **github** | GitHub operations (issues, PRs, checks). |
| **security-guidance** | Security review guidance and the `/security-review` command. |
| **explanatory-output-style** | Adds the "explanatory" output style (educational insights inline). |
| **learning-output-style** | Adds the "learning" output style (request small code contributions + insights). |

Stack-specific plugins are added per-repo on top of the template: **swift-lsp**
in the iOS repo (remembry), **frontend-design** in the web repos.

> **Output styles:** both `explanatory` and `learning` are active in this project,
> which is why sessions surface `★ Insight` callouts and occasionally invite small
> code contributions.

## How scope works (mental model)

- **User-scope** plugins (superpowers) load in every project automatically.
- **Project-scope** plugins only activate when working inside that repo, keeping
  unrelated projects lean.
- A `settings.local.json` in a project can flip individual plugins off (here,
  `github` is disabled locally even though it's enabled in the shared
  `settings.json`).

## Reproducing

1. Add the marketplaces (`/plugin marketplace add <source>` or via settings'
   `extraKnownMarketplaces`).
2. Enable the plugins you want with the `enabledPlugins` map in the appropriate
   `settings.json` (global vs project). The artifact files list the exact keys.
3. Some plugins (gitnexus, serena, context7) also register MCP servers — see
   [`03-mcp-servers.md`](03-mcp-servers.md).
