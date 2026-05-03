# Agent Workflow

This document describes the reusable workflow agents should follow in this project.

## Before Work

1. Restate the requested outcome in concrete terms.
2. Identify the verification command or manual check that will prove the outcome.
3. Read `docs/INDEX.md` and only the relevant routed docs.
4. Load the relevant skill from `skills/` through the native skill tool or by reading `SKILL.md`.
5. Check for uncommitted user changes before editing.

## During Work

- Keep changes small and directly tied to the request.
- Prefer existing project patterns.
- Add tests before behavior changes when practical.
- For bugs, find root cause before changing code.
- For significant choices, compare options and update `docs/decision-log.md`.
- Do not rewrite unrelated code.

## After Work

1. Run fresh verification.
2. Update relevant process, decision, gotcha, or changelog docs with what changed and why.
3. Add a short `docs/changelog.md` entry for significant changes.
4. Report changed files, verification, and any remaining risk.
