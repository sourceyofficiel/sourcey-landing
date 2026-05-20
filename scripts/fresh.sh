#!/bin/bash
# ----------------------------------------------------------------------
# scripts/fresh.sh — nuke .next cache + restart dev server (bash version)
#
# Use this when:
#   - The site loads but every button is dead
#   - main-app.js returns 500
# ----------------------------------------------------------------------
set -e
unset ANTHROPIC_API_KEY  # Claude Code injects an empty key, kill it

cd "$(dirname "$0")/.."

echo "🔪 Killing anything on port 3000..."
fuser -k 3000/tcp 2>/dev/null || true
sleep 1

echo "🗑️  Removing .next cache..."
rm -rf .next

echo "🚀 Starting fresh dev server..."
npm run dev
