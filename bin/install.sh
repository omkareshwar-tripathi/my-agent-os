#!/usr/bin/env bash
# Install my-agent-os modules into a target project.
#
# Usage:
#   install.sh /path/to/project --profile webapp
#   install.sh /path/to/project --modules frontend,nextjs,testing
#   install.sh /path/to/project --profile webapp --modules security
#   install.sh /path/to/project                  # re-read existing manifest
#   install.sh /path/to/project --force
set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/_lib.sh"

usage() {
  cat <<'USAGE'
Usage:
  install.sh [target-project] [options]

Options:
  --profile <name>       Install a preset profile (ios-app, flutter-app, webapp, fullstack)
  --modules <a,b,c>      Install specific modules (comma-separated)
  --force                Overwrite existing files
  --skip-skills          Do not install skills
  -h, --help             Show this help
USAGE
}

target=""
profile=""
explicit_modules=""
force=0
skip_skills=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    --profile)
      profile="${2:-}"
      [ -z "$profile" ] && { printf 'error: --profile requires a value\n' >&2; exit 2; }
      shift
      ;;
    --modules)
      explicit_modules="${2:-}"
      [ -z "$explicit_modules" ] && { printf 'error: --modules requires a value\n' >&2; exit 2; }
      shift
      ;;
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
      printf 'Unknown option: %s\n' "$1" >&2
      usage >&2
      exit 2
      ;;
    *)
      if [ -n "$target" ]; then
        printf 'Only one target path is supported.\n' >&2
        exit 2
      fi
      target="$1"
      ;;
  esac
  shift
done

[ -z "$target" ] && target="."

if [ ! -d "$target" ]; then
  printf 'error: target directory does not exist: %s\n' "$target" >&2
  exit 1
fi

target_dir="$(cd -- "$target" && pwd)"
manifest="$target_dir/.agent-os.yaml"

# ── Determine module set ─────────────────────────────────────────────────────

clean_explicit=()
if [ -n "$explicit_modules" ]; then
  IFS=',' read -ra explicit_arr <<< "$explicit_modules"
  for m in "${explicit_arr[@]}"; do
    m=$(echo "$m" | tr -d ' ')
    [ -n "$m" ] && clean_explicit+=("$m")
  done
fi

# If no profile and no modules given, try reading existing manifest
if [ -z "$profile" ] && [ ${#clean_explicit[@]} -eq 0 ]; then
  if [ -f "$manifest" ]; then
    printf 'Re-reading existing manifest...\n'
    profile=$(_parse_yaml_value "profile" "$manifest")
    [ "$profile" = "null" ] && profile=""
    clean_explicit=()
    while IFS= read -r _m; do
      [ -z "$_m" ] && continue
      [ "$_m" = "core" ] && continue
      clean_explicit+=("$_m")
    done < <(_read_manifest_modules "$manifest")
  else
    printf 'error: no --profile, --modules, or existing .agent-os.yaml\n' >&2
    printf 'Run: install.sh %s --profile <name>\n' "$target" >&2
    printf 'Available profiles: ' >&2
    for p in "$AGENT_OS_DIR"/profiles/*.yaml; do
      printf '%s ' "$(basename "${p%.yaml}")" >&2
    done
    printf '\n' >&2
    exit 1
  fi
fi

# Resolve full module list
modules=()
while IFS= read -r _m; do
  [ -n "$_m" ] && modules+=("$_m")
done < <(_resolve_modules "$profile" "${clean_explicit[@]+"${clean_explicit[@]}"}")

printf '\n=== My Agent OS Install ===\n'
printf 'Target:   %s\n' "$target_dir"
[ -n "$profile" ] && printf 'Profile:  %s\n' "$profile"
printf 'Modules:  %s\n' "$(printf '%s, ' "${modules[@]}" | sed 's/, $//')"
printf '\n'

# ── Create scaffolding ───────────────────────────────────────────────────────

mkdir -p "$target_dir/.agent-os/docs"
mkdir -p "$target_dir/.agent-os/skills"
mkdir -p "$target_dir/docs"
mkdir -p "$target_dir/skills/methods"
mkdir -p "$target_dir/skills/tools"
mkdir -p "$target_dir/.claude"

# Create empty override file if it doesn't exist
if [ ! -f "$target_dir/.agent-os/agents-extra.md" ]; then
  touch "$target_dir/.agent-os/agents-extra.md"
  printf 'created: .agent-os/agents-extra.md\n'
fi

# ── Write manifest ───────────────────────────────────────────────────────────

_write_manifest "$target_dir" "$profile" "${modules[@]}"
printf 'wrote: .agent-os.yaml\n'

# ── Compose agent instruction files ──────────────────────────────────────────

"$AGENT_OS_DIR/bin/compose.sh" "$target_dir"

# ── Install docs ─────────────────────────────────────────────────────────────

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

# ── Install skills (symlinks) ────────────────────────────────────────────────

if [ "$skip_skills" -eq 0 ]; then
  # Collect expected symlink targets for stale cleanup
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

  # Clean stale symlinks from removed modules
  _clean_stale_symlinks "$target_dir" "${expected_targets[@]+"${expected_targets[@]}"}"
fi

# ── Merge settings ───────────────────────────────────────────────────────────

settings_file="$target_dir/.claude/settings.json"
mod_dirs_with_settings=()
for mod in "${modules[@]}"; do
  mod_dir=$(_find_module_dir "$mod") || continue
  if [ -f "$mod_dir/settings/permissions.json" ] || [ -f "$mod_dir/settings/hooks.json" ]; then
    mod_dirs_with_settings+=("$mod_dir")
  fi
done

if [ ${#mod_dirs_with_settings[@]} -gt 0 ]; then
  _merge_settings "$settings_file" "${mod_dirs_with_settings[@]}"
  printf 'merged: .claude/settings.json\n'
fi

# ── Register auto-update hook ────────────────────────────────────────────────

python3 - "$settings_file" "$AGENT_OS_DIR" <<'PYTHON'
import json, sys, os

settings_file = sys.argv[1]
agent_os_dir = sys.argv[2]

if os.path.exists(settings_file):
    with open(settings_file) as f:
        settings = json.load(f)
else:
    settings = {}

hook_cmd = f"bash {agent_os_dir}/bin/hooks/auto-update.sh"

if "hooks" not in settings:
    settings["hooks"] = {}
if "UserPromptSubmit" not in settings["hooks"]:
    settings["hooks"]["UserPromptSubmit"] = []

existing_cmds = {h.get("command", "") for h in settings["hooks"]["UserPromptSubmit"] if isinstance(h, dict)}
if hook_cmd not in existing_cmds:
    settings["hooks"]["UserPromptSubmit"].append({
        "type": "command",
        "command": hook_cmd
    })

os.makedirs(os.path.dirname(settings_file), exist_ok=True)
with open(settings_file, "w") as f:
    json.dump(settings, f, indent=2)
    f.write("\n")
PYTHON
printf 'registered: auto-update hook\n'

# ── Register project ─────────────────────────────────────────────────────────

installed_file="$AGENT_OS_DIR/.installed-projects"
if ! grep -qxF "$target_dir" "$installed_file" 2>/dev/null; then
  echo "$target_dir" >> "$installed_file"
  printf 'registered: project in .installed-projects\n'
fi

# ── Summary ──────────────────────────────────────────────────────────────────

printf '\n=== Installation complete ===\n'
printf 'Project: %s\n' "$target_dir"
printf 'Modules: %s\n' "$(printf '%s, ' "${modules[@]}" | sed 's/, $//')"
printf '\nCustomize: edit .agent-os/agents-extra.md for project-specific agent instructions.\n'
