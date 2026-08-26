#!/usr/bin/env bash
# Run lint and formatting checks through yarn scripts.
set -euo pipefail

yarn lint
yarn format:check
