#!/bin/bash
set -e

echo "Running TypeScript check..."
yarn tsc --noEmit

echo "Running tests (single pass)..."
yarn vitest run

echo "Checking for direct RTL imports (should use test-utils)..."
grep -r 'from "@testing-library/react"' src/ \
  --include="*.test.ts" --include="*.test.tsx" \
  | grep -v 'src/tests/utils/test-utils.tsx' && {
  echo "ERROR: Direct @testing-library/react imports found in test files."
  echo "Import from @/tests/utils/test-utils instead."
  exit 1
} || echo "RTL import check passed."

echo "Checking for fireEvent usage (should use userEvent)..."
grep -r 'fireEvent\.' src/ --include="*.test.ts" --include="*.test.tsx" && {
  echo "ERROR: fireEvent found. Use userEvent instead."
  exit 1
} || echo "No fireEvent usage found."

echo "Checking for direct fetch/axios mocks..."
grep -r 'vi\.mock.*fetch\|vi\.mock.*axios' src/ --include="*.test.ts" --include="*.test.tsx" && {
  echo "ERROR: Direct fetch/axios mocks found. Use MSW handlers instead."
  exit 1
} || echo "No direct fetch/axios mocks found."

echo "All checks passed."
