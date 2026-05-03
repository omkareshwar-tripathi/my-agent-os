#!/usr/bin/env bash
# Auto-update hook for my-agent-os.
# Registered as a Claude Code UserPromptSubmit hook.
# Checks if ~/my-agent-os has changed since last compose and recomposes if needed.
set -euo pipefail

PROJECT_DIR="$(pwd)"
MANIFEST="$PROJECT_DIR/.agent-os.yaml"

# Exit silently if this project doesn't use agent-os
[ -f "$MANIFEST" ] || exit 0

# Read agent-os path and version from manifest
AGENT_OS_PATH=$(grep '^agent_os_path:' "$MANIFEST" 2>/dev/null | sed 's/^agent_os_path: *//' | sed 's/"//g')
STORED_VERSION=$(grep '^version:' "$MANIFEST" 2>/dev/null | sed 's/^version: *//' | sed 's/"//g')

[ -n "$AGENT_OS_PATH" ] && [ -d "$AGENT_OS_PATH" ] || exit 0

# Get current git hash
CURRENT_VERSION=$(git -C "$AGENT_OS_PATH" rev-parse --short HEAD 2>/dev/null || echo "unknown")

# If versions match, nothing to do
[ "$STORED_VERSION" = "$CURRENT_VERSION" ] && exit 0

# Versions differ — recompose
echo "[agent-os] Update detected ($STORED_VERSION → $CURRENT_VERSION). Recomposing..."
"$AGENT_OS_PATH/bin/update.sh" "$PROJECT_DIR" 2>&1 | sed 's/^/[agent-os] /'
