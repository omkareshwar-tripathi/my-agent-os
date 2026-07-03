# 01 — Global configuration (`~/.claude/`)

These settings apply to **every** Claude Code session on the machine, regardless of
project. The full file is in [`../artifacts/global/settings.json`](../artifacts/global/settings.json).

## The settings at a glance

| Setting | Value | What it does |
|---|---|---|
| `permissions.defaultMode` | `auto` | Auto-approves tool calls instead of prompting each time. Combined with the two skips below, this means very few interruptions. |
| `permissions.allow` | ralph-wiggum cache path | Pre-approves running the ralph-wiggum plugin's scripts without a prompt. |
| `alwaysThinkingEnabled` | `true` | Claude always uses extended thinking before responding. |
| `effortLevel` | `xhigh` | Maximum reasoning effort — the model thinks longer/harder on every turn. |
| `skipDangerousModePermissionPrompt` | `true` | Suppresses the warning prompt when entering dangerous (bypass) permission mode. |
| `skipAutoPermissionPrompt` | `true` | Suppresses the auto-mode confirmation prompt. |
| `theme` | `dark-daltonized` | Dark theme with colorblind-friendly palette. |
| `agentPushNotifEnabled` | `true` | Background/cloud agents send push notifications on completion. |
| `voiceEnabled` + `voice.mode` | `true`, `hold` | Voice input enabled in push-to-talk ("hold") mode. |

**The net effect:** a low-friction, high-effort setup. Claude rarely stops to ask
permission, always thinks hard, and signals status through sound, push
notifications, and a rich status line rather than blocking dialogs.

## Status line

`statusLine` runs [`statusline.sh`](../artifacts/global/statusline.sh) on every
refresh. It reads the session JSON from stdin and prints a single colored line:

```
<git-branch> | <model name> | ████████████░░░░░░░░ 62%
```

- **Branch** (cyan) — current git branch of the working directory, or `no-git`.
- **Model** (magenta) — the active model's display name.
- **Context bar** (20 chars) — how full the context window is.

The percentage is **rescaled so that 77% of the real window shows as 100%** — the
author treats 77% as the practical ceiling (beyond it, quality/compaction risk
rises), so the bar "fills up" at that point. Color thresholds on the scaled value:
green < 65%, yellow < 85%, red ≥ 85%.

## Hooks defined globally

One kind of global hook lives in `settings.json` (full behavior in
[`05-hooks.md`](05-hooks.md)):

- **Sound cues** — `afplay` plays `Glass.aiff` when Claude stops and `Funk.aiff` on
  notifications (macOS system sounds).

(GitNexus enrichment hooks were dropped from the global standard 2026-07-03 —
the plugin is enabled per-project where a code graph is actually maintained.)

## Plugins + marketplaces declared here

- `enabledPlugins`: `superpowers` and `ponytail` on (user-wide).
- `extraKnownMarketplaces`: registers the `ponytail` (GitHub `DietrichGebert/ponytail`)
  and `gitnexus-marketplace` (GitHub `abhigyanpatwari/GitNexus`) sources.

See [`02-plugins.md`](02-plugins.md) for the complete plugin picture.

## What's intentionally NOT captured

`~/.claude/settings.local.json` exists on the machine but is **excluded** from this
repo. It's a machine-local permission allowlist with absolute paths to unrelated
projects (Flutter/Astrology work, Python helpers) — not reusable, and not relevant
to this setup.
