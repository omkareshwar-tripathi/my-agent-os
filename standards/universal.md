# Universal Agent Instructions

This is the canonical instruction file for this project. Claude, Codex, Gemini, and other agents should follow this file unless a newer direct user instruction conflicts with it.

## Instruction Priority

1. Direct user instructions in the current conversation.
2. Project-specific instructions in this file and the local `docs/` directory.
3. Relevant local skills in `skills/`.
4. The agent runtime defaults.

When instructions conflict, use the higher-priority source and state the conflict briefly.

## Start Every Task

Before changing code:

1. Identify the requested outcome and the smallest verifiable success criteria.
2. Check `docs/INDEX.md` if it exists and read only the rows relevant to the task.
3. Read `docs/agent-workflow.md` when the task is about process, setup, handoff, migration, or agent behavior.
4. Check `docs/decision-log.md` for relevant prior decisions.
5. Check `docs/coding-standards.md` if it exists and read only relevant sections.
6. Check `skills/` for matching local process skills. Use the runtime's native skill tool if available; otherwise read the matching `skills/<name>/SKILL.md`.
7. State which docs and skills you used before making changes.

If the task is documentation-only or configuration-only, adapt the same process to those files.

## Skill Loading

Skills are portable Markdown folders. A skill applies when the user's request matches the `description` in `skills/<name>/SKILL.md`.

Runtime mapping:

- Claude Code: use the native Skill tool when available, otherwise read the local skill file.
- Codex: read local skill files or use any configured skill mechanism.
- Gemini CLI: use `activate_skill` when available, otherwise read the local skill file.
- Other agents: read the matching `SKILL.md` file directly.

Use only the relevant skill. Do not bulk-load every skill.

## Planning And Execution

Use a brief plan for multi-step work. Keep changes surgical and tied to the user's request.

For bugs or failing tests, investigate root cause before proposing a fix. Reproduce the issue when possible, inspect recent changes, compare against working examples, then make one minimal fix.

For features or behavior changes, prefer test-first work. Write the smallest meaningful failing test, confirm it fails for the expected reason, implement the minimal code, then verify the test passes.

For ambiguous or high-impact choices, write down the options, tradeoffs, recommendation, and decision.

## Coding Standards

Project docs override generic style. If no project-specific standard exists, use these defaults:

- Prefer simple, local changes over broad refactors.
- Keep one responsibility per file or component.
- Match existing naming, formatting, and architecture.
- Do not introduce new dependencies unless the task clearly needs them.
- Handle errors explicitly at the right boundary.
- Keep secrets out of code, docs, logs, and examples.
- Do not modify generated files unless the project docs say to.

## After Changing Code

Before reporting completion:

1. Run fresh verification that proves the requested outcome.
2. Read the full command output and check exit codes.
3. Update relevant docs with what changed and why when the change affects process, decisions, risks, or project behavior.
4. Update `docs/changelog.md` when it exists and the change is significant.
5. Report what changed, what verification ran, and any remaining risk.

Never claim work is complete without fresh verification evidence.

## Safety

Do not overwrite user work. If the repository has uncommitted changes you did not make, preserve them and work around them.

Do not run destructive commands unless the user explicitly asks for them.

Do not silently choose between ambiguous high-impact requirements. Ask a concise question or state the assumption before proceeding.
