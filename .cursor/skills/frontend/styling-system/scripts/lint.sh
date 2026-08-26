#!/usr/bin/env bash
# Run repository lint checks using yarn scripts.
set -euo pipefail

if ! command -v yarn >/dev/null 2>&1; then
  echo "Error: yarn is required but not installed." >&2
  exit 1
fi

if [[ ! -f package.json ]]; then
  echo "Error: package.json not found in current working directory." >&2
  exit 1
fi

if yarn run | rg -q "\blint\b"; then
  yarn lint
else
  echo "Error: no 'lint' script found in package.json" >&2
  exit 1
fi

echo "lint.sh completed successfully."
