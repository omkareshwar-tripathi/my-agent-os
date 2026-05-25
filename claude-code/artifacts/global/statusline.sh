#!/bin/bash

# Read JSON input from stdin
input=$(cat)

# Extract data from JSON
branch=$(git -C "$(echo "$input" | jq -r '.workspace.current_dir')" branch --show-current 2>/dev/null || echo 'no-git')
model=$(echo "$input" | jq -r '.model.display_name')
usage=$(echo "$input" | jq '.context_window.current_usage')

# ANSI color codes for iTerm2
CYAN='\033[96m'
MAGENTA='\033[95m'
GREEN='\033[92m'
YELLOW='\033[93m'
RED='\033[91m'
RESET='\033[0m'
DIM='\033[2m'

# Calculate context window usage
if [ "$usage" != "null" ]; then
    current=$(echo "$usage" | jq '.input_tokens + .cache_creation_input_tokens + .cache_read_input_tokens')
    size=$(echo "$input" | jq '.context_window.context_window_size')
    actual_pct=$((current * 100 / size))

    # Treat 77% as the maximum (100%)
    # Scale the percentage: displayed_pct = (actual_pct / 77) * 100
    # Cap at 100% if actual exceeds 77%
    if [ $actual_pct -gt 77 ]; then
        pct=100
    else
        pct=$((actual_pct * 100 / 77))
    fi

    # Choose color based on scaled usage
    if [ $pct -lt 65 ]; then
        BAR_COLOR=$GREEN
    elif [ $pct -lt 85 ]; then
        BAR_COLOR=$YELLOW
    else
        BAR_COLOR=$RED
    fi

    # Create progress bar (20 characters wide)
    bar_width=20
    filled=$((pct * bar_width / 100))
    empty=$((bar_width - filled))

    # Build the progress bar using Unicode block characters
    progress_bar=""
    for ((i=0; i<filled; i++)); do
        progress_bar="${progress_bar}█"
    done
    for ((i=0; i<empty; i++)); do
        progress_bar="${progress_bar}░"
    done

    # Format output with colors
    printf "${CYAN}%s${RESET} ${DIM}|${RESET} ${MAGENTA}%s${RESET} ${DIM}|${RESET} ${BAR_COLOR}%s${RESET} ${DIM}%d%%${RESET}" \
        "$branch" "$model" "$progress_bar" "$pct"
else
    # No usage data yet
    progress_bar="░░░░░░░░░░░░░░░░░░░░"
    printf "${CYAN}%s${RESET} ${DIM}|${RESET} ${MAGENTA}%s${RESET} ${DIM}|${RESET} ${GREEN}%s${RESET} ${DIM}0%%${RESET}" \
        "$branch" "$model" "$progress_bar"
fi
