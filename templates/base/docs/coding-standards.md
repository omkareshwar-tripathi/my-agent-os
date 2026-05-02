# Coding Discipline

Stack-specific standards belong in the target project. This file only defines reusable coding discipline.

## 1. Fit The Existing Project

- Match existing style, naming, formatting, and architecture.
- Read nearby code before inventing a pattern.
- Add new conventions only when the existing project has no relevant pattern.

## 2. Keep Changes Surgical

- Touch only files needed for the request.
- Avoid unrelated refactors, formatting churn, and opportunistic cleanup.
- Remove only dead code introduced by your own change unless explicitly asked.

## 3. Prefer Simple Boundaries

- Keep units small and understandable.
- Make dependencies explicit.
- Do not add abstractions for single-use code.
- Document major boundary decisions in `docs/decision-log.md`.

## 4. Test Behavior

- Add or update tests for behavior changes and bug fixes when the project has a test setup.
- For bugs, prefer a regression test that fails before the fix.
- If automated tests are not practical, document the manual verification path.

## 5. Handle Errors At Boundaries

Handle errors at boundaries where the user, caller, or log can act on them. Do not hide failures with empty catches or broad fallbacks.

## 6. Keep Secrets Out

Do not commit secrets. Avoid logging credentials, tokens, personal data, or sensitive payloads.

## 7. Verify Before Completion

Run fresh verification before claiming work is complete. Read the output and report the actual result.
