#!/usr/bin/env bash
# Run type validation and test suite using yarn scripts.
set -euo pipefail

if ! command -v yarn >/dev/null 2>&1; then
  echo "Error: yarn is required but not installed." >&2
  exit 1
fi

if [[ ! -f package.json ]]; then
  echo "Error: package.json not found in current working directory." >&2
  exit 1
fi

if yarn run | rg -q "\btypecheck\b"; then
  yarn typecheck
elif yarn run | rg -q "\btsc\b"; then
  yarn tsc --noEmit
else
  echo "Warning: no 'typecheck' script found; skipping typecheck." >&2
fi

if yarn run | rg -q "\btest\b"; then
  yarn test
else
  echo "Warning: no 'test' script found; skipping tests." >&2
fi

echo "validate.sh completed successfully."
