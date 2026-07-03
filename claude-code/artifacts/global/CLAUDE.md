# graphify
- **graphify** (`~/.claude/skills/graphify/SKILL.md`) - any input to knowledge graph. Trigger: `/graphify`
When the user types `/graphify`, invoke the Skill tool with `skill: "graphify"` before doing anything else.

# Engineering discipline (applies in every project)

## 1. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 2. Surgical Changes

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

## 3. Goal-Driven Execution

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

## 4. Communication & Planning Style

**Explain like you're talking to a non-technical product manager.**

- Plain language first. Define jargon the first time you use it (one short phrase, not a paragraph).
- Lead with **what changes / why it matters / what the user sees**. Implementation detail second, and only when it changes a decision.
- A 3-sentence summary the PM can repeat back beats a 10-bullet technical brief.
- This applies to chat messages, design docs, plans, /simplify summaries, and STATUS.md updates — anywhere the user reads prose.

**Inject the applicable skill into every plan step.**

When writing a plan or any multi-step task list, each step must name the skill(s) that apply on a dedicated `Skill:` line — e.g. `Skill: ui-design-system`, `Skill: nextjs-app-router-patterns`. If no skill applies, write `Skill: none` so the absence is intentional, not an oversight. Skills live in `.claude/skills/` (project) and `~/.claude/skills/` (user); the up-to-date list is surfaced by the UserPromptSubmit hook.
