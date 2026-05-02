# Global Agent Workflow

Personal, portable process setup for Claude, Codex, Gemini, and other coding agents.

This repository is meant to live on GitHub and be cloned whenever you start a new project. It installs your agent operating method into any target repository without choosing a programming language, framework, database, hosting platform, or UI stack.

## Scope

This repo is intentionally stack-neutral.

It includes:

- Agent instruction adapters: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`.
- Process docs for workflow, decisions, coding discipline, gotchas, and changelog.
- Methodology skills for planning, debugging, TDD, decision records, skill discovery, and graph-based context analysis.
- A conservative installer that does not overwrite existing files unless `--force` is passed.

It does not include:

- Framework rules.
- Language style guides.
- Database-specific guidance.
- UI/design-system instructions.
- Hosting or deployment assumptions.
- Project profiles.

Add stack-specific guidance inside the target project after install, not in this global workflow repo.

## Install In A Project

From a local clone of this repo:

```bash
./bin/install.sh /absolute/path/to/project
```

Install into the current directory:

```bash
./bin/install.sh .
```

Overwrite existing workflow-managed files:

```bash
./bin/install.sh /absolute/path/to/project --force
```

Skip skills if the target project already has them:

```bash
./bin/install.sh /absolute/path/to/project --skip-skills
```

## GitHub Usage

Create a GitHub repository for this folder, then from any machine:

```bash
git clone git@github.com:<your-user>/global-agent-workflow.git ~/.global-agent-workflow
~/.global-agent-workflow/bin/install.sh /path/to/new-project
```

## Repository Layout

```text
bin/install.sh                 Installer
templates/base/                Universal files installed into every project
templates/base/docs/           Stack-neutral process docs
templates/base/skills/         Stack-neutral methodology skills
```

## Agent Compatibility

Claude reads `CLAUDE.md`, which points to `AGENTS.md`.

Codex reads `AGENTS.md` directly.

Gemini reads `GEMINI.md`, which points to `AGENTS.md`.

Other agents should read `AGENTS.md` and then load matching `skills/<name>/SKILL.md` files when the task matches a skill description.

## Updating Existing Projects

Re-run the installer whenever this GitHub repo changes:

```bash
git -C ~/.global-agent-workflow pull
~/.global-agent-workflow/bin/install.sh /path/to/project
```

Without `--force`, conflicts are written as `*.agent-workflow.new` so you can compare manually.
