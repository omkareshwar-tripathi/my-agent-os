#!/usr/bin/env bash
# Update all registered projects.
# Usage: update-all.sh [--force]
set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/_lib.sh"

force=""
[ "${1:-}" = "--force" ] && force="--force"

installed_file="$AGENT_OS_DIR/.installed-projects"
if [ ! -f "$installed_file" ]; then
  printf 'No projects registered yet.\n'
  exit 0
fi

updated=0
removed=0
failed=0

while IFS= read -r project_dir; do
  [ -z "$project_dir" ] && continue
  if [ ! -d "$project_dir" ]; then
    printf 'removed: %s (directory no longer exists)\n' "$project_dir"
    removed=$((removed + 1))
    continue
  fi
  if "$AGENT_OS_DIR/bin/update.sh" "$project_dir" $force; then
    updated=$((updated + 1))
  else
    printf 'failed: %s\n' "$project_dir" >&2
    failed=$((failed + 1))
  fi
done < "$installed_file"

# Clean removed entries
if [ "$removed" -gt 0 ]; then
  tmp=$(mktemp)
  while IFS= read -r project_dir; do
    [ -z "$project_dir" ] && continue
    [ -d "$project_dir" ] && echo "$project_dir"
  done < "$installed_file" > "$tmp"
  mv "$tmp" "$installed_file"
fi

printf '\n=== Update summary ===\n'
printf 'Updated: %d | Removed: %d | Failed: %d\n' "$updated" "$removed" "$failed"
