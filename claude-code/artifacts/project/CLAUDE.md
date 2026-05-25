# iOS App

---

## Session Start — Read This First

This project follows a strict **brick-by-brick waterfall** build. Before any planning or coding work, read **`docs/plans/STATUS.md`** to know which brick is current. Only plan or build the current brick — never work ahead. A SessionStart hook (`.claude/hooks/session-start-status.sh`) injects this status automatically; treat its output as authoritative.

Per-brick plans live in `docs/plans/brick-NN-*.md` (Status header at top). Updating `STATUS.md` is part of declaring any brick "done."

---

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 2a. Brick Sizing (added 2026-05-22)

**Bricks may be slightly larger than the original 2-source-file shape, AND peer-mirror bricks must be bundled.**

The original brick discipline aimed for the tightest possible diff (often 2 source files / 10–35 LOC / 3–5 tests). After 50+ bricks of practice, two refinements:

- **Soft ceiling per brick:** up to **~4 source files / ~80 source LOC / ~8 tests**. If a candidate naturally lands within that box, ship it as one brick — don't artificially split for the sake of smallness.
- **Hard ceiling:** **~150 source LOC or >5 source files.** Beyond that, the 6-phase sub-agent context budget starts breaking (Brick-46 lesson). Split.
- **Peer-mirror bundling is REQUIRED, not optional.** When a candidate is a byte-identical algorithm copy on a peer VM (e.g., `MemoryTimelineViewModel` ↔ `MemoryTrashViewModel`), ship BOTH surfaces in ONE brick. Examples of past peer-mirror pairs that should have been one brick each: Bricks 43↔51 (caption-filter), 42↔52 (swipe-delete/purge), 54↔55 (search-match highlight). Phase A must check for peer mirrors during candidate evaluation and scope the brick to cover both VMs when found.

This refinement does NOT change: TDD discipline, /simplify ×3 + /review APPROVE gates, surgical scope, Conventional Commits, doc-update map, or the `final` anti-spy precedent.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

### 5. Communication & Planning Style

**Explain like you're talking to a non-technical product manager.**

- Plain language first. Define jargon the first time you use it (one short phrase, not a paragraph).
- Lead with **what changes / why it matters / what the user sees**. Implementation detail second, and only when it changes a decision.
- A 3-sentence summary the PM can repeat back beats a 10-bullet technical brief.
- This applies to chat messages, design docs, brick plans, /simplify summaries, and STATUS.md updates — anywhere the user reads prose.

**Inject the applicable skill into every plan step.**

When writing a brick plan, a /simplify follow-up, or any multi-step task list, each step must name the skill(s) that apply on a dedicated `Skill:` line — e.g. `Skill: core-data-expert/references/saving.md`, `Skill: swift-testing-pro`, `Skill: swift-concurrency-pro`. If no skill applies, write `Skill: none` so the absence is intentional, not an oversight. Skills live in `.claude/skills/` (project) and `~/.claude/skills/` (user); the up-to-date list is surfaced by the UserPromptSubmit hook.

---

## Documentation & Commits

This project keeps reference docs in `docs/` and uses git history for the timeline.

**On every turn that changes Swift code, update the relevant doc(s):**

| If you changed... | Update |
|---|---|
| Core Data / persistence / repositories | `docs/data-models.md` |
| Design tokens / components | `docs/design-system.md` |
| External services / APIs / network clients | `docs/api-services.md` |
| Anything in `Features/` | `docs/feature-log.md` |
| Architecture-affecting code (Router, Container, PersistenceController, Package.swift, entitlements) | `docs/architecture-decisions.md` — record the **why**, not just the what |
| Dependencies (SPM) | `docs/dependencies.md` |

A Stop hook enforces this — it blocks turn-end if Swift changed but no docs did. The hook prints which doc(s) to update based on which paths changed.

**Commits use Conventional Commits.** `git log --oneline` is the changelog. Prefixes:
`feat:` `fix:` `refactor:` `docs:` `test:` `chore:` — with optional scope, e.g. `feat(camera): add timer mode`.

To skip the doc-update check on a trivial change, commit your Swift changes — that silences the hook.

# GitNexus — Code Intelligence

This project is indexed by GitNexus. Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/<repo>/context` | Codebase overview, check index freshness |
| `gitnexus://repo/<repo>/clusters` | All functional areas |
| `gitnexus://repo/<repo>/processes` | All execution flows |
| `gitnexus://repo/<repo>/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |
