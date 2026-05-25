# 03 — MCP servers

MCP (Model Context Protocol) servers are external processes/services that expose
extra tools and resources to Claude Code. This setup connects several, most of them
launched by the plugins from [`02-plugins.md`](02-plugins.md).

## Connected servers

| Server | Transport | How it's launched | What it provides |
|---|---|---|---|
| **gitnexus** | stdio | `npx -y gitnexus@latest mcp` (via gitnexus-marketplace plugin) | Code knowledge graph: `impact` (blast radius), `query` (flow search), `context` (symbol callers/callees), `detect_changes`, `rename`, route/tool maps, Cypher queries. |
| **serena** | stdio | via `serena` plugin (Oraios) | Semantic, LSP-backed code analysis: symbol find/overview, references, safe rename, edit-by-symbol, project memories. |
| **context7** | stdio/http | via `context7` plugin (Upstash) | Live, version-specific library documentation: `resolve-library-id` + `query-docs`. Use instead of guessing API shapes from training data. |
| **claude-in-chrome** | MCP (browser) | Claude-in-Chrome extension | Browser automation: navigate, click/type, read page/console/network, screenshots, GIF recording, form input. |
| **vercel** | HTTP (OAuth) | `https://mcp.vercel.com` (vercel plugin — currently disabled) | Read-only: search Vercel docs, list projects/deployments, inspect logs. |
| **Gmail** | claude.ai connector | Managed by claude.ai account | Search/read threads, drafts, labels. |
| **Google Calendar** | claude.ai connector | Managed by claude.ai account | List/create/update events, suggest times. |
| **Google Drive** | claude.ai connector | Managed by claude.ai account | Search, read, create, copy files. |

## GitNexus — the centerpiece

GitNexus is more than an MCP server here; it's woven through the whole setup:

1. **MCP tools** — impact analysis, flow queries, symbol context, change detection.
2. **Global hooks** — a `PreToolUse` hook enriches searches with graph context; a
   `PostToolUse` hook watches for git mutations and warns when the index is stale
   (see [`05-hooks.md`](05-hooks.md)).
3. **Project rules** — the project `CLAUDE.md` *mandates* running `gitnexus_impact`
   before editing any symbol, `gitnexus_detect_changes` before committing, and using
   `gitnexus_rename` instead of find-and-replace.
4. **Skills** — seven `gitnexus-*` skills cover exploring, impact analysis,
   debugging, refactoring, PR review, CLI, and the tool/schema guide.

The index lives in a project-local `.gitnexus/` directory and is refreshed with
`npx gitnexus analyze`. The `/ship` workflow checks index freshness as a pre-flight
gate and re-analyzes after each brick.

## Reproducing

- **Plugin-launched servers** (gitnexus, serena, context7): install the plugin and
  the MCP server comes with it. GitNexus additionally needs an index — run
  `npx gitnexus analyze` in the repo.
- **claude-in-chrome**: install the Claude-in-Chrome browser extension and connect it.
- **vercel / Google connectors**: OAuth-based — authorize on your own account the
  first time. No credentials are stored in this repo.
