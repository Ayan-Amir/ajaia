#!/usr/bin/env bash
# Run type checking and tests to validate type-definition changes.
set -euo pipefail

yarn typecheck
yarn test --runInBand
