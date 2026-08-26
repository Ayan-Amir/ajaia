#!/usr/bin/env bash
# Run type checks and tests for auth/session changes.
set -euo pipefail

if [ ! -f package.json ]; then
  echo "package.json not found in current directory"
  exit 1
fi

if yarn run 2>/dev/null | rg -q "\btypecheck\b"; then
  yarn typecheck
elif yarn run 2>/dev/null | rg -q "\bcheck-types\b"; then
  yarn check-types
elif [ -f tsconfig.json ]; then
  yarn tsc --noEmit
else
  echo "No typecheck command or tsconfig found"
  exit 1
fi

if yarn run 2>/dev/null | rg -q "\btest\b"; then
  yarn test --runInBand
else
  echo "No test script found in package.json"
  exit 1
fi
