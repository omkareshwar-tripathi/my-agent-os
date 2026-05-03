#!/usr/bin/env bash
# Shared helpers for my-agent-os scripts.
# Compatible with bash 3.2+ (macOS default).
# Source this file: source "$(dirname "${BASH_SOURCE[0]}")/_lib.sh"

set -euo pipefail

AGENT_OS_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"

# ── YAML parsing (no yq dependency) ──────────────────────────────────────────

_parse_yaml_value() {
  local key="$1" file="$2"
  grep "^${key}:" "$file" 2>/dev/null | head -1 | sed "s/^${key}: *//" | sed 's/^"//' | sed 's/"$//' | sed "s/^'//" | sed "s/'$//"
}

_parse_yaml_list() {
  local key="$1" file="$2"
  awk -v k="$key:" '
    $0 ~ "^"k { found=1; next }
    found && /^  - / { gsub(/^  - /, ""); gsub(/"/, ""); gsub(/'\''/, ""); print; next }
    found && /^[^ ]/ { found=0 }
    found && /^$/ { found=0 }
  ' "$file"
}

# ── Module resolution ────────────────────────────────────────────────────────

_resolve_profile() {
  local profile_name="$1"
  local profile_file="$AGENT_OS_DIR/profiles/${profile_name}.yaml"
  if [ ! -f "$profile_file" ]; then
    printf 'error: profile not found: %s\n' "$profile_name" >&2
    return 1
  fi
  _parse_yaml_list "modules" "$profile_file"
  _parse_yaml_list "stacks" "$profile_file"
}

_find_module_dir() {
  local mod="$1"
  if [ "$mod" = "core" ]; then
    echo "$AGENT_OS_DIR/core"
  elif [ -d "$AGENT_OS_DIR/modules/$mod" ]; then
    echo "$AGENT_OS_DIR/modules/$mod"
  elif [ -d "$AGENT_OS_DIR/stacks/$mod" ]; then
    echo "$AGENT_OS_DIR/stacks/$mod"
  else
    return 1
  fi
}

_module_type() {
  local mod="$1"
  if [ "$mod" = "core" ]; then
    echo "core"
  elif [ -d "$AGENT_OS_DIR/modules/$mod" ]; then
    echo "function"
  elif [ -d "$AGENT_OS_DIR/stacks/$mod" ]; then
    echo "stack"
  else
    echo "unknown"
  fi
}

_list_contains() {
  local item="$1" list="$2"
  echo "$list" | grep -qx "$item" 2>/dev/null
}

_resolve_modules() {
  local profile="$1"
  shift
  local all_mods=""

  # From profile
  if [ -n "$profile" ]; then
    local profile_mods
    profile_mods=$(_resolve_profile "$profile")
    all_mods="$profile_mods"
  fi

  # From explicit arguments
  for mod in "$@"; do
    [ -z "$mod" ] && continue
    if ! _list_contains "$mod" "$all_mods"; then
      all_mods=$(printf '%s\n%s' "$all_mods" "$mod")
    fi
  done

  # Always include core
  if ! _list_contains "core" "$all_mods"; then
    all_mods=$(printf 'core\n%s' "$all_mods")
  fi

  # Resolve transitive dependencies
  local resolved=""
  local visited=""

  _resolve_dep() {
    local m="$1"
    _list_contains "$m" "$visited" && return 0
    visited=$(printf '%s\n%s' "$visited" "$m")

    local mod_dir
    mod_dir=$(_find_module_dir "$m") || {
      printf 'error: module not found: %s\n' "$m" >&2
      return 1
    }
    local yaml="$mod_dir/module.yaml"
    if [ -f "$yaml" ]; then
      local dep
      while IFS= read -r dep; do
        [ -z "$dep" ] && continue
        _resolve_dep "$dep"
      done < <(_parse_yaml_list "requires" "$yaml")
    fi
    if ! _list_contains "$m" "$resolved"; then
      resolved=$(printf '%s\n%s' "$resolved" "$m")
    fi
  }

  local mod
  while IFS= read -r mod; do
    [ -z "$mod" ] && continue
    _resolve_dep "$mod"
  done <<< "$all_mods"

  # Sort: core first, then function modules alpha, then stack modules alpha
  local core_out="" func_out="" stack_out=""
  while IFS= read -r mod; do
    [ -z "$mod" ] && continue
    case "$(_module_type "$mod")" in
      core)     core_out="$mod" ;;
      function) func_out=$(printf '%s\n%s' "$func_out" "$mod") ;;
      stack)    stack_out=$(printf '%s\n%s' "$stack_out" "$mod") ;;
    esac
  done <<< "$resolved"

  local sorted_func sorted_stack
  sorted_func=$(echo "$func_out" | grep -v '^$' | sort 2>/dev/null || true)
  sorted_stack=$(echo "$stack_out" | grep -v '^$' | sort 2>/dev/null || true)

  [ -n "$core_out" ] && echo "$core_out"
  [ -n "$sorted_func" ] && echo "$sorted_func"
  [ -n "$sorted_stack" ] && echo "$sorted_stack"
}

# ── Symlink helpers ──────────────────────────────────────────────────────────

_link_or_copy() {
  local src="$1" dest="$2"
  if ln -s "$src" "$dest" 2>/dev/null; then
    return 0
  else
    cp -r "$src" "$dest"
    printf 'warning: copied instead of symlinked: %s\n' "$(basename "$dest")" >&2
  fi
}

_install_skill_symlinks() {
  local mod_dir="$1" target_dir="$2" category="$3"
  local skill_src="$mod_dir/skills/$category"
  local skill_dest="$target_dir/skills/$category"
  [ -d "$skill_src" ] || return 0
  mkdir -p "$skill_dest"

  for skill_dir in "$skill_src"/*/; do
    [ -d "$skill_dir" ] || continue
    local skill_name
    skill_name=$(basename "$skill_dir")
    local dest_path="$skill_dest/$skill_name"
    if [ -L "$dest_path" ]; then
      local existing_target
      existing_target=$(readlink "$dest_path" 2>/dev/null || true)
      if [ "$existing_target" = "$skill_dir" ] || [ "$existing_target" = "${skill_dir%/}" ]; then
        continue
      fi
    fi
    if [ -e "$dest_path" ] && [ ! -L "$dest_path" ]; then
      printf 'skip: skills/%s/%s (project-local, not a symlink)\n' "$category" "$skill_name"
      continue
    fi
    rm -f "$dest_path"
    _link_or_copy "${skill_dir%/}" "$dest_path"
    printf 'linked: skills/%s/%s\n' "$category" "$skill_name"
  done
}

_clean_stale_symlinks() {
  local target_dir="$1"
  shift
  local expected="$*"

  for category in methods tools; do
    local skill_dir="$target_dir/skills/$category"
    [ -d "$skill_dir" ] || continue
    for entry in "$skill_dir"/*/; do
      [ -d "$entry" ] || continue
      [ -L "${entry%/}" ] || continue
      local link_target
      link_target=$(readlink "${entry%/}" 2>/dev/null || true)
      case "$link_target" in
        "$AGENT_OS_DIR"*)
          local found=0
          for exp in $expected; do
            if [ "$link_target" = "$exp" ] || [ "$link_target" = "${exp%/}" ]; then
              found=1
              break
            fi
          done
          if [ "$found" -eq 0 ]; then
            rm -f "${entry%/}"
            printf 'removed stale symlink: %s\n' "$(basename "${entry%/}")"
          fi
          ;;
      esac
    done
  done
}

# ── JSON settings merge (uses Python3) ───────────────────────────────────────

_merge_settings() {
  local target_settings="$1"
  shift

  python3 - "$target_settings" "$@" <<'PYTHON'
import json, sys, os

target_file = sys.argv[1]
module_dirs = sys.argv[2:]

if os.path.exists(target_file):
    with open(target_file) as f:
        settings = json.load(f)
else:
    settings = {}

if "permissions" not in settings:
    settings["permissions"] = {}
if "allow" not in settings["permissions"]:
    settings["permissions"]["allow"] = []

all_perms = set(settings["permissions"]["allow"])
all_hooks = {}

for event, hooks_list in settings.get("hooks", {}).items():
    if isinstance(hooks_list, list):
        all_hooks[event] = {h.get("command", ""): h for h in hooks_list if isinstance(h, dict)}

for mod_dir in module_dirs:
    perms_file = os.path.join(mod_dir, "settings", "permissions.json")
    if os.path.exists(perms_file):
        with open(perms_file) as f:
            perms = json.load(f)
        if isinstance(perms, list):
            all_perms.update(p for p in perms if p)

    hooks_file = os.path.join(mod_dir, "settings", "hooks.json")
    if os.path.exists(hooks_file):
        with open(hooks_file) as f:
            hooks = json.load(f)
        if isinstance(hooks, list):
            for hook_def in hooks:
                matcher = hook_def.get("matcher", "")
                if matcher not in all_hooks:
                    all_hooks[matcher] = {}
                for h in hook_def.get("hooks", []):
                    cmd = h.get("command", "")
                    if cmd and cmd not in all_hooks[matcher]:
                        all_hooks[matcher][cmd] = h

settings["permissions"]["allow"] = sorted(all_perms)

if all_hooks:
    if "hooks" not in settings:
        settings["hooks"] = {}
    for event in sorted(all_hooks.keys()):
        if event:
            settings["hooks"][event] = list(all_hooks[event].values())

os.makedirs(os.path.dirname(os.path.abspath(target_file)), exist_ok=True)
with open(target_file, "w") as f:
    json.dump(settings, f, indent=2)
    f.write("\n")
PYTHON
}

# ── Manifest helpers ─────────────────────────────────────────────────────────

_write_manifest() {
  local target_dir="$1" profile="$2"
  shift 2

  local version
  version=$(git -C "$AGENT_OS_DIR" rev-parse --short HEAD 2>/dev/null || echo "unknown")
  local timestamp
  timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  local manifest="$target_dir/.agent-os.yaml"
  {
    if [ -n "$profile" ]; then
      printf 'profile: %s\n' "$profile"
    else
      printf 'profile: null\n'
    fi
    printf 'modules:\n'
    for mod in "$@"; do
      printf '  - %s\n' "$mod"
    done
    printf 'version: "%s"\n' "$version"
    printf 'composed_at: "%s"\n' "$timestamp"
    printf 'agent_os_path: "%s"\n' "$AGENT_OS_DIR"
  } > "$manifest"
}

_read_manifest_modules() {
  local manifest="$1"
  _parse_yaml_list "modules" "$manifest"
}

# ── File install helpers ─────────────────────────────────────────────────────

_install_doc() {
  local src="$1" dest="$2" force="${3:-0}"
  local rel="${dest##*/}"
  mkdir -p "$(dirname "$dest")"

  if [ -e "$dest" ] && ! cmp -s "$src" "$dest"; then
    if [ "$force" -eq 1 ]; then
      cp "$src" "$dest"
      printf 'updated: docs/%s\n' "$rel"
    else
      cp "$src" "${dest}.agent-os.new"
      printf 'conflict: docs/%s (wrote .agent-os.new)\n' "$rel"
    fi
  elif [ ! -e "$dest" ]; then
    cp "$src" "$dest"
    printf 'created: docs/%s\n' "$rel"
  fi
}
