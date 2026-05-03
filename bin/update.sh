#!/usr/bin/env bash
# Update a single project's my-agent-os installation.
# Usage: update.sh /path/to/project [--force]
set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/_lib.sh"

target_dir=""
force=0

for arg in "$@"; do
  case "$arg" in
    --force) force=1 ;;
    -*) printf 'Unknown option: %s\n' "$arg" >&2; exit 2 ;;
    *) target_dir="$(cd -- "$arg" && pwd)" ;;
  esac
done

if [ -z "$target_dir" ]; then
  printf 'Usage: update.sh /path/to/project [--force]\n' >&2
  exit 1
fi

manifest="$target_dir/.agent-os.yaml"
if [ ! -f "$manifest" ]; then
  printf 'error: no .agent-os.yaml in %s\n' "$target_dir" >&2
  exit 1
fi

# Check version
stored_version=$(_parse_yaml_value "version" "$manifest")
current_version=$(git -C "$AGENT_OS_DIR" rev-parse --short HEAD 2>/dev/null || echo "unknown")

if [ "$stored_version" = "$current_version" ] && [ "$force" -eq 0 ]; then
  printf 'up to date: %s (version %s)\n' "$target_dir" "$current_version"
  exit 0
fi

printf 'updating: %s (%s → %s)\n' "$target_dir" "$stored_version" "$current_version"

# Re-resolve modules (profile definition may have changed)
profile=$(_parse_yaml_value "profile" "$manifest")
[ "$profile" = "null" ] && profile=""

non_core=()
while IFS= read -r _m; do
  [ -z "$_m" ] && continue
  [ "$_m" != "core" ] && non_core+=("$_m")
done < <(_read_manifest_modules "$manifest")

modules=()
while IFS= read -r _m; do
  [ -n "$_m" ] && modules+=("$_m")
done < <(_resolve_modules "$profile" "${non_core[@]+"${non_core[@]}"}")

# Update manifest
_write_manifest "$target_dir" "$profile" "${modules[@]}"

# Recompose
"$AGENT_OS_DIR/bin/compose.sh" "$target_dir"

# Update docs
for mod in "${modules[@]}"; do
  mod_dir=$(_find_module_dir "$mod") || continue
  yaml="$mod_dir/module.yaml"
  [ -f "$yaml" ] || continue
  while IFS= read -r doc_path; do
    [ -z "$doc_path" ] && continue
    local_src="$mod_dir/$doc_path"
    [ -f "$local_src" ] || continue
    doc_name=$(basename "$doc_path")
    _install_doc "$local_src" "$target_dir/docs/$doc_name" "$force"
  done < <(_parse_yaml_list "docs" "$yaml")
done

# Update skill symlinks
expected_targets=()
for mod in "${modules[@]}"; do
  mod_dir=$(_find_module_dir "$mod") || continue
  for category in methods tools; do
    skill_src="$mod_dir/skills/$category"
    [ -d "$skill_src" ] || continue
    for skill_dir in "$skill_src"/*/; do
      [ -d "$skill_dir" ] || continue
      expected_targets+=("${skill_dir%/}")
    done
  done
  _install_skill_symlinks "$mod_dir" "$target_dir" "methods"
  _install_skill_symlinks "$mod_dir" "$target_dir" "tools"
done
_clean_stale_symlinks "$target_dir" "${expected_targets[@]+"${expected_targets[@]}"}"

# Re-merge settings
mod_dirs_with_settings=()
for mod in "${modules[@]}"; do
  mod_dir=$(_find_module_dir "$mod") || continue
  if [ -f "$mod_dir/settings/permissions.json" ] || [ -f "$mod_dir/settings/hooks.json" ]; then
    mod_dirs_with_settings+=("$mod_dir")
  fi
done
if [ ${#mod_dirs_with_settings[@]} -gt 0 ]; then
  _merge_settings "$target_dir/.claude/settings.json" "${mod_dirs_with_settings[@]}"
fi

printf 'updated: %s → version %s\n' "$target_dir" "$current_version"
