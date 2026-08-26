#!/usr/bin/env bash
# Install frontend dependencies and verify required yarn tooling.
set -euo pipefail

if ! command -v yarn >/dev/null 2>&1; then
  echo "Error: yarn is required but not installed." >&2
  exit 1
fi

if [[ ! -f package.json ]]; then
  echo "Error: package.json not found in current working directory." >&2
  exit 1
fi

if [[ -f yarn.lock ]]; then
  yarn install --frozen-lockfile
else
  yarn install
fi

echo "setup.sh completed successfully."
