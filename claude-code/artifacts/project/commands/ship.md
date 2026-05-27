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
- **A** plan      (opus,   ~110K) brainstorm + locked plan + impact pre-check  ← judgment phase, KEEP opus
- **B** feat      (sonnet,  ~70K) implement Swift + `xcodebuild build` + feat commit  ← mechanical: plan ships exact code
- **C** test      (sonnet,  ~70K) isolation tests + `xcodebuild test` + test commit  ← mechanical: plan ships exact tests
- **D** docs      (sonnet,  ~35K) feature-log + doc-update-map + docs commit
- **E** simplify  (sonnet ×3 parallel, ~110K) Reuse + Quality + Efficiency lenses
- **F** review    (opus,   ~100K) /review × 1 → `brick-NN-review.md`  ← quality backstop, KEEP opus
- **Phase 7 INLINE** (orchestrator, ~5K) 5 STATUS.md edits + `npx gitnexus analyze` + 2 chore commits

Halt conditions (no auto-recovery):
- Any phase returns `STATUS: BLOCKED` or `DONE_WITH_CONCERNS`
- Verification mismatch (commit count, last-commit subject, test count, tree dirty)
- Plan-review gate detects a CLAUDE.md § 2 / § 3 violation in the locked plan

PushNotification at every brick boundary:
`"Brick NN done — n/N — proceeding"` or `"Brick NN BLOCKED at phase X"`.

Model split rationale: judgment lives in A (scoping, peer-mirror detection, impact
read) and F (adversarial APPROVE/reject) — both stay opus. B and C only transcribe
the exact code/tests the locked plan already contains, bounded below by xcodebuild
and above by the opus orchestrator's post-phase git verification + the F review, so
they run on sonnet. This cuts opus spend ~40%/brick — the usage-limit ceiling is
opus-weighted, so it lengthens autonomous runs. If B/C reviews start coming back
with must-fixes, the cheapest first lever is to put C (test) back on opus.

Commit trailer: a phase stamps the model that actually authored it. B/C feat+test
commits use `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`; A/F/Phase-7
opus commits keep the Opus 4.7 trailer.

Stretch: if all N land clean with zero must-fix in any /review, optionally continue
to N+1. Default N=4 (validated). Empirical ceiling was N=5 on all-opus (bricks
47–51, 2026-05-21); the B/C sonnet downshift should raise effective headroom, but
re-validate before relying on N>5.

Never push, amend, or use `--no-verify` / `--no-gpg-sign`. Never destructive ops
without explicit user authorization.
