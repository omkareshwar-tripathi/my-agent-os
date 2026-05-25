#!/bin/bash
# Stop hook — STATUS.md discipline enforcer.
#
# Fires when Claude finishes a turn. If any docs/plans/brick-*.md file's
# **Status:** header line changed in this turn but docs/plans/STATUS.md was
# NOT also updated, blocks the stop with a directive listing exactly what
# to update.
#
# Trigger condition:  git diff HEAD shows a Status-line change in any brick
#                     plan file (regex: ^[+-]\s*\*\*Status:\*\*).
# Pass condition:     STATUS.md also has uncommitted changes in this turn.
# Escape hatch:       commit the brick plan changes (Conventional Commits).
#
# Companion: .claude/hooks/session-start-status.sh surfaces STATUS.md at
# session start. This hook keeps it from going stale across turns.

set -uo pipefail

INPUT=$(cat)

# Loop guard — if responding to a prior block, allow stop.
if echo "$INPUT" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
    exit 0
fi

PROJ="${CLAUDE_PROJECT_DIR:-$PWD}"
[ -d "$PROJ/.git" ] || exit 0
cd "$PROJ" || exit 0

# Did any brick plan's Status header line change in this turn?
STATUS_CHANGES=$(git diff HEAD -- 'docs/plans/brick-*.md' 2>/dev/null \
    | grep -E '^[+-][[:space:]]*\*\*Status:\*\*' || true)
[ -z "$STATUS_CHANGES" ] && exit 0

# Did STATUS.md also change in this turn?
STATUS_DOC_CHANGED=$(git diff --name-only HEAD -- 'docs/plans/STATUS.md' 2>/dev/null)
[ -n "$STATUS_DOC_CHANGED" ] && exit 0

# Block with directive.
{
    echo "Stop blocked — a brick plan's Status header changed but docs/plans/STATUS.md was not updated."
    echo ""
    echo "Brick plan files with status changes:"
    git diff --name-only HEAD -- 'docs/plans/brick-*.md' 2>/dev/null | sed 's/^/  /'
    echo ""
    echo "Update docs/plans/STATUS.md before finishing this turn:"
    echo "  - Move completed bricks to the Done section with completion date."
    echo "  - Update 'Current Brick' to reflect the in-progress brick."
    echo "  - Refresh the **Last updated** timestamp."
    echo ""
    echo "Escape hatch: commit your brick plan changes (Conventional Commits)."
    echo "  Example: 'docs(plans): mark brick-01 done'"
} >&2

exit 2
