# Global Agent Workflow

Personal, portable project setup for Claude, Codex, Gemini, and other coding agents.

This repository is meant to live on GitHub and be cloned whenever you start a new project. It installs a universal agent workflow into any target repository without tying the target to one app or one agent runtime.

## What This Gives You

- `AGENTS.md` as the universal canonical instruction file.
- `CLAUDE.md` and `GEMINI.md` as compatibility adapters.
- A `docs/` knowledge base that agents use before and after coding.
- A reusable `skills/` bundle for planning, debugging, TDD, UI work, skill discovery, and graph-based codebase analysis.
- Optional project profiles: `ios-swiftui` and `nextjs-supabase`.
- A conservative installer that does not overwrite existing files unless `--force` is passed.

## Install In A Project

From a local clone of this repo:

```bash
./bin/install.sh /absolute/path/to/project
```

Install into the current directory:

```bash
./bin/install.sh .
```

Install with the iOS/SwiftUI profile:

```bash
./bin/install.sh /absolute/path/to/project --profile ios-swiftui
```

Install with the Next.js/Supabase profile:

```bash
./bin/install.sh /absolute/path/to/project --profile nextjs-supabase
```

Overwrite existing workflow-managed files:

```bash
./bin/install.sh /absolute/path/to/project --force
```

Skip skills if the target project already has them:

```bash
./bin/install.sh /absolute/path/to/project --skip-skills
```

List available profiles:

```bash
./bin/install.sh --list-profiles
```

## GitHub Usage

Create a GitHub repository for this folder, then from any machine:

```bash
git clone git@github.com:<your-user>/global-agent-workflow.git ~/.global-agent-workflow
~/.global-agent-workflow/bin/install.sh /path/to/new-project --profile nextjs-supabase
```

For other project types, omit `--profile` and customize the generated `docs/` files for the stack.

## Repository Layout

```text
bin/install.sh                 Installer
templates/base/                Universal files installed into every project
templates/base/docs/           Generic project knowledge base
templates/base/skills/         Portable skills bundle
profiles/ios-swiftui/          Optional SwiftUI/iOS profile
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
