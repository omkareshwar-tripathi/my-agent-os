# My Agent OS

A modular, portable agentic operating system for Claude Code, Codex, Gemini, and any other coding agent. Maintain one master set of rules, skills, and workflow docs — stamp them into every project you work on. Changes propagate automatically.

## Quick Start

```bash
# Clone to your home directory (one-time)
git clone git@github.com:omkareshwar-tripathi/my-agent-os.git ~/my-agent-os

# Install into any project using a profile
~/my-agent-os/bin/install.sh /path/to/project --profile webapp

# Or pick specific modules
~/my-agent-os/bin/install.sh /path/to/project --modules frontend,nextjs,testing
```

## Concepts

### Modules

Modules are the building blocks. Each one ships agent instructions, docs, skills, and Claude Code settings for a specific domain. There are two kinds:

- **Function modules** — domain expertise: `frontend`, `design`, `architecture`, `testing`, `backend`, `devops`, `security`, `performance`, `code-quality`
- **Stack modules** — tech-specific rules: `ios`, `flutter`, `nextjs`, `react`, `python`, `node`, `supabase`

### Core

The `core` module is always installed. It provides the base agent instructions (instruction priority, task workflow, coding standards, safety rules), process docs, and universal methodology skills (TDD, debugging, planning, decision records).

### Skills

Skills are portable Markdown folders with a `SKILL.md` file. They come in two categories:

- **Methods** — workflows and methodologies (TDD, systematic debugging, writing plans)
- **Tools** — utilities that generate or transform things (graphify, find-skills)

Skills are **symlinked** from my-agent-os into your project. When you update a skill in my-agent-os, every project gets the change instantly.

### Profiles

Profiles are presets that bundle modules for common project types:

| Profile | Modules |
|---------|---------|
| `ios-app` | core, frontend, design, testing, performance, code-quality, ios |
| `flutter-app` | core, frontend, design, testing, performance, code-quality, flutter |
| `webapp` | core, frontend, design, testing, performance, code-quality, security, nextjs, react |
| `fullstack` | core, frontend, backend, design, architecture, testing, performance, security, code-quality, devops, nextjs, react, node, supabase |

### Project Overrides

Every installed project gets a `.agent-os/` directory that is **never touched by the installer** after creation. Put project-specific agent instructions in `.agent-os/agents-extra.md` — they get appended to the generated `AGENTS.md`.

```
project/.agent-os/
├── agents-extra.md    # Appended to AGENTS.md (your project-specific rules)
├── docs/              # Project-specific docs
└── skills/            # Project-specific skills
```

### How Composition Works

The installer stitches a single `AGENTS.md` from:

1. **Core instructions** (the backbone — priorities, workflow, standards, safety)
2. **Function module sections** (alphabetical — architecture, backend, code-quality, design, ...)
3. **Stack module sections** (alphabetical — flutter, ios, nextjs, ...)
4. **Project overrides** (from `.agent-os/agents-extra.md`)

Each section has a clear heading. Agents read one file top-to-bottom, from universal rules to specific ones.

## Installing Into a Project

```bash
# With a profile
~/my-agent-os/bin/install.sh /path/to/project --profile webapp

# With specific modules
~/my-agent-os/bin/install.sh /path/to/project --modules frontend,nextjs,testing

# Profile + extra modules
~/my-agent-os/bin/install.sh /path/to/project --profile webapp --modules devops

# Re-install (re-reads existing .agent-os.yaml)
~/my-agent-os/bin/install.sh /path/to/project

# Force overwrite all generated files
~/my-agent-os/bin/install.sh /path/to/project --force

# Skip skill symlinks
~/my-agent-os/bin/install.sh /path/to/project --profile webapp --skip-skills
```

### What Gets Created

```
project/
├── .agent-os.yaml         # Manifest (which modules, version hash)
├── AGENTS.md              # Generated — DO NOT EDIT (use .agent-os/agents-extra.md)
├── CLAUDE.md              # Generated adapter for Claude Code
├── GEMINI.md              # Generated adapter for Gemini CLI
├── .agent-os/             # Your project overrides (never touched by installer)
│   ├── agents-extra.md
│   ├── docs/
│   └── skills/
├── docs/                  # Process docs from core + selected modules
├── skills/
│   ├── methods/           # Symlinked methodology skills
│   └── tools/             # Symlinked utility skills
└── .claude/
    └── settings.json      # Merged permissions and hooks from modules
```

## Updating Projects

### Manual Update (One Project)

```bash
~/my-agent-os/bin/update.sh /path/to/project
```

### Update All Registered Projects

```bash
~/my-agent-os/bin/update-all.sh
```

### Auto-Update on Project Open

The installer registers a Claude Code hook that checks for my-agent-os updates every time you start a session. If the source has changed, it recomposes `AGENTS.md` and updates skills automatically. Zero manual work.

### Pull + Propagate

```bash
cd ~/my-agent-os && git pull
~/my-agent-os/bin/update-all.sh
```

## Listing Available Modules

```bash
# Show everything
~/my-agent-os/bin/list-modules.sh

# Just function modules
~/my-agent-os/bin/list-modules.sh --modules

# Just stack modules
~/my-agent-os/bin/list-modules.sh --stacks

# Just profiles
~/my-agent-os/bin/list-modules.sh --profiles
```

## Importing Skills from GitHub

The import engine fetches a skill from GitHub, auto-classifies it by analyzing its content, and places it in the right module.

```bash
# Auto-classify and import
~/my-agent-os/bin/import.sh https://github.com/someone/cool-skill

# Import a subdirectory of a repo
~/my-agent-os/bin/import.sh https://github.com/someone/repo/tree/main/skills/tdd-skill

# Skip classification — specify placement
~/my-agent-os/bin/import.sh https://github.com/someone/skill --module testing --type method

# Auto-confirm (no prompt)
~/my-agent-os/bin/import.sh https://github.com/someone/skill -y
```

The engine reads SKILL.md frontmatter and README content, then uses keyword matching to classify:

- **Type**: method (workflow/process keywords) or tool (generate/build/run keywords)
- **Module**: matched against domain keywords (e.g., "test", "tdd" → testing; "component", "ui" → frontend; "swift", "xcode" → ios)

You always get to confirm or change the classification before it's installed.

## Adding Skills Manually

1. Create a folder in the right module:
   ```bash
   mkdir -p ~/my-agent-os/modules/testing/skills/methods/my-new-skill
   ```

2. Write a `SKILL.md` with frontmatter:
   ```markdown
   ---
   name: my-new-skill
   description: Use when [trigger condition]
   ---

   [Skill instructions here]
   ```

3. Commit and push:
   ```bash
   cd ~/my-agent-os && git add . && git commit -m "add my-new-skill" && git push
   ```

4. All projects get it on next update (or instantly via symlinks for existing installs).

## Creating New Modules

1. Create the directory structure:
   ```bash
   mkdir -p ~/my-agent-os/modules/my-module/{docs,skills/methods,skills/tools,settings}
   ```

2. Write `module.yaml`:
   ```yaml
   name: "my-module"
   type: "function"
   description: "What this module covers"
   version: 1
   requires: []
   agents_fragment: "agents.md"
   docs: []
   skills:
     methods: []
     tools: []
   settings:
     permissions: "settings/permissions.json"
     hooks: "settings/hooks.json"
   ```

3. Write `agents.md` with domain-specific instructions (appended to composed AGENTS.md).

4. Write `settings/permissions.json` and `settings/hooks.json` (empty `[]` if none needed).

## Creating New Profiles

Create a YAML file in `profiles/`:

```yaml
# profiles/my-profile.yaml
name: my-profile
description: "Description of this project type"
modules:
  - frontend
  - design
  - testing
stacks:
  - nextjs
  - react
```

## Agent Compatibility

| Agent | Reads | Skills |
|-------|-------|--------|
| Claude Code | `CLAUDE.md` → `AGENTS.md` | Native Skill tool, then `skills/<name>/SKILL.md` |
| Codex | `AGENTS.md` directly | `skills/<name>/SKILL.md` |
| Gemini CLI | `GEMINI.md` → `AGENTS.md` | `activate_skill`, then `skills/<name>/SKILL.md` |
| Other agents | `AGENTS.md` | `skills/<name>/SKILL.md` |

## Repository Layout

```
~/my-agent-os/
├── core/                    Always installed
│   ├── module.yaml
│   ├── agents.md            Base agent instructions
│   ├── claude.md            Claude adapter template
│   ├── gemini.md            Gemini adapter template
│   ├── docs/                Process docs (workflow, standards, decisions, gotchas, changelog)
│   └── skills/
│       ├── methods/         TDD, debugging, planning, decision records
│       └── tools/           find-skills, graphify
│
├── modules/                 Function modules
│   ├── frontend/
│   ├── design/
│   ├── architecture/
│   ├── testing/
│   ├── backend/
│   ├── devops/
│   ├── security/
│   ├── performance/
│   └── code-quality/
│
├── stacks/                  Tech-stack modules
│   ├── ios/
│   ├── flutter/
│   ├── nextjs/
│   ├── react/
│   ├── python/
│   ├── node/
│   └── supabase/
│
├── profiles/                Preset bundles
│   ├── ios-app.yaml
│   ├── flutter-app.yaml
│   ├── webapp.yaml
│   └── fullstack.yaml
│
└── bin/                     Scripts
    ├── _lib.sh              Shared helpers
    ├── install.sh           Install into a project
    ├── compose.sh           Generate AGENTS.md from modules
    ├── update.sh            Update one project
    ├── update-all.sh        Update all projects
    ├── list-modules.sh      Show available modules/stacks/profiles
    ├── import.sh            Import skills from GitHub
    └── hooks/
        └── auto-update.sh   Claude Code auto-update hook
```

## Architectural Invariants

1. **Core is always installed.** No project can omit it.
2. **AGENTS.md is always generated.** Never hand-edit it in projects. Use `.agent-os/agents-extra.md` for overrides.
3. **Skills are symlinked, docs are copied.** Skills propagate instantly; docs are templates you can customize per-project.
4. **`.agent-os/` is sacred.** The installer creates it but never modifies its contents.
5. **Settings merge is additive-only.** Removing a module never removes its permissions from `.claude/settings.json`.
6. **No external dependencies.** Only bash, coreutils, and Python 3.
7. **Deterministic output.** Same modules + same source = identical AGENTS.md.

## FAQ

**Can I use this without Claude Code?**
Yes. The core system generates `AGENTS.md` which any agent can read. Skills are plain Markdown files. The only Claude-specific feature is the auto-update hook and `.claude/settings.json` management.

**What if I want different modules for different parts of a monorepo?**
Run the installer on each subdirectory with different profiles. Each gets its own `.agent-os.yaml` and composed `AGENTS.md`.

**How do I remove a module from a project?**
Edit `.agent-os.yaml` to remove it from the modules list, then run `update.sh`. The module's agent instructions are removed from the next compose. Its skill symlinks are cleaned up. Its docs and permissions remain (safe removal — you can delete manually).

**Can two modules conflict?**
Module agent instructions are additive (each gets its own section). Permissions are union-merged. The only potential issue is contradictory advice in agents.md fragments, which you'd resolve by editing one of them.

**How do I upgrade from the old flat installer?**
Delete the old `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `docs/`, and `skills/` from your project, then re-run `install.sh` with the desired profile.
