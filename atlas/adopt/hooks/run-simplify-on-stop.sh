#!/bin/bash
# Stop hook — advisory simplify reminder (NON-BLOCKING), language-agnostic.
# If source files have uncommitted changes at turn end, shows a nudge asking
# whether to run /simplify. The user decides; nothing is enforced.
# Installed by the agent-OS adopt script (my-agent-os/atlas/adopt.js).

INPUT=$(cat)
echo "$INPUT" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true' && exit 0

PROJ="${CLAUDE_PROJECT_DIR:-$PWD}"
[ -d "$PROJ/.git" ] || exit 0
cd "$PROJ" || exit 0
command -v jq >/dev/null 2>&1 || exit 0

# Source = anything changed that isn't docs/config prose.
CHANGED=$(git diff --name-only HEAD 2>/dev/null | grep -Ev '\.(md|txt|json|ya?ml|lock)$' || true)
[ -z "$CHANGED" ] && exit 0

COUNT=$(printf '%s\n' "$CHANGED" | wc -l | tr -d ' ')
FILES=$(printf '%s\n' "$CHANGED" | head -8 | sed 's/^/  /')

jq -n --arg msg "Source changed this turn (${COUNT} file(s) uncommitted):

${FILES}

Run /simplify before continuing? Reply '/simplify' to invoke it; anything else skips — advisory only." '{ systemMessage: $msg }'
exit 0
