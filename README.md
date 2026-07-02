# my-agent-os

My personal collection of agentic-AI setups — the configurations, workflows, and
hard-won conventions I use to get real work done with AI coding agents.

Each AI tool gets its **own top-level folder**. Every entry documents the setup in
plain language *and* ships the actual sanitized config files, so any setup here is
reproducible on a fresh machine (or by someone else) by copying the artifacts into
place.

## Tools

| Tool | Folder | What it covers |
|------|--------|----------------|
| **Claude Code** | [`claude-code/`](claude-code/) | Full setup: global + project config, hooks, plugins, MCP servers, skills, and the brick-by-brick build methodology with the `/ship` orchestrator. |
| **Atlas Hub** | [`atlas/`](atlas/) | A local multi-repo dashboard: every project's status, vision, and progress at one URL, plus a thought inbox that files ideas into the right repo. Personal data lives in a separate private repo. |

*(More tools — e.g. Codex, Gemini CLI, Cursor — will be added as sibling folders.)*

## Folder convention

```
my-agent-os/
├── README.md                  # this file — the index of tools
└── <tool>/
    ├── README.md              # overview + how to reproduce this tool's setup
    ├── docs/                  # plain-language documentation of each piece
    └── artifacts/             # sanitized, copy-pasteable config files & scripts
```

## A note on secrets

Everything in this repo is **sanitized**. No OAuth tokens, API keys, device IDs, or
account-specific credentials are committed. Config files use `~`/`$HOME` instead of
absolute machine paths, and any secret-bearing field is removed. Always review an
artifact before reusing it, and re-authenticate tools (OAuth, etc.) on your own
machine.
