#!/bin/bash
set -euo pipefail

# Only run in remote (web) environment
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Try yarn first (project uses yarn 4.10.3), fall back to npm
if command -v corepack &>/dev/null; then
  corepack enable 2>/dev/null || true
fi

if command -v yarn &>/dev/null && yarn --version 2>/dev/null | grep -q "^4\."; then
  echo "Installing dependencies with yarn..."
  yarn install
else
  echo "Yarn 4 not available, falling back to npm..."
  npm install --legacy-peer-deps
fi
