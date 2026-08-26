#!/usr/bin/env bash
# Run type checks and tests for validation-schema changes using yarn.
set -euo pipefail

yarn typecheck
yarn test
