#!/bin/bash
set -e

echo "Running TypeScript check..."
yarn tsc --noEmit

echo "Checking for hardcoded route strings..."
grep -r '"/dashboard"\|"/login"\|"/register"\|"/profile"\|"/settings"\|"/admin"' src/components src/pages 2>/dev/null && {
  echo "ERROR: Hardcoded route paths found. Use ROUTES constants instead."
  exit 1
} || echo "No hardcoded routes found."

echo "Checking for direct import.meta.env usage..."
grep -r 'import\.meta\.env\.' src/ --include="*.ts" --include="*.tsx" \
  | grep -v 'src/config/env.ts' && {
  echo "ERROR: Direct import.meta.env usage found outside env.ts."
  exit 1
} || echo "No direct import.meta.env usage found."

echo "Checking for imports from individual constant files..."
grep -r 'from "@/constants/' src/ --include="*.ts" --include="*.tsx" \
  | grep -v 'src/constants/index.ts' && {
  echo "ERROR: Imports from individual constant files found. Use @/constants barrel."
  exit 1
} || echo "Barrel imports look good."

echo "All checks passed."
