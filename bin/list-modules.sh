#!/usr/bin/env bash
# List available modules, stacks, and profiles.
# Usage: list-modules.sh [--modules | --stacks | --profiles | --all]
set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/_lib.sh"

show_modules=0
show_stacks=0
show_profiles=0

case "${1:-}" in
  --modules)  show_modules=1 ;;
  --stacks)   show_stacks=1 ;;
  --profiles) show_profiles=1 ;;
  --all|"")   show_modules=1; show_stacks=1; show_profiles=1 ;;
  *)          printf 'Usage: list-modules.sh [--modules|--stacks|--profiles|--all]\n' >&2; exit 1 ;;
esac

if [ "$show_modules" -eq 1 ]; then
  printf '=== Function Modules ===\n\n'
  printf '%-16s %s\n' "NAME" "DESCRIPTION"
  printf '%-16s %s\n' "----" "-----------"
  for dir in "$AGENT_OS_DIR"/modules/*/; do
    [ -d "$dir" ] || continue
    yaml="$dir/module.yaml"
    [ -f "$yaml" ] || continue
    name=$(_parse_yaml_value "name" "$yaml")
    desc=$(_parse_yaml_value "description" "$yaml")
    printf '%-16s %s\n' "$name" "$desc"
  done
  printf '\n'
fi

if [ "$show_stacks" -eq 1 ]; then
  printf '=== Stack Modules ===\n\n'
  printf '%-16s %s\n' "NAME" "DESCRIPTION"
  printf '%-16s %s\n' "----" "-----------"
  for dir in "$AGENT_OS_DIR"/stacks/*/; do
    [ -d "$dir" ] || continue
    yaml="$dir/module.yaml"
    [ -f "$yaml" ] || continue
    name=$(_parse_yaml_value "name" "$yaml")
    desc=$(_parse_yaml_value "description" "$yaml")
    printf '%-16s %s\n' "$name" "$desc"
  done
  printf '\n'
fi

if [ "$show_profiles" -eq 1 ]; then
  printf '=== Profiles ===\n\n'
  printf '%-16s %-40s %s\n' "NAME" "DESCRIPTION" "MODULES"
  printf '%-16s %-40s %s\n' "----" "-----------" "-------"
  for file in "$AGENT_OS_DIR"/profiles/*.yaml; do
    [ -f "$file" ] || continue
    name=$(_parse_yaml_value "name" "$file")
    desc=$(_parse_yaml_value "description" "$file")
    mods=$(_parse_yaml_list "modules" "$file" | tr '\n' ',' | sed 's/,$//')
    stks=$(_parse_yaml_list "stacks" "$file" | tr '\n' ',' | sed 's/,$//')
    all_mods="core,$mods"
    [ -n "$stks" ] && all_mods="$all_mods,$stks"
    printf '%-16s %-40s %s\n' "$name" "$desc" "$all_mods"
  done
  printf '\n'
fi
