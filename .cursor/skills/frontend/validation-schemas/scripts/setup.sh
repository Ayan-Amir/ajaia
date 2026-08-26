#!/usr/bin/env bash
# Install dependencies for validation-schema development using yarn.
set -euo pipefail

if [[ -f yarn.lock ]]; then
  yarn install --frozen-lockfile
else
  yarn install
fi
