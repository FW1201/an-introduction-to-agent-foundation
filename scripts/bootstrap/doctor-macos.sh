#!/usr/bin/env bash
set -u

echo "Agent Foundation bootstrap check (macOS)"
for tool in brew git node npm npx gh gws officecli python3; do
  if command -v "$tool" >/dev/null 2>&1; then
    printf '✓ %s: ' "$tool"
    "$tool" --version 2>/dev/null | head -n 1 || true
  else
    printf '○ %s: not found\n' "$tool"
  fi
done
echo "Do not install anything until the user confirms the official installation path."
