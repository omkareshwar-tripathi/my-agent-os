---
name: decision-records
description: Use when a task requires choosing between approaches, documenting architectural/process tradeoffs, resolving ambiguity, or updating a project decision log.
---

# Decision Records

Use this skill to make choices explicit and reusable.

## Workflow

1. State the decision that needs to be made.
2. List 2-4 realistic options.
3. Compare tradeoffs that matter now: complexity, reversibility, risk, testability, maintenance, user impact.
4. Recommend one option with a concrete reason.
5. If the user approves or the choice is low-risk and local, record it in `docs/decision-log.md`.

## Decision Quality Bar

A good decision record answers:

- What problem was being solved?
- What options were considered?
- Why was this option chosen?
- What must future agents preserve?
- When should the decision be revisited?

## Avoid

- Recording obvious implementation details.
- Writing vague reasons like "best practice" without context.
- Hiding uncertainty.
- Making high-impact irreversible decisions without user approval.
