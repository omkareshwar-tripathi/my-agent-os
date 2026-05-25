#!/bin/bash
# Stop hook — file-aware doc-update guardrail.
#
# Fires when Claude finishes a turn. If Swift files have uncommitted changes
# but no relevant doc was touched, blocks the stop and tells Claude exactly
# which doc(s) to update — based on which paths changed.
#
# Escape hatch: commit your Swift changes (use Conventional Commits — that
# becomes the changelog entry). Committed changes silence this check.

INPUT=$(cat)

# Loop guard — if we're already responding to a prior stop-hook block, allow stop.
if echo "$INPUT" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
    exit 0
fi

# Resolve project root.
PROJ="${CLAUDE_PROJECT_DIR:-$PWD}"
if [ -d "$PROJ/.git" ]; then
    REPO="$PROJ"
else
    exit 0
fi

cd "$REPO" || exit 0

SWIFT_CHANGED=$(git diff --name-only HEAD -- '*.swift' 2>/dev/null)
[ -z "$SWIFT_CHANGED" ] && exit 0

# Did Claude touch any reference doc (excluding changelog.md, which is removed
# in favor of git history) or CLAUDE.md itself in the same turn?
DOCS_CHANGED=$(git diff --name-only HEAD -- 'docs/*.md' 'CLAUDE.md' 2>/dev/null \
    | grep -v -E '(^|/)changelog\.md$')
[ -n "$DOCS_CHANGED" ] && exit 0

# ---- Map changed paths to target docs ----
TARGETS=()
add_target() {
    local doc="$1" reason="$2"
    for t in "${TARGETS[@]}"; do
        [[ "$t" == "$doc"* ]] && return
    done
    TARGETS+=("$doc — $reason")
}

while IFS= read -r f; do
    [ -z "$f" ] && continue

    case "$f" in
        Core/Persistence/*|*Repository*.swift|*+CoreData*.swift|*.xcdatamodeld/*|*.xcdatamodeld)
            add_target "docs/data-models.md" "model/schema change — describe entities, fields, relationships, and any CloudKit constraints"
            ;;
    esac
    case "$f" in
        Core/DesignSystem/*|*Components/*|*Theme*.swift|*Typography*.swift|*Colors*.swift|*Spacing*.swift)
            add_target "docs/design-system.md" "design tokens or component change — record the new token/component and where it's consumed"
            ;;
    esac
    case "$f" in
        Core/Services/*|*Service*.swift|*API*.swift|*Client*.swift)
            add_target "docs/api-services.md" "external service/API change — record the service, purpose, and chosen provider"
            ;;
    esac
    case "$f" in
        Features/*)
            add_target "docs/feature-log.md" "feature added/modified — log the feature and link the source files"
            ;;
    esac
    case "$f" in
        */Container.swift|Container.swift|*/AppRouter.swift|AppRouter.swift|*/PersistenceController.swift|PersistenceController.swift|App/*.swift|*App.swift|Info.plist|*.entitlements)
            add_target "docs/architecture-decisions.md" "**architectural touch** — record the decision, what was rejected, and the tradeoff accepted (this is the WHY)"
            ;;
    esac
    case "$f" in
        Package.swift|Package.resolved)
            add_target "docs/dependencies.md" "dependency added/removed — document the package, version, and why it's needed"
            add_target "docs/architecture-decisions.md" "**architectural touch** — adding a dependency is an architectural decision"
            ;;
    esac
done <<< "$SWIFT_CHANGED"

# Fallback: if nothing matched, default to feature-log.md so Claude logs SOMETHING.
if [ ${#TARGETS[@]} -eq 0 ]; then
    add_target "docs/feature-log.md" "general code change — log what was changed and why"
fi

# ---- Block stop with a directive message ----
{
    echo "Stop blocked — documentation hasn't caught up with your code changes."
    echo ""
    echo "Swift files with uncommitted changes:"
    echo "$SWIFT_CHANGED" | head -20 | sed 's/^/  /'
    echo ""
    echo "Update the following doc(s) before finishing this turn:"
    for t in "${TARGETS[@]}"; do
        echo "  → $t"
    done
    echo ""
    echo "For non-trivial design decisions, the entry MUST include the WHY:"
    echo "  - What was decided."
    echo "  - What alternatives you considered and rejected."
    echo "  - What tradeoff you accepted."
    echo "Mechanical changes (renames, formatting) only need a one-line note."
    echo ""
    echo "Escape hatch: commit your Swift changes with a Conventional Commits message"
    echo "(e.g. 'feat(camera): add timer mode', 'fix(persistence): ...', 'refactor: ...')."
    echo "Committed changes are the changelog — git log is the source of truth."
} >&2

exit 2
