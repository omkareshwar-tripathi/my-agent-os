#!/bin/bash
# Stop hook — advisory simplify reminder (NON-BLOCKING).
#
# Fires when Claude finishes a turn. If Swift files have uncommitted changes,
# displays a non-blocking notification asking the user whether to run the
# simplify skill. The user decides in their next turn — reply with something
# like "run simplify" or "/simplify" to invoke it; reply anything else to skip.
#
# Previous behavior (until 2026-05-10): blocked stop until simplify ran.
# Changed to advisory at user request — they want to control when simplify
# runs rather than be force-blocked every turn.
#
# Discipline note: simplify is still important for code quality. The advisory
# is meant to remind, not to enforce. If you find code quality slipping, you
# can revert this hook to its blocking form (`exit 2` + stderr message).

INPUT=$(cat)

# Loop guard preserved (harmless even though we no longer block).
if echo "$INPUT" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
    exit 0
fi

PROJ="${CLAUDE_PROJECT_DIR:-$PWD}"
[ -d "$PROJ/.git" ] || exit 0
cd "$PROJ" || exit 0

SWIFT_CHANGED=$(git diff --name-only HEAD -- '*.swift' 2>/dev/null)
[ -z "$SWIFT_CHANGED" ] && exit 0

COUNT=$(printf '%s\n' "$SWIFT_CHANGED" | wc -l | tr -d ' ')
FILES_LIST=$(printf '%s\n' "$SWIFT_CHANGED" | head -10 | sed 's/^/  /')

MESSAGE_BODY="Swift code changed this turn (${COUNT} file(s) with uncommitted changes):

${FILES_LIST}

Run simplify before continuing? Reply 'run simplify' (or '/simplify') to invoke the skill. Reply anything else to skip — this is advisory only."

# Emit a systemMessage so the user sees the prompt; exit 0 to allow stop.
jq -n --arg msg "$MESSAGE_BODY" '{ systemMessage: $msg }'

exit 0
