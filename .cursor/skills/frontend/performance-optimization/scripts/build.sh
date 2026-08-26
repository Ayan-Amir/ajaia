#!/bin/bash
# Runs a production build for bundle size and chunk inspection (Vite boilerplate).
# Execute from the boilerplate repository root (directory containing package.json).
set -euo pipefail
if [[ ! -f package.json ]]; then
  echo "Error: run this script from the boilerplate root (where package.json lives)." >&2
  exit 1
fi
yarn build
