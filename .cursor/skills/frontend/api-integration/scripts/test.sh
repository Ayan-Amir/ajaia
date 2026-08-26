#!/usr/bin/env bash
# Smoke test: production build
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$ROOT"
yarn build
