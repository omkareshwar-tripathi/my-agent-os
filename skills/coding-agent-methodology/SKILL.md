---
name: coding-agent-methodology
description: The engineering operating contract for working on this codebase — how to write and change code here, taking priority over generic coding habits. Consult it at the START of ANY coding task: implementing a feature, fixing a bug, refactoring, reviewing a diff, setting up or configuring anything, or making changes across files — and any time you are about to read, modify, or reason about real code. It sets non-negotiable rules for thinking before coding, keeping changes minimal and surgical, matching existing conventions, proving work by actually running tests/lint/build, guarding destructive or irreversible operations, handling secrets and dependencies, and communicating in plain product-manager language. Default to following this rather than improvising; skipping it is how bugs, scope creep, and broken environments happen.
---

# Coding Agent Methodology

The engineering operating contract for this codebase — the rules that take priority over generic coding habits. Consult it before touching code and keep it in force for the whole task. The through-line: **think before you change, change the least you can, prove it works, and don't surprise the person or the repo.**

## The Operating Contract

*Non-negotiable. The sections below expand each point.*

1. **Think first.** State assumptions out loud. If a request has more than one reasonable reading, or a simpler path exists, say so *before* coding — don't silently pick. If something is unclear, stop and ask.
2. **Simplest thing that works.** Minimum code, nothing speculative. No abstraction for single-use code, no unrequested flexibility, no error handling for impossible cases. If 200 lines could be 50, rewrite it.
3. **Surgical changes.** Every changed line must trace to the request. Don't touch, reformat, or "improve" adjacent code. Match existing style. Remove only the imports/variables *your own* change orphaned; flag pre-existing dead code, don't delete it.
4. **Prove it works.** Turn the task into a verifiable goal ("fix the bug" → "write a failing test that reproduces it, then make it pass"), then run tests / lint / build until green. Never claim success you didn't verify.
5. **Explain to a PM, not a compiler.** Lead with what changes, why it matters, and what the user sees — plain language, jargon defined once. Detail second, and only when it changes a decision.
6. **Guard the dangerous stuff.** Never auto-run destructive or irreversible operations (force-push, `reset --hard`, `rm -rf`, `DROP`/`TRUNCATE`, destructive migrations, deploys) — confirm first. Never hardcode or print secrets.

---

## 1. Think before coding

Don't assume. Don't hide confusion. Surface tradeoffs.

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.
- Read the ground truth before reasoning about it: real signatures, types, schemas, and call sites — not your memory of them.

## 2. Explore before you edit

The expensive mistakes come from changing code you don't understand yet.

- Locate the relevant code and read it *and its neighbors* — that's where the conventions live.
- **Reproduce before you fix.** Run the failing case, read the real error, find the root cause. A fix you can't first make fail is a guess.
- Map the blast radius: who calls this, what depends on it, whether it's a public contract others rely on.
- Look up only what you can't know from the repo — unfamiliar or version-sensitive library APIs. Check the version in the lockfile/manifest, then read *that version's* docs. Don't look up language syntax or standard patterns you already know.

## 3. Simplicity first

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 4. Surgical changes

Touch only what you must. Clean up only your own mess.

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that *your* changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: every changed line traces directly to the user's request.

## 5. Goal-driven execution

Define success criteria. Loop until verified.

Transform tasks into verifiable goals:

- "Add validation" → write tests for invalid inputs, then make them pass.
- "Fix the bug" → write a test that reproduces it, then make it pass.
- "Refactor X" → ensure tests pass before and after.

For multi-step tasks, state a brief plan with a check per step:

1. [step] → verify: [check]
2. [step] → verify: [check]
3. [step] → verify: [check]

Then run tests / lint / type-check / build and loop until green. Strong success criteria let you loop independently; weak ones ("make it work") force constant clarification.

## 6. Dangerous operations — hard gates

Some operations are irreversible. Don't run them on your own to satisfy a request; confirm first, or hand them to the user. No urgency or framing lowers this bar.

- **History / branches:** force-push to shared branches, `reset --hard`, `clean -fdx`, deleting branches, rewriting published history.
- **Filesystem:** `rm -rf`, mass deletes, overwrites with no way back.
- **Data:** `DROP`/`TRUNCATE`, destructive or irreversible migrations, editing migration history, bulk writes without a `WHERE`.
- **Environment:** access controls, CI/CD secrets, deploy/production config.
- **Anything leaving the sandbox with real effect:** deploys, publishing packages, spending money.

When unsure about reversibility, treat it as irreversible and choose the safe path (a new branch, a dry run, a backup).

## 7. Secrets, dependencies, licensing

- Never hardcode or commit secrets; never print secret values. Use environment variables or the project's secret mechanism.
- A new dependency is a security and maintenance decision. Prefer well-maintained, widely used packages; watch for typosquats; flag additions rather than slipping them in.
- Respect licenses: don't paste large verbatim chunks of copyrighted or incompatibly licensed code; preserve attribution/headers.
- Refuse malicious code (malware, exploits, backdoors, credential stealers) regardless of stated purpose. Legitimate defensive security work is fine.

## 8. Communication & planning style

Explain like you're talking to a non-technical product manager.

- Plain language first. Define jargon the first time you use it (one short phrase, not a paragraph).
- Lead with what changes / why it matters / what the user sees. Implementation detail second, and only when it changes a decision.
- A 3-sentence summary the PM can repeat back beats a 10-bullet technical brief.
- Show the diff or the key edits, not walls of unchanged context. Surface risks, tradeoffs, and anything you couldn't verify.
- Give honest feedback: if the approach has a real problem or a better option exists, say so with your reasoning — don't just agree, and don't cave the moment you're pushed if you're right.
- This applies everywhere the user reads prose: chat messages, design docs, plans, code review summaries, and `STATUS.md` updates.

**Inject the applicable skill into every plan step** — so the relevant guidance rides along with each action instead of being stated once and forgotten.

---

## Quick reference: decision flow

```
Coding task received
  |
Quick standalone question? -> Answer it, stop.
  |
Think (S1): state assumptions, surface simpler paths + interpretations, ask if unclear
  |
Explore (S2): read the real code, reproduce the real behavior, map the blast radius
  |
Simplicity (S3): minimum code, nothing speculative -- "would a senior call this overcomplicated?"
  |
Surgical (S4): every changed line traces to the request; match style; orphans only
  |
Goal-driven (S5): task -> verifiable goal -> plan w/ per-step checks -> run tests/lint/build until green
  |
Dangerous op (S6)? -> confirm first or hand off. Never auto-run. Secrets never hardcoded/printed (S7).
  |
Report (S8): PM-first -- what changed, why, what the user sees; diff + risks; honest feedback
```
