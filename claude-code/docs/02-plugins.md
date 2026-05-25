# 02 — Plugins & marketplaces

Plugins extend Claude Code with extra skills, slash commands, agents, hooks, and MCP
servers. They're installed from **marketplaces** (a source repo/registry) and enabled
per-scope: **user** (everywhere) or **project** (one repo).

## Marketplaces

| Marketplace | Source | Notes |
|---|---|---|
| **claude-plugins-official** | GitHub `anthropics/claude-plugins-official` | The main official registry. Most plugins below come from here. |
| **gitnexus-marketplace** | GitHub `abhigyanpatwari/GitNexus` | Source for the GitNexus code-intelligence plugin. |
| **vercel-vercel-plugin** | Local directory (`~/.cache/plugins/github.com-vercel-vercel-plugin`) | Vercel's plugin; currently **disabled**. |

## Enabled at user scope (everywhere)

| Plugin | Version | What it gives you |
|---|---|---|
| **superpowers** | 5.1.0 | The big one — a library of process skills (brainstorming, TDD, systematic-debugging, writing/executing plans, code-review, parallel agents, verification). See [`04-skills.md`](04-skills.md). |
| ~~vercel-plugin~~ | 0.24.0 | Installed but **disabled**. |

## Enabled at project scope (`remembryMemoriesApp`)

From the project's `.claude/settings.json` ([artifact](../artifacts/project/settings.json)) — 14 plugins:

| Plugin | Role |
|---|---|
| **gitnexus** (1.3.6) | Code knowledge graph: execution-flow tracing, blast-radius/impact analysis, augmented search. Wired into hooks + MCP. |
| **serena** | Semantic code analysis MCP (LSP-backed symbol understanding, refactoring, navigation). |
| **context7** | Up-to-date library documentation lookup MCP (pull version-specific docs/examples on demand). |
| **swift-lsp** | Swift language-server integration for the iOS project. |
| **code-review** | Multi-agent PR review with confidence scoring (the `/review` family). |
| **code-simplifier** | The `/simplify` skill — reviews changed code for reuse/quality/efficiency. |
| **claude-md-management** | Audit/improve `CLAUDE.md` files; capture session learnings. |
| **remember** (0.7.2) | Continuous memory — extracts/compresses conversations into the `.remember/` tiered logs. See [`07-memory-system.md`](07-memory-system.md). |
| **ralph-loop** | Continuous self-referential "Ralph" loops for autonomous iterative development. |
| **frontend-design** | Distinctive production-grade frontend/UI generation. |
| **github** | GitHub operations (issues, PRs, checks). *(Disabled in `settings.local.json` override.)* |
| **security-guidance** | Security review guidance and the `/security-review` command. |
| **explanatory-output-style** | Adds the "explanatory" output style (educational insights inline). |
| **learning-output-style** | Adds the "learning" output style (request small code contributions + insights). |

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
