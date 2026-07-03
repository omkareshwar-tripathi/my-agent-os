# 05 — Hooks

Hooks are shell commands Claude Code runs automatically on lifecycle events
(SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, Stop, Notification). They
are how this setup *enforces* discipline mechanically instead of relying on Claude
to remember. The harness treats hook output as authoritative — a Stop hook that
exits non-zero actually **blocks** the turn from ending.

## Global hooks (`~/.claude/settings.json`)

| Event | Matcher | Command | Effect |
|---|---|---|---|
| **Stop** | — | `afplay /System/Library/Sounds/Glass.aiff` | Plays a sound when Claude finishes a turn. |
| **Notification** | — | `afplay /System/Library/Sounds/Funk.aiff` | Plays a sound on notifications. |

> The settings wiring is in
> [`../artifacts/global/settings.json`](../artifacts/global/settings.json).
> GitNexus enrichment hooks (PreToolUse/PostToolUse) were dropped from the global
> standard 2026-07-03 — enable the gitnexus plugin per-project instead.

## Project hooks (`<repo>/.claude/hooks/`)

**The three standard project hooks live in [`../../atlas/adopt/hooks/`](../../atlas/adopt/hooks/)
— the single source of truth — and are installed + wired into a repo's
`.claude/settings.json` by running `node atlas/adopt.js` from that repo.**
The sections below explain what each one does.

> Retired from the standard 2026-07-03: `run-simplify-on-stop.sh` (advisory
> /simplify nudge — the ponytail plugin covers simplicity now) and the Swift
> docs-behind-code gate `check-docs-updated.sh` (lives on in the remembry repo
> itself, not here).

### SessionStart — `session-start-status.sh`

Reads the repo-root `STATUS.md` and injects it into the
session as `additionalContext`. **Every session opens with the current project status
visible**, so Claude can't start work without knowing where things stand. Emits
a graceful fallback if the file is missing. (Written to avoid heredocs-in-subshells
because macOS ships bash 3.2.)

### UserPromptSubmit — `skill-reminder.sh`

On **every** user prompt, scans `<repo>/.claude/skills/` and `~/.claude/skills/` for
`SKILL.md` files, extracts each description, and injects the list as context with a
reminder: *"scan the skill list; if one applies, read its SKILL.md before acting."*
This keeps the large skill library top-of-mind.

### Stop — `check-status-updated.sh`

Fires when Claude tries to end a turn. It has a **loop guard** (it allows the
stop if it's already responding to a prior block) and is self-limiting (bumping
STATUS.md's date keeps it quiet for the rest of the day). Blocks (exit 2) when
the repo changed this turn but STATUS.md's `updated` date is stale; tells Claude
to update the relevant sections or bump the date.

## Why hooks instead of instructions

Instructions in `CLAUDE.md` are guidance Claude *should* follow; hooks are
guardrails the harness *enforces*. Pairing them is the core trick of this setup:
`CLAUDE.md` explains the discipline in prose, and the hooks make the most
important parts non-optional (you can't silently end a session with a stale
STATUS.md).
