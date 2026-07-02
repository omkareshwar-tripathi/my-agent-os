# 05 — Hooks

Hooks are shell commands Claude Code runs automatically on lifecycle events
(SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, Stop, Notification). They
are how this setup *enforces* discipline mechanically instead of relying on Claude
to remember. The harness treats hook output as authoritative — a Stop hook that
exits non-zero actually **blocks** the turn from ending.

## Global hooks (`~/.claude/settings.json`)

| Event | Matcher | Command | Effect |
|---|---|---|---|
| **PreToolUse** | `Grep｜Glob｜Bash` | `node ~/.claude/hooks/gitnexus/gitnexus-hook.cjs` | Enriches searches with GitNexus graph context before the tool runs. |
| **PostToolUse** | `Bash` | same script | Detects git mutations (commit/merge/rebase/pull) and warns when the GitNexus index is stale. |
| **Stop** | — | `afplay /System/Library/Sounds/Glass.aiff` | Plays a sound when Claude finishes a turn. |
| **Notification** | — | `afplay /System/Library/Sounds/Funk.aiff` | Plays a sound on notifications. |

> The GitNexus `.cjs` script itself isn't included as an artifact (it ships with the
> gitnexus plugin/CLI). The settings wiring is in
> [`../artifacts/global/settings.json`](../artifacts/global/settings.json).

## Project hooks (`<repo>/.claude/hooks/`)

**The four standard project hooks live in [`../../atlas/adopt/hooks/`](../../atlas/adopt/hooks/)
— the single source of truth — and are installed + wired into a repo's
`.claude/settings.json` by running `node atlas/adopt.js` from that repo.**
The sections below explain what each one does. One extra project-specific hook
remains an artifact here:
[`check-docs-updated.sh`](../artifacts/project/hooks/check-docs-updated.sh)
(the docs-behind-code gate used by the brick methodology).

### SessionStart — `session-start-status.sh`

Reads `docs/plans/STATUS.md` (the live build dashboard) and injects it into the
session as `additionalContext`. **Every session opens with the current brick status
visible**, so Claude can't start work without knowing where the waterfall is. Emits
a graceful fallback if the file is missing. (Written to avoid heredocs-in-subshells
because macOS ships bash 3.2.)

### UserPromptSubmit — `skill-reminder.sh`

On **every** user prompt, scans `<repo>/.claude/skills/` and `~/.claude/skills/` for
`SKILL.md` files, extracts each description, and injects the list as context with a
reminder: *"scan the skill list; if one applies, read its SKILL.md before acting."*
This keeps the large skill library top-of-mind.

### Stop — three guardrails

These fire when Claude tries to end a turn. Each has a **loop guard** (it allows the
stop if it's already responding to a prior block) and an **escape hatch** (commit
your changes — committed work silences the check, because git history is the
source of truth).

| Script | Blocks when… | Tells Claude to… |
|---|---|---|
| **check-docs-updated.sh** | Swift files changed but no relevant doc did | Update the specific doc mapped from the changed path (data-models / design-system / api-services / feature-log / architecture-decisions / dependencies). For design decisions, the entry must include the WHY. **Exit 2 = blocks.** |
| **check-status-updated.sh** | A brick plan's `**Status:**` header changed but `STATUS.md` didn't | Update `STATUS.md` (move done bricks, set current brick, refresh timestamp). **Exit 2 = blocks.** |
| **run-simplify-on-stop.sh** | Swift files changed | *Advisory only* — shows a message asking whether to run `/simplify`. **Exit 0 = never blocks.** (Was blocking until 2026-05-10; relaxed to advisory at the author's request so they control when simplify runs.) |

### The path-to-doc map (inside `check-docs-updated.sh`)

This is the heart of the doc-discipline. Changed Swift paths map to required docs:

| Changed path pattern | Required doc |
|---|---|
| `Core/Persistence/*`, `*Repository*.swift`, `*+CoreData*.swift`, `*.xcdatamodeld/*` | `docs/data-models.md` |
| `Core/DesignSystem/*`, `*Components/*`, `*Theme*.swift`, `*Colors*.swift`, … | `docs/design-system.md` |
| `Core/Services/*`, `*Service*.swift`, `*API*.swift`, `*Client*.swift` | `docs/api-services.md` |
| `Features/*` | `docs/feature-log.md` |
| `Container.swift`, `AppRouter.swift`, `PersistenceController.swift`, `*App.swift`, `Info.plist`, `*.entitlements` | `docs/architecture-decisions.md` |
| `Package.swift`, `Package.resolved` | `docs/dependencies.md` + `docs/architecture-decisions.md` |

> **Adapting for another stack:** this map is Swift/iOS-specific. To reuse the hook
> in a different project, rewrite the `case "$f" in …` patterns and target docs.

## Why hooks instead of instructions

Instructions in `CLAUDE.md` are guidance Claude *should* follow; hooks are
guardrails the harness *enforces*. Pairing them is the core trick of this setup:
`CLAUDE.md` explains the discipline in prose, and the hooks make the most important
parts non-optional (you literally can't end a turn with code ahead of docs unless
you commit).
