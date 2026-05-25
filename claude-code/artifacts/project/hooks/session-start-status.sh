#!/bin/bash
# SessionStart hook — injects current build status into Claude's session context.
#
# Reads docs/plans/STATUS.md (the live brick-by-brick build dashboard) and emits
# its contents via hookSpecificOutput.additionalContext so every session begins
# with current state visible — no reliance on the assistant proactively reading.
#
# Companion files:
#   docs/plans/STATUS.md       — the dashboard this hook surfaces
#   docs/plans/brick-NN-*.md   — per-brick plan files (Status header at top)
#   CLAUDE.md                  — instructs the read-this-first discipline
#
# If STATUS.md is absent, emits a graceful fallback so the hook never errors.
#
# Note: avoids heredocs inside command substitution because macOS ships bash 3.2,
# which has parser bugs with that pattern.

set -uo pipefail

PROJ="${CLAUDE_PROJECT_DIR:-$PWD}"
STATUS_FILE="${PROJ}/docs/plans/STATUS.md"

PREFIX="=== Remembry Build Status (live, from docs/plans/STATUS.md) ===

Project follows strict brick-by-brick waterfall. Read this status, then read the current brick plan in docs/plans/ before acting. Only plan or build the current brick — never work ahead.

---
"

SUFFIX="
---
=== End Build Status ==="

FALLBACK="=== Remembry Build Status ===

No docs/plans/STATUS.md found yet — project has not started a brick-by-brick build, or the status file was removed.

Recovery: read CLAUDE.md and docs/architecture-decisions.md for context, then re-establish the status file.
=== End Build Status ==="

if [[ -f "$STATUS_FILE" ]]; then
  STATUS_BODY=$(cat "$STATUS_FILE")
  OUTPUT="${PREFIX}${STATUS_BODY}${SUFFIX}"
else
  OUTPUT="$FALLBACK"
fi

# Emit JSON via jq for proper escaping of newlines and quotes.
jq -n --arg ctx "$OUTPUT" '{
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: $ctx
  }
}'
