#!/bin/bash
set -e

echo "Installing cn() dependencies..."
yarn add clsx tailwind-merge

echo "Done. Create src/utils/cn.ts with:"
echo ""
echo "  import { clsx, type ClassValue } from 'clsx';"
echo "  import { twMerge } from 'tailwind-merge';"
echo ""
echo "  export function cn(...inputs: ClassValue[]) {"
echo "    return twMerge(clsx(inputs));"
echo "  }"
