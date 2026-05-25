# 07 — Memory & continuity

Long projects span many sessions. This setup uses three complementary memory
mechanisms so context survives between conversations without bloating any single
one.

## 1. `.remember/` — conversation memory (the `remember` plugin)

The **remember** plugin (v0.7.2) continuously extracts, summarizes, and compresses
each session into a tiered set of logs in the project's `.remember/` directory:

| File | Horizon | Purpose |
|---|---|---|
| `now.md` | this session | Live scratch buffer of what's happening right now. |
| `today-*.md` | today | Per-day detailed notes. |
| `recent.md` | ~7 days | Rolling recent summary (what shipped, decisions, blockers). |
| `archive.md` | older | Compressed long-term history by week. |
| `core-memories.md` | always | Key moments / identity-defining facts. |
| `logs/memory-YYYY-MM-DD.log` | per day | Raw daily capture (large). |

At **SessionStart** the recent tiers are surfaced back into context, so a new
session opens already knowing "Brick 70 landed, /simplify passed, Phase 7 ready."
Older days are consolidated in the background to keep things compact.

**What it's good for:** narrative continuity — what we did, why, what's next —
across days of work. It's distinct from the build *state* (that's STATUS.md) and
from durable *preferences* (that's auto-memory, below).

## 2. Auto-memory — durable cross-project facts

Claude Code's built-in file-based memory (`MEMORY.md` index + topic files) stores
things meant to persist across *all* future conversations: who the user is, how
they like to collaborate, validated approaches, and project context. Examples in
this setup:

- **Brick-by-brick build discipline** — strict waterfall, one brick at a time.
- **PM-language + skill injection** — explain like to a non-tech PM; every plan step
  gets a `Skill:` line.
- **Auto-accept recommended options** — when one option is clearly "(Recommended)",
  just take it.
- **UI-first, sync-last roadmap** — finish all UI before CloudKit/notifications.
- **Build-status location** — current state lives in `docs/plans/STATUS.md`.

**What it's good for:** preferences and feedback that should shape behavior
indefinitely — not ephemeral task state.

## 3. `STATUS.md` — the build dashboard

`docs/plans/STATUS.md` is the single source of truth for *where the waterfall is*.
It's not memory in the AI sense — it's a checked-in file — but it's the anchor the
SessionStart hook injects every time (see [`05-hooks.md`](05-hooks.md)) and the
thing the Stop hook (`check-status-updated.sh`) refuses to let go stale. Updating it
is part of declaring any brick "done."

## How the three differ (and why all three exist)

| Mechanism | Scope | Lifespan | Source of truth for… |
|---|---|---|---|
| `.remember/` | this project | days→weeks, decaying | the *narrative* — what happened and why |
| Auto-memory | all projects | indefinite | *preferences & durable facts* about the user/project |
| `STATUS.md` | this project | current | the *build state* — which brick, what's next |

Keeping them separate avoids a classic failure mode: stuffing transient task state
into permanent memory (which then goes stale), or losing hard-won preferences when a
session ends. Each layer holds exactly what matches its lifespan.
