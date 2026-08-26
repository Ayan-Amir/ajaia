#!/usr/bin/env bash
# Run lint checks for frontend auth/session changes.
set -euo pipefail

if [ -f package.json ]; then
  if yarn run 2>/dev/null | rg -q "\blint\b"; then
    yarn lint
  else
    echo "No lint script found in package.json"
    exit 1
  fi
else
  echo "package.json not found in current directory"
  exit 1
fi
