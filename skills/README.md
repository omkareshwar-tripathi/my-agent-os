# Skills

Portable agent skills for Claude Code, Codex, Gemini CLI, and other agents. Each skill is a folder with a `SKILL.md` file and an optional `references/` directory.

**Install from source** — always grab the latest from the original repo. Copies here are backups.

## Methods (workflow / process)

| Skill | Description | Source |
|-------|-------------|--------|
| [test-driven-development](methods/test-driven-development/) | Red-green-refactor TDD workflow | local |
| [systematic-debugging](methods/systematic-debugging/) | Structured debugging methodology | local |
| [writing-plans](methods/writing-plans/) | Planning discipline for multi-step work | local |
| [decision-records](methods/decision-records/) | Architecture Decision Records (ADR) | local |
| [karpathy-guidelines](methods/karpathy-guidelines/) | Andrej Karpathy's coding guidelines | local |
| [emil-design-eng](methods/emil-design-eng/) | Design engineering patterns (Emil Kowalski) | [source](https://github.com/emilkowalski/skill) |
| [swiftui-pro](methods/swiftui-pro/) | SwiftUI + TCA best practices (9 reference docs) | [source](https://github.com/AshkanAe/SwiftUI-Agent-Skill) |

## Tools (action / generation)

| Skill | Description | Source |
|-------|-------------|--------|
| [find-skills](tools/find-skills/) | Discover and load relevant skills | local |
| [graphify](tools/graphify/) | Build knowledge graphs from codebases | local |
| [gitnexus-guide](tools/gitnexus-guide/) | GitNexus overview and setup | [source](https://github.com/nicepkg/gitnexus-claude-plugin) |
| [gitnexus-cli](tools/gitnexus-cli/) | Git CLI operations via GitNexus | [source](https://github.com/nicepkg/gitnexus-claude-plugin) |
| [gitnexus-exploring](tools/gitnexus-exploring/) | Explore repos with GitNexus | [source](https://github.com/nicepkg/gitnexus-claude-plugin) |
| [gitnexus-debugging](tools/gitnexus-debugging/) | Debug with git history | [source](https://github.com/nicepkg/gitnexus-claude-plugin) |
| [gitnexus-impact-analysis](tools/gitnexus-impact-analysis/) | Analyze change impact via git | [source](https://github.com/nicepkg/gitnexus-claude-plugin) |
| [gitnexus-refactoring](tools/gitnexus-refactoring/) | Refactor with git context | [source](https://github.com/nicepkg/gitnexus-claude-plugin) |
| [gitnexus-pr-review](tools/gitnexus-pr-review/) | PR review with GitNexus | [source](https://github.com/nicepkg/gitnexus-claude-plugin) |
| [extract-design](tools/extract-design/) | Extract design tokens from screenshots | [source](https://github.com/olimorris/design-extract.mdc) |
| [impeccable](tools/impeccable/) | UI polish and design system review (35 reference docs) | [source](https://github.com/gianpaj/impeccable) |
| [caveman](tools/caveman/) | Console.log-based performance profiling | [source](https://github.com/nicholascostadev/caveman) |
| [caveman-compress](tools/caveman-compress/) | Compress caveman profiling output | [source](https://github.com/nicholascostadev/caveman) |

## How to install a skill into a project

1. **From source (preferred):** Clone or copy the skill from its source repo into your project's `skills/` directory.
2. **From this backup:** Copy the skill folder into your project's `skills/methods/` or `skills/tools/`.
3. **In Claude Code:** Skills are auto-detected via the Skill tool. Just having them in `skills/` is enough.
