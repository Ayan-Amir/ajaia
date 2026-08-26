#!/bin/bash
# Runs project lint and Prettier check on frontend sources.
# Execute from the boilerplate repository root (directory containing package.json).
set -euo pipefail
if [[ ! -f package.json ]]; then
  echo "Error: run this script from the boilerplate root (where package.json lives)." >&2
  exit 1
fi
yarn lint
npx prettier --check "src/**/*.{js,jsx,ts,tsx}" --config ./.prettierrc
