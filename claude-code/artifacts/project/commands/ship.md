---
description: Autonomously ship N bricks via the 6-phase sub-agent orchestrator. Usage: /ship [N=4]
---

Ship the next ${1:-4} bricks autonomously using the 6-phase split plan at
`~/.claude/plans/let-s-build-this-brick-by-brick-transient-scroll.md`.

Pre-flight gates (halt + PushNotify on any failure, no auto-fix):
- `git status --porcelain` empty
- Branch == `main`
- `docs/plans/STATUS.md` "Current Brick" line parseable
- Prior brick's `test:` commit grep gives baseline `M`
- `npx gitnexus status` fresh (run `analyze` if stale)
- `xcodebuild test` SUCCEEDED with count == `M`

Per brick (sequential, foreground sub-agent dispatch):
- **A** plan      (opus, ~110K)  brainstorm + locked plan + impact pre-check
- **B** feat      (opus,  ~70K)  implement Swift + `xcodebuild build` + feat commit
- **C** test      (opus,  ~70K)  isolation tests + `xcodebuild test` + test commit
- **D** docs      (sonnet, ~35K) feature-log + doc-update-map + docs commit
- **E** simplify  (sonnet ×3 parallel, ~110K) Reuse + Quality + Efficiency lenses
- **F** review    (opus, ~100K)  /review × 1 → `brick-NN-review.md`
- **Phase 7 INLINE** (orchestrator, ~5K) 5 STATUS.md edits + `npx gitnexus analyze` + 2 chore commits

Halt conditions (no auto-recovery):
- Any phase returns `STATUS: BLOCKED` or `DONE_WITH_CONCERNS`
- Verification mismatch (commit count, last-commit subject, test count, tree dirty)
- Plan-review gate detects a CLAUDE.md § 2 / § 3 violation in the locked plan

PushNotification at every brick boundary:
`"Brick NN done — n/N — proceeding"` or `"Brick NN BLOCKED at phase X"`.

Stretch: if all N land clean with zero must-fix in any /review, optionally continue
to N+1. Default N=4 (validated). Maximum recommended N=5 (the empirical stretch
ceiling — bricks 47/48/49/50/51 shipped at N=5 in one session on 2026-05-21).

Never push, amend, or use `--no-verify` / `--no-gpg-sign`. Never destructive ops
without explicit user authorization.
