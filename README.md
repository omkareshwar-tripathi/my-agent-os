# My Agent OS

Personal, portable agentic operating system for Claude, Codex, Gemini, and other coding agents.

Clone this once. Run the installer whenever you start a new project. Every agent you work with instantly has your rules, skills, workflow docs, and coding standards — without any framework or stack assumptions.

## What It Does

Stamps your agent operating method into any target repository. Stack-neutral by design.

**Included:**
- Agent instruction adapters: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`
- Process docs: workflow, decisions, coding standards, gotchas, changelog
- Methodology skills: planning, debugging, TDD, decision records, skill discovery
- A conservative installer that never overwrites existing files unless `--force` is passed

**Not included** (add these inside each project after install):
- Framework rules
- Language style guides
- Database-specific guidance
- UI / design-system instructions
- Hosting or deployment assumptions

## Install Into A Project

```bash
# One-time setup: clone to a permanent home
git clone git@github.com:omkareshwartripathi/my-agent-os.git ~/my-agent-os

# Stamp into any project
~/my-agent-os/bin/install.sh /path/to/project

# Install into the current directory
~/my-agent-os/bin/install.sh .

# Overwrite existing workflow-managed files
~/my-agent-os/bin/install.sh /path/to/project --force

# Skip skills if the project already has them
~/my-agent-os/bin/install.sh /path/to/project --skip-skills
```

## Keeping Projects Up To Date

Re-run the installer whenever this repo changes:

```bash
git -C ~/my-agent-os pull
~/my-agent-os/bin/install.sh /path/to/project
```

Without `--force`, conflicts are written as `*.agent-workflow.new` so you can compare manually.

## Repository Layout

```
bin/install.sh                 Installer
templates/base/                Files stamped into every project
templates/base/AGENTS.md       Universal agent instructions
templates/base/CLAUDE.md       Claude adapter
templates/base/GEMINI.md       Gemini adapter
templates/base/docs/           Stack-neutral process docs
templates/base/skills/         Stack-neutral methodology skills
```

## Agent Compatibility

| Agent | Reads |
|-------|-------|
| Claude Code | `CLAUDE.md` → `AGENTS.md` → `skills/` via Skill tool |
| Codex | `AGENTS.md` directly |
| Gemini CLI | `GEMINI.md` → `AGENTS.md` → `skills/` via `activate_skill` |
| Other agents | `AGENTS.md`, then matching `skills/<name>/SKILL.md` |

## Adding New Skills Or Rules

1. Drop a new skill folder into `templates/base/skills/`.
2. Commit and push.
3. Re-run the installer on any project that should get it.

This repo is the single source of truth for your entire agentic workflow.
