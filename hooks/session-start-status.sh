#!/bin/bash
# SessionStart hook — inject STATUS.md so every Claude session starts oriented.
# Runs globally (wired in ~/.claude/settings.json), so it stays silent in any
# directory without a root STATUS.md.
set -uo pipefail

PROJ="${CLAUDE_PROJECT_DIR:-$PWD}"
F="$PROJ/STATUS.md"

# No root STATUS.md → not a project we track. Stay silent.
[ -f "$F" ] || exit 0

echo "=== Project status (live, from STATUS.md — keep it honest, update before ending a session) ==="
cat "$F"
echo "=== End status ==="
