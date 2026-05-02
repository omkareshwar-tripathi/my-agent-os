#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  install.sh [target-project] [--force] [--skip-skills]

Options:
  --force          Overwrite existing files
  --skip-skills    Do not install templates/base/skills
USAGE
}

repo_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
target=""
force=0
skip_skills=0

install_file() {
  local src="$1"
  local dest="$2"
  local rel="${dest#$target_dir/}"
  mkdir -p "$(dirname -- "$dest")"

  if [ -e "$dest" ] && ! cmp -s "$src" "$dest"; then
    if [ "$force" -eq 1 ]; then
      cp "$src" "$dest"
      printf '%s\n' "updated: $rel"
    else
      cp "$src" "$dest.agent-workflow.new"
      printf '%s\n' "conflict: $rel exists; wrote $rel.agent-workflow.new"
    fi
  elif [ ! -e "$dest" ]; then
    cp "$src" "$dest"
    printf '%s\n' "created: $rel"
  else
    printf '%s\n' "unchanged: $rel"
  fi
}

install_tree() {
  local src_dir="$1"
  local dest_dir="$2"
  local label="$3"
  mkdir -p "$dest_dir"
  if [ "$force" -eq 1 ]; then
    rsync -a "$src_dir/" "$dest_dir/"
  else
    rsync -a --ignore-existing "$src_dir/" "$dest_dir/"
  fi
  printf '%s\n' "installed: $label"
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --force)
      force=1
      ;;
    --skip-skills)
      skip_skills=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    -*)
      printf '%s\n' "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
    *)
      if [ -n "$target" ]; then
        printf '%s\n' "Only one target project path is supported." >&2
        usage >&2
        exit 2
      fi
      target="$1"
      ;;
  esac
  shift
done

if [ -z "$target" ]; then
  target="."
fi

if [ ! -d "$target" ]; then
  printf '%s\n' "Target project directory does not exist: $target" >&2
  exit 1
fi

target_dir="$(cd -- "$target" && pwd)"
base_dir="$repo_dir/templates/base"

install_file "$base_dir/AGENTS.md" "$target_dir/AGENTS.md"
install_file "$base_dir/CLAUDE.md" "$target_dir/CLAUDE.md"
install_file "$base_dir/GEMINI.md" "$target_dir/GEMINI.md"

for doc in "$base_dir"/docs/*.md; do
  install_file "$doc" "$target_dir/docs/$(basename -- "$doc")"
done

if [ "$skip_skills" -eq 0 ]; then
  install_tree "$base_dir/skills" "$target_dir/skills" "base skills -> skills/"
fi

printf '%s\n' "Agent workflow installation complete: $target_dir"
