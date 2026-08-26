#!/usr/bin/env bash
# Install dependencies and prepare frontend workspace for auth/session work.
set -euo pipefail

if [ ! -f package.json ]; then
  echo "package.json not found in current directory"
  exit 1
fi

if [ -f yarn.lock ]; then
  yarn install --frozen-lockfile
else
  yarn install
fi
