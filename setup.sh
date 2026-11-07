#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  Inventory Manager — Universal Setup & Start Script
#  Works on macOS and Linux, with or without Node.js installed.
#
#  Usage:
#    bash setup.sh          (or)
#    chmod +x setup.sh && ./setup.sh
# ═══════════════════════════════════════════════════════════════

set -e

# ── Colors ────────────────────────────────────────────────────
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
DIM='\033[2m'
NC='\033[0m'

step()  { echo -e "  ${BLUE}→${NC} $1"; }
done_() { echo -e "  ${GREEN}✓${NC} $1"; }
warn()  { echo -e "  ${YELLOW}⚠${NC}  $1"; }
err()   { echo -e "  ${RED}✗${NC} $1"; exit 1; }

# ── Header ────────────────────────────────────────────────────
clear 2>/dev/null || true
echo ""
echo -e "  ${BOLD}${CYAN}📦  Inventory Manager${NC}"
echo -e "  ${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ── Navigate to project root ──────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Node.js version to download if missing ────────────────────
NODE_VERSION="20.19.2"   # LTS — change here to upgrade
RUNTIME_DIR="${SCRIPT_DIR}/.node-runtime"

# ── Detect platform ───────────────────────────────────────────
OS="$(uname -s)"
ARCH="$(uname -m)"

case "${OS}-${ARCH}" in
  Darwin-arm64)            NODE_PLATFORM="darwin-arm64"  ;;
  Darwin-x86_64)           NODE_PLATFORM="darwin-x64"    ;;
  Linux-aarch64|Linux-arm64) NODE_PLATFORM="linux-arm64" ;;
  Linux-x86_64)            NODE_PLATFORM="linux-x64"     ;;
  *)
    err "Unsupported platform: ${OS} ${ARCH}. Please install Node.js 20+ manually from https://nodejs.org and re-run this script."
    ;;
esac

# ── Locate or download Node.js ────────────────────────────────
NODE_CMD=""
NPM_CMD=""

if command -v node &>/dev/null && node --version &>/dev/null; then
  # System Node.js available
  NODE_VER="$(node --version)"
  NODE_MAJOR="${NODE_VER#v}"
  NODE_MAJOR="${NODE_MAJOR%%.*}"
  if [ "$NODE_MAJOR" -lt 18 ]; then
    warn "System Node.js is ${NODE_VER} (too old). Downloading Node.js v${NODE_VERSION} locally..."
    USE_LOCAL=true
  else
    NODE_CMD="$(command -v node)"
    NPM_CMD="$(command -v npm)"
    done_ "Node.js ${NODE_VER} found on system"
    USE_LOCAL=false
  fi
else
  USE_LOCAL=true
fi

if [ "${USE_LOCAL}" = true ]; then
  NODE_DIR="${RUNTIME_DIR}/node-v${NODE_VERSION}-${NODE_PLATFORM}"
  NODE_CMD="${NODE_DIR}/bin/node"
  NPM_CMD="${NODE_DIR}/bin/npm"

  if [ -f "$NODE_CMD" ]; then
    done_ "Using cached portable Node.js v${NODE_VERSION}"
  else
    step "Downloading Node.js v${NODE_VERSION} for ${NODE_PLATFORM} (one-time download ~30MB)..."
    mkdir -p "$RUNTIME_DIR"

    NODE_URL="https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-${NODE_PLATFORM}.tar.gz"
    TARBALL="${RUNTIME_DIR}/node.tar.gz"

    # Try curl first, then wget
    if command -v curl &>/dev/null; then
      curl -fsSL --progress-bar "$NODE_URL" -o "$TARBALL"
    elif command -v wget &>/dev/null; then
      wget -q --show-progress "$NODE_URL" -O "$TARBALL"
    else
      err "Neither 'curl' nor 'wget' is available. Please install one and retry."
    fi

    step "Extracting Node.js..."
    tar -xzf "$TARBALL" -C "$RUNTIME_DIR"
    rm -f "$TARBALL"
    chmod +x "$NODE_CMD"
    done_ "Node.js v${NODE_VERSION} ready"
  fi

  # Make node/npm available for child processes (e.g. next CLI)
  export PATH="${NODE_DIR}/bin:$PATH"
fi

echo ""

# ── Install npm dependencies ──────────────────────────────────
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
  step "Installing dependencies (first run only — this may take a minute)..."
  "$NPM_CMD" install --prefer-offline --no-audit --no-fund 2>&1 \
    | grep -E "^(added|npm warn|ERR)" || true
  done_ "Dependencies installed"
else
  done_ "Dependencies already installed"
fi

# ── Ensure data directories exist ─────────────────────────────
mkdir -p data public/uploads
if [ ! -f "data/inventory.json" ]; then
  echo "[]" > data/inventory.json
  done_ "Created data/inventory.json"
else
  done_ "data/inventory.json found"
fi

# ── Launch ────────────────────────────────────────────────────
echo ""
echo -e "  ${BOLD}🚀  Starting Inventory Manager${NC}"
echo -e "  ${DIM}─────────────────────────────────────${NC}"
echo -e "  ${GREEN}URL:${NC}  ${BOLD}http://localhost:3000${NC}"
echo -e "  ${DIM}Press Ctrl+C to stop the server${NC}"
echo ""

"$NPM_CMD" run dev
