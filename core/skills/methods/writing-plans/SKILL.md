---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code
---

## Overview
Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste. Document everything they need to know: which files to touch for each task, code, testing, docs they might need to check, how to test it. Give them the whole plan as bite-sized tasks. DRY. YAGNI. TDD. Frequent commits.

Assume they are a skilled developer, but know almost nothing about our toolset or problem domain. Assume they don't know good test design very well.

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."

## Scope Check
If the spec covers multiple independent subsystems, it should have been broken into sub-project specs during brainstorming. If it wasn't, suggest breaking this into separate plans — one per subsystem. Each plan should produce working, testable software on its own.

## File Structure
Before defining tasks, map out which files will be created or modified and what each one is responsible for. This is where decomposition decisions get locked in.

- Design units with clear boundaries and well-defined interfaces. Each file should have one clear responsibility.
- Prefer smaller, focused files over large ones that do too much.
- Files that change together should live together. Split by responsibility, not by technical layer.
- In existing codebases, follow established patterns.

This structure informs the task decomposition. Each task should produce self-contained changes that make sense independently.

## Bite-Sized Task Granularity
**Each step is one action (2-5 minutes):**
- "Write the failing test" - step
- "Run it to make sure it fails" - step
- "Implement the minimal code to make the test pass" - step
- "Run the tests and make sure they pass" - step
- "Commit" - step

## Plan Document Header
**Every plan MUST start with this header:**

```markdown
# [Feature Name] Implementation Plan

**Goal:** [One sentence describing what this builds]

**Approach:** [2-3 sentences about the implementation strategy and boundaries]

---
```

## Task Structure
````markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/new-file`
- Modify: `exact/path/to/existing-file:123-145`
- Test: `exact/path/to/test-file`

- [ ] **Step 1: Write the failing test**

```text
Test: specific behavior name
Given: the minimal setup
When: the behavior is exercised
Then: the expected observable result occurs
```

- [ ] **Step 2: Run test to verify it fails**

Run: the exact project test command recorded in the target project's docs or package/build configuration
Expected: FAIL with the missing behavior or symbol named by the test

- [ ] **Step 3: Write minimal implementation**

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Commit**
````

## No Placeholders
Every step must contain the actual content an engineer needs. These are **plan failures** — never write them:
- "TBD", "TODO", "implement later", "fill in details"
- "Add appropriate error handling" / "add validation" / "handle edge cases"
- "Write tests for the above" (without actual test code)
- "Similar to Task N" (repeat the code)
- Steps that describe what to do without showing how

## Self-Review
After writing the complete plan, look at the spec with fresh eyes and check the plan against it:

1. **Spec coverage:** Can you point to a task that implements each requirement?
2. **Placeholder scan:** Search for red flags from the "No Placeholders" section.
3. **Type consistency:** Do types and method signatures match across tasks?

If you find issues, fix them inline.

## Remember
- Exact file paths always
- Complete code in every step
- Exact commands with expected output
- DRY, YAGNI, TDD, frequent commits
