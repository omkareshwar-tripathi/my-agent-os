#!/usr/bin/env bash
# Import a skill from GitHub and auto-classify it into the right module.
#
# Usage:
#   import.sh <github-url>
#   import.sh <github-url> --module testing --type method
#   import.sh <github-url> --module ios --type tool
set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/_lib.sh"

usage() {
  cat <<'USAGE'
Usage:
  import.sh <github-url> [options]

Options:
  --module <name>    Place skill in this module (skip auto-classification)
  --type <t>         Skill type: method or tool (skip auto-classification)
  --name <n>         Override skill name (default: derived from repo/dir name)
  -y, --yes          Skip confirmation prompt
  -h, --help         Show this help
USAGE
}

url=""
override_module=""
override_type=""
override_name=""
auto_confirm=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    --module)  override_module="${2:-}"; shift ;;
    --type)    override_type="${2:-}"; shift ;;
    --name)    override_name="${2:-}"; shift ;;
    -y|--yes)  auto_confirm=1 ;;
    -h|--help) usage; exit 0 ;;
    -*)        printf 'Unknown option: %s\n' "$1" >&2; usage >&2; exit 2 ;;
    *)
      if [ -n "$url" ]; then
        printf 'Only one URL is supported.\n' >&2
        exit 2
      fi
      url="$1"
      ;;
  esac
  shift
done

if [ -z "$url" ]; then
  printf 'error: no GitHub URL provided\n' >&2
  usage >&2
  exit 1
fi

# ── Clone to temp directory ──────────────────────────────────────────────────

tmp_dir=$(mktemp -d)
trap 'rm -rf "$tmp_dir"' EXIT

printf 'Fetching: %s\n' "$url"

# Handle tree URLs (github.com/user/repo/tree/branch/path)
if echo "$url" | grep -q '/tree/'; then
  repo_url=$(echo "$url" | sed 's|/tree/.*||')
  branch_and_path=$(echo "$url" | sed 's|.*/tree/||')
  branch=$(echo "$branch_and_path" | cut -d'/' -f1)
  subpath=$(echo "$branch_and_path" | cut -d'/' -f2-)

  git clone --depth 1 --branch "$branch" "$repo_url" "$tmp_dir/repo" 2>/dev/null || \
    git clone --depth 1 "$repo_url" "$tmp_dir/repo" 2>/dev/null
  skill_src="$tmp_dir/repo/$subpath"
else
  git clone --depth 1 "$url" "$tmp_dir/repo" 2>/dev/null
  skill_src="$tmp_dir/repo"
fi

if [ ! -d "$skill_src" ]; then
  printf 'error: could not find skill content at %s\n' "$url" >&2
  exit 1
fi

# ── Detect skill content ────────────────────────────────────────────────────

skill_file=""
skill_description=""
skill_name_from_file=""

if [ -f "$skill_src/SKILL.md" ]; then
  skill_file="$skill_src/SKILL.md"
elif [ -f "$skill_src/skill.md" ]; then
  skill_file="$skill_src/skill.md"
fi

# Read metadata from SKILL.md frontmatter
if [ -n "$skill_file" ]; then
  skill_name_from_file=$(awk '/^---/{if(++c==2)exit} /^name:/{gsub(/^name: */, ""); gsub(/"/, ""); print}' "$skill_file")
  skill_description=$(awk '/^---/{if(++c==2)exit} /^description:/{gsub(/^description: */, ""); gsub(/"/, ""); print}' "$skill_file")
fi

# Fallback: read README
if [ -z "$skill_description" ] && [ -f "$skill_src/README.md" ]; then
  skill_description=$(head -20 "$skill_src/README.md" | grep -v '^#' | grep -v '^$' | head -3 | tr '\n' ' ')
fi

# Determine skill name
if [ -n "$override_name" ]; then
  skill_name="$override_name"
elif [ -n "$skill_name_from_file" ]; then
  skill_name="$skill_name_from_file"
else
  skill_name=$(basename "$skill_src" | sed 's/\.git$//')
fi

# Normalize name (lowercase, hyphens)
skill_name=$(echo "$skill_name" | tr '[:upper:]' '[:lower:]' | tr ' _' '--' | sed 's/[^a-z0-9-]//g')

printf '\nSkill: %s\n' "$skill_name"
[ -n "$skill_description" ] && printf 'Description: %s\n' "$skill_description"

# ── Auto-classify ────────────────────────────────────────────────────────────

_classify_type() {
  local desc="$1"
  local lower
  lower=$(echo "$desc" | tr '[:upper:]' '[:lower:]')

  # Tool indicators
  for kw in generate run execute build convert transform render create output compile bundle serve deploy; do
    echo "$lower" | grep -qw "$kw" && { echo "tool"; return; }
  done

  # Method indicators
  for kw in workflow process methodology "when to use" before after guideline practice pattern principle discipline approach strategy; do
    echo "$lower" | grep -q "$kw" && { echo "method"; return; }
  done

  echo "method"
}

_classify_module() {
  local desc="$1"
  local lower
  lower=$(echo "$desc" | tr '[:upper:]' '[:lower:]')

  # Stack detection first (more specific)
  for kw in swift swiftui xcode ios uikit coredata; do
    echo "$lower" | grep -qw "$kw" && { echo "ios"; return; }
  done
  for kw in flutter dart widget riverpod bloc; do
    echo "$lower" | grep -qw "$kw" && { echo "flutter"; return; }
  done
  for kw in "next.js" nextjs "app router" "server component" vercel; do
    echo "$lower" | grep -q "$kw" && { echo "nextjs"; return; }
  done
  for kw in react jsx tsx hook component redux zustand; do
    echo "$lower" | grep -qw "$kw" && { echo "react"; return; }
  done
  for kw in python pip django fastapi flask pep; do
    echo "$lower" | grep -qw "$kw" && { echo "python"; return; }
  done
  for kw in node express nestjs hono bun deno; do
    echo "$lower" | grep -qw "$kw" && { echo "node"; return; }
  done
  for kw in supabase rls "row level" realtime; do
    echo "$lower" | grep -q "$kw" && { echo "supabase"; return; }
  done

  # Function module detection
  for kw in test tdd spec coverage assertion jest vitest playwright cypress; do
    echo "$lower" | grep -qw "$kw" && { echo "testing"; return; }
  done
  for kw in component ui css layout responsive accessibility a11y; do
    echo "$lower" | grep -qw "$kw" && { echo "frontend"; return; }
  done
  for kw in design color typography spacing theme token figma; do
    echo "$lower" | grep -qw "$kw" && { echo "design"; return; }
  done
  for kw in api database server endpoint migration auth backend; do
    echo "$lower" | grep -qw "$kw" && { echo "backend"; return; }
  done
  for kw in deploy ci cd pipeline docker infra terraform kubernetes; do
    echo "$lower" | grep -qw "$kw" && { echo "devops"; return; }
  done
  for kw in security xss injection csrf sanitize owasp; do
    echo "$lower" | grep -qw "$kw" && { echo "security"; return; }
  done
  for kw in performance optimize cache profile bundle lighthouse; do
    echo "$lower" | grep -qw "$kw" && { echo "performance"; return; }
  done
  for kw in lint refactor review quality smell "code review" "clean code"; do
    echo "$lower" | grep -q "$kw" && { echo "code-quality"; return; }
  done
  for kw in architecture decision pattern boundary "system design" microservice; do
    echo "$lower" | grep -q "$kw" && { echo "architecture"; return; }
  done

  echo "core"
}

# Classify
if [ -n "$override_type" ]; then
  classified_type="$override_type"
else
  classified_type=$(_classify_type "$skill_description $skill_name")
fi

if [ -n "$override_module" ]; then
  classified_module="$override_module"
else
  # Combine all text for classification
  all_text="$skill_description $skill_name"
  [ -n "$skill_file" ] && all_text="$all_text $(head -50 "$skill_file" 2>/dev/null || true)"
  classified_module=$(_classify_module "$all_text")
fi

# Determine target path
target_module_dir=$(_find_module_dir "$classified_module") || {
  printf 'error: module not found: %s\n' "$classified_module" >&2
  exit 1
}
target_path="$target_module_dir/skills/${classified_type}s/$skill_name"

printf '\nClassification:\n'
printf '  Module: %s\n' "$classified_module"
printf '  Type:   %s\n' "$classified_type"
printf '  Path:   %s\n' "${target_path#$AGENT_OS_DIR/}"

# ── Confirm with user ───────────────────────────────────────────────────────

if [ "$auto_confirm" -eq 0 ]; then
  printf '\nInstall here? [Y/n/change] '
  read -r answer < /dev/tty
  case "$answer" in
    n|N|no|No)
      printf 'Aborted.\n'
      exit 0
      ;;
    c|C|change)
      printf 'Module (current: %s): ' "$classified_module"
      read -r new_mod < /dev/tty
      if [ -n "$new_mod" ]; then
        classified_module="$new_mod"
        target_module_dir=$(_find_module_dir "$classified_module") || {
          printf 'error: module not found: %s\n' "$classified_module" >&2
          exit 1
        }
      fi
      printf 'Type [method/tool] (current: %s): ' "$classified_type"
      read -r new_type < /dev/tty
      [ -n "$new_type" ] && classified_type="$new_type"
      target_path="$target_module_dir/skills/${classified_type}s/$skill_name"
      printf 'New path: %s\n' "${target_path#$AGENT_OS_DIR/}"
      ;;
  esac
fi

# ── Install skill ────────────────────────────────────────────────────────────

if [ -e "$target_path" ]; then
  printf 'warning: %s already exists. Overwriting.\n' "${target_path#$AGENT_OS_DIR/}"
  rm -rf "$target_path"
fi

mkdir -p "$target_path"

# Copy skill content
if [ -n "$skill_file" ]; then
  cp "$skill_file" "$target_path/SKILL.md"
else
  # If no SKILL.md, copy everything relevant
  for f in "$skill_src"/*.md "$skill_src"/*.yaml "$skill_src"/*.json; do
    [ -f "$f" ] && cp "$f" "$target_path/"
  done
  # If still no SKILL.md, create a minimal one
  if [ ! -f "$target_path/SKILL.md" ]; then
    cat > "$target_path/SKILL.md" <<EOF
---
name: $skill_name
description: $skill_description
---

# $skill_name

Imported from: $url
EOF
  fi
fi

printf '\nInstalled: %s\n' "${target_path#$AGENT_OS_DIR/}"

# ── Update module.yaml ───────────────────────────────────────────────────────

yaml="$target_module_dir/module.yaml"
if [ -f "$yaml" ]; then
  rel_path="skills/${classified_type}s/$skill_name"
  # Check if already listed
  if ! grep -q "$rel_path" "$yaml"; then
    printf 'Note: Add "%s" to %s skills.%ss list manually.\n' "$rel_path" "$classified_module" "$classified_type"
  fi
fi

# ── Commit ───────────────────────────────────────────────────────────────────

printf '\nCommitting to my-agent-os...\n'
git -C "$AGENT_OS_DIR" add "$target_path"
git -C "$AGENT_OS_DIR" commit -m "import: add $skill_name ($classified_type) to $classified_module" -- "$target_path" 2>/dev/null || {
  printf 'Staged but not committed (no changes or git issue).\n'
}

printf '\nDone. All projects will receive this skill on next update.\n'
