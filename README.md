# My Agent OS

A personal knowledge base for AI coding agents. Everything I've learned about working with Claude Code, Codex, Gemini, and other agents — skills, coding standards, setup guides, and hard-won lessons — in one repo.

## What's Inside

```
my-agent-os/
├── skills/          # 20 portable agent skills (TDD, debugging, design, git tools, ...)
├── standards/       # Coding rules by domain and tech stack (18 files)
├── guides/          # Setup instructions for tools, MCPs, plugins
├── learnings/       # Patterns, gotchas, hard-won knowledge
├── templates/       # Doc templates for new projects
├── permissions/     # Claude Code permission sets by stack
└── bin/sync.sh      # Pull latest skill backups from source repos
```

## Skills

20 skills organized as **methods** (workflows/processes) and **tools** (actions/generators). Each skill lives in a folder with a `SKILL.md` and optional reference docs.

Always install skills from their **original source** when possible. This repo keeps backup copies in case sources go offline.

See [skills/README.md](skills/README.md) for the full catalog with source links.

### Methods (7)
- **test-driven-development** — Red-green-refactor TDD workflow
- **systematic-debugging** — Structured debugging methodology
- **writing-plans** — Planning discipline for multi-step work
- **decision-records** — Architecture Decision Records
- **karpathy-guidelines** — Andrej Karpathy's coding guidelines
- **emil-design-eng** — Design engineering patterns (Emil Kowalski)
- **swiftui-pro** — SwiftUI + TCA best practices

### Tools (13)
- **find-skills** / **graphify** — Skill discovery and knowledge graph builder
- **gitnexus-\*** (7 tools) — Git-powered code exploration, debugging, refactoring, PR review
- **extract-design** — Extract design tokens from screenshots
- **impeccable** — UI polish and design system review
- **caveman** / **caveman-compress** — Console.log-based performance profiling

## Standards

18 files of coding rules organized by domain (architecture, backend, frontend, security, testing, ...) and tech stack (iOS, Flutter, Next.js, React, Python, Node, Supabase).

Read only what's relevant to your project. See [standards/README.md](standards/README.md) for the index.

## Setting Up a New Project

See [guides/project-setup.md](guides/project-setup.md) for step-by-step instructions covering:
1. Copy doc templates
2. Install relevant skills from source
3. Set up CLAUDE.md
4. Copy relevant standards
5. Configure permissions

## Adding New Knowledge

When you learn something worth keeping:

1. **New skill** — Add a folder to `skills/methods/` or `skills/tools/` with a `SKILL.md` and `SOURCE` file
2. **New standard** — Add or update a file in `standards/`
3. **New guide** — Add a setup guide to `guides/`
4. **New learning** — Add to `learnings/`
5. Update the relevant `README.md` index

## Syncing Skill Backups

Pull latest from all source repos:

```bash
# See what would be synced
bin/sync.sh --dry-run

# Actually sync
bin/sync.sh
```

## Agent Compatibility

| Agent | How to use |
|-------|-----------|
| Claude Code | Copy skills to project `skills/`, use native Skill tool |
| Codex | Copy skills to project, read `SKILL.md` files directly |
| Gemini CLI | Copy skills to project, use `activate_skill` or read `SKILL.md` |
| Other | Read `SKILL.md` files directly |
