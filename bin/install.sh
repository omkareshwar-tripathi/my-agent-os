#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  install.sh [target-project] [--profile NAME] [--force] [--skip-skills]
  install.sh --list-profiles

Options:
  --profile NAME   Install an optional profile from profiles/NAME
  --force          Overwrite existing files
  --skip-skills    Do not install templates/base/skills
  --list-profiles  Print available profiles and exit
USAGE
}

repo_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
target=""
profile=""
force=0
skip_skills=0

list_profiles() {
  if [ ! -d "$repo_dir/profiles" ]; then
    return 0
  fi
  find "$repo_dir/profiles" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | sort
}

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
    --profile)
      shift
      if [ "$#" -eq 0 ]; then
        printf '%s\n' "--profile requires a name" >&2
        exit 2
      fi
      profile="$1"
      ;;
    --force)
      force=1
      ;;
    --skip-skills)
      skip_skills=1
      ;;
    --list-profiles)
      list_profiles
      exit 0
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
profile_dir=""

if [ -n "$profile" ]; then
  profile_dir="$repo_dir/profiles/$profile"
  if [ ! -d "$profile_dir" ]; then
    printf '%s\n' "Unknown profile: $profile" >&2
    printf '%s\n' "Available profiles:" >&2
    list_profiles >&2
    exit 1
  fi
fi

install_file "$base_dir/AGENTS.md" "$target_dir/AGENTS.md"
install_file "$base_dir/CLAUDE.md" "$target_dir/CLAUDE.md"
install_file "$base_dir/GEMINI.md" "$target_dir/GEMINI.md"

for doc in "$base_dir"/docs/*.md; do
  if [ -n "$profile_dir" ] && [ -f "$profile_dir/docs/$(basename -- "$doc")" ]; then
    printf '%s\n' "profile override: docs/$(basename -- "$doc")"
    continue
  fi
  install_file "$doc" "$target_dir/docs/$(basename -- "$doc")"
done

if [ "$skip_skills" -eq 0 ]; then
  install_tree "$base_dir/skills" "$target_dir/skills" "base skills -> skills/"
fi

if [ -n "$profile" ]; then
  if [ -d "$profile_dir/docs" ]; then
    for doc in "$profile_dir"/docs/*.md; do
      [ -e "$doc" ] || continue
      install_file "$doc" "$target_dir/docs/$(basename -- "$doc")"
    done
  fi

  if [ -d "$profile_dir/skills" ] && [ "$skip_skills" -eq 0 ]; then
    install_tree "$profile_dir/skills" "$target_dir/skills" "$profile skills -> skills/"
  fi

  install_file "$profile_dir/README.md" "$target_dir/docs/agent-profile-$profile.md"
fi

printf '%s\n' "Agent workflow installation complete: $target_dir"
