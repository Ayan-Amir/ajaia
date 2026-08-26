#!/usr/bin/env bash
# Runs TypeScript with no emit
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$ROOT"
npx tsc --noEmit -p tsconfig.json
