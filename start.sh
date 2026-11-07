#!/usr/bin/env bash
# ─────────────────────────────────────────────
# Inventory Manager — Start Script
# Run this script from the inventory-system folder:
#   ./start.sh   or   bash start.sh
# ─────────────────────────────────────────────

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "  📦 Inventory Manager"
echo "  ────────────────────"
echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "  Installing dependencies..."
  npm install
  echo ""
fi

# Create data directory and inventory.json if missing
mkdir -p data
if [ ! -f "data/inventory.json" ]; then
  echo "[]" > data/inventory.json
  echo "  Created data/inventory.json"
fi

# Create uploads directory if missing
mkdir -p public/uploads

echo "  Starting the app at http://localhost:3000"
echo ""
echo "  Press Ctrl+C to stop."
echo ""

npm run dev
