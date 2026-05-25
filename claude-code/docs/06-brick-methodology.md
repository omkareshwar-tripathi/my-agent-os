# 06 — The brick-by-brick methodology

This is the workflow that everything else serves. It's a **strict waterfall built
out of tiny increments called "bricks."** The full rulebook is the project
`CLAUDE.md` ([artifact](../artifacts/project/CLAUDE.md)); this doc explains the
philosophy and the automation.

## The core idea

Build one small, fully-finished, fully-tested increment at a time — never work
ahead. Each brick is planned, built, tested, documented, simplified, and reviewed
*before* the next one starts. The current position in the build is always recorded
in `docs/plans/STATUS.md`, and per-brick plans live in `docs/plans/brick-NN-*.md`.

**Why this works:** every commit is shippable, the diff is always small enough to
review properly, and regressions are caught immediately because tests grow with the
code. The downside it accepts on purpose: it's slower than batch work, and it
demands discipline — which is why hooks enforce it.

## The five rules (from `CLAUDE.md`)

1. **Think before coding** — state assumptions, surface tradeoffs, ask when unclear.
2. **Simplicity first** — minimum code, nothing speculative; "would a senior
   engineer say this is overcomplicated?"
3. **Surgical changes** — touch only what the task needs; don't improve adjacent
   code; clean up only your own orphans.
4. **Goal-driven execution** — turn tasks into verifiable success criteria, loop
   until verified.
5. **PM-language communication + skill injection** — explain like to a
   non-technical product manager (what changes / why it matters / what the user
   sees), and name the applicable `Skill:` on every plan step.

## Brick sizing (§ 2a)

After 50+ bricks, the size rules were tuned:

- **Soft ceiling:** ~4 source files / ~80 source LOC / ~8 tests. If a change fits in
  that box, ship it as one brick — don't split for the sake of smallness.
- **Hard ceiling:** ~150 source LOC or >5 source files → **split**. Beyond that, the
  6-phase sub-agent context budget breaks down.
- **Peer-mirror bundling is REQUIRED:** when the same algorithm is copied
  byte-for-byte onto a peer surface (e.g. a Timeline view-model and its Trash
  twin), both go in **one** brick. Planning must check for peer mirrors up front.

## The `/ship` command — automating the loop

[`/ship [N=4]`](../artifacts/project/commands/ship.md) ships the next N bricks
autonomously by dispatching a chain of sub-agents per brick. Each sub-agent gets a
fresh context window sized to its job, which is how a long autonomous run avoids
context exhaustion.

**Pre-flight gates** (any failure halts the run and sends a push notification —
no auto-fixing):

- clean working tree, on `main`
- `STATUS.md` "Current Brick" line parseable
- baseline test count `M` recoverable from the prior brick's `test:` commit
- GitNexus index fresh (`npx gitnexus status`)
- `xcodebuild test` succeeds with exactly `M` tests

**The 6 phases per brick** (model + rough context budget):

| Phase | Agent | What it does |
|---|---|---|
| **A — plan** | opus, ~110K | brainstorm + lock a plan + GitNexus impact pre-check |
| **B — feat** | opus, ~70K | implement Swift, `xcodebuild build`, `feat:` commit |
| **C — test** | opus, ~70K | write isolation tests, `xcodebuild test`, `test:` commit |
| **D — docs** | sonnet, ~35K | update feature-log + mapped docs, `docs:` commit |
| **E — simplify** | sonnet ×3 parallel, ~110K | three lenses: Reuse, Quality, Efficiency |
| **F — review** | opus, ~100K | run `/review` once → write `brick-NN-review.md` |
| **Phase 7 (inline)** | orchestrator, ~5K | 5 `STATUS.md` edits + `npx gitnexus analyze` + 2 `chore:` commits |

**Halt conditions** (no auto-recovery): any phase reports `BLOCKED` or
`DONE_WITH_CONCERNS`; a verification mismatch (wrong commit count, wrong last-commit
subject, wrong test count, dirty tree); or the plan-review gate catches a §2/§3
violation.

**Stretch:** if all N land clean with zero must-fix items, it may continue to N+1.
Default N=4; empirical ceiling N=5.

**Guardrails (hard):** never push, never amend, never `--no-verify`/`--no-gpg-sign`,
no destructive ops without explicit authorization.

## Documentation & commit discipline

- **Every Swift change updates a mapped doc** (enforced by `check-docs-updated.sh`,
  see [`05-hooks.md`](05-hooks.md)). Architectural changes must record the *why*.
- **Conventional Commits** are mandatory (`feat:`/`fix:`/`refactor:`/`docs:`/`test:`/
  `chore:`); `git log --oneline` *is* the changelog. Committing is also the escape
  hatch that satisfies the doc/STATUS Stop hooks.

## How the pieces reinforce each other

```
SessionStart hook ──► injects STATUS.md  ──► Claude knows the current brick
CLAUDE.md rules    ──► how to build the brick (5 rules + sizing)
skill-reminder hook──► which skills to apply
/ship command      ──► runs the 6-phase loop autonomously
Stop hooks         ──► block turn-end until docs + STATUS catch up
remember + .remember/ ──► carries context across sessions (see 07)
```
