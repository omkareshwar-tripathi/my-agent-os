#!/usr/bin/env bash
# Sync skill backups from their original sources.
# Reads each skills/*/SOURCE file. If it contains a GitHub URL, pulls latest.
# Usage: sync.sh [--dry-run]
set -euo pipefail

REPO_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
dry_run=0

[ "${1:-}" = "--dry-run" ] && dry_run=1

tmp_dir=$(mktemp -d)
trap 'rm -rf "$tmp_dir"' EXIT

synced=0
skipped=0
failed=0

for source_file in "$REPO_DIR"/skills/methods/*/SOURCE "$REPO_DIR"/skills/tools/*/SOURCE; do
  [ -f "$source_file" ] || continue
  skill_dir=$(dirname "$source_file")
  skill_name=$(basename "$skill_dir")
  url=$(cat "$source_file" | tr -d '[:space:]')

  if [ "$url" = "local" ]; then
    skipped=$((skipped + 1))
    continue
  fi

  printf 'syncing: %s ← %s\n' "$skill_name" "$url"

  if [ "$dry_run" -eq 1 ]; then
    synced=$((synced + 1))
    continue
  fi

  clone_dir="$tmp_dir/$skill_name"
  if git clone --depth 1 --quiet "$url" "$clone_dir" 2>/dev/null; then
    # Look for the skill content — try common locations
    found=0

    # Check if it's a single-skill repo (SKILL.md at root)
    if [ -f "$clone_dir/SKILL.md" ]; then
      cp "$clone_dir/SKILL.md" "$skill_dir/SKILL.md"
      [ -d "$clone_dir/references" ] && cp -r "$clone_dir/references" "$skill_dir/"
      [ -d "$clone_dir/reference" ] && cp -r "$clone_dir/reference" "$skill_dir/"
      found=1
    fi

    # Check if it has a skills/ subdirectory with our skill name
    if [ "$found" -eq 0 ] && [ -d "$clone_dir/skills/$skill_name" ]; then
      cp -r "$clone_dir/skills/$skill_name/"* "$skill_dir/"
      found=1
    fi

    # Check skills/ subdirectories for matching SKILL.md
    if [ "$found" -eq 0 ]; then
      for sub in "$clone_dir"/skills/*/SKILL.md; do
        [ -f "$sub" ] || continue
        sub_dir=$(dirname "$sub")
        sub_name=$(basename "$sub_dir")
        if [ "$sub_name" = "$skill_name" ]; then
          cp -r "$sub_dir/"* "$skill_dir/"
          found=1
          break
        fi
      done
    fi

    if [ "$found" -eq 1 ]; then
      synced=$((synced + 1))
      printf '  updated: %s\n' "$skill_name"
    else
      printf '  warning: could not find skill content in repo for %s\n' "$skill_name"
      failed=$((failed + 1))
    fi
  else
    printf '  error: failed to clone %s\n' "$url"
    failed=$((failed + 1))
  fi
done

printf '\ndone: %d synced, %d local (skipped), %d failed\n' "$synced" "$skipped" "$failed"
