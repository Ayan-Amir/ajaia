#!/usr/bin/env bash
# Runs ESLint for the boilerplate src tree
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$ROOT"
yarn lint
