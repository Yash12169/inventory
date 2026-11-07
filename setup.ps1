# ═══════════════════════════════════════════════════════════════
#  Inventory Manager — Universal Setup & Start Script (Windows)
#  Works with or without Node.js installed.
#
#  How to run (choose one):
#    1. Right-click setup.ps1 → "Run with PowerShell"
#    2. In PowerShell:  powershell -ExecutionPolicy Bypass -File setup.ps1
#    3. In cmd.exe:     powershell -ExecutionPolicy Bypass -File setup.ps1
# ═══════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$NODE_VERSION = "20.19.2"   # LTS — change here to upgrade

# ── Navigate to script directory ──────────────────────────────
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# ── Helper functions ──────────────────────────────────────────
function Write-Step  { param($msg) Write-Host "  -> $msg" -ForegroundColor Cyan }
function Write-Done  { param($msg) Write-Host "  OK $msg" -ForegroundColor Green }
function Write-Warn  { param($msg) Write-Host "  !! $msg" -ForegroundColor Yellow }
function Write-Err   { param($msg) Write-Host "  XX $msg" -ForegroundColor Red; exit 1 }

# ── Header ────────────────────────────────────────────────────
Clear-Host
Write-Host ""
Write-Host "  Inventory Manager" -ForegroundColor Cyan -NoNewline
Write-Host " (Windows Setup)" -ForegroundColor DarkGray
Write-Host "  ─────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

# ── Detect architecture ───────────────────────────────────────
$ARCH = if ([System.Environment]::Is64BitOperatingSystem) { "x64" } else {
  Write-Err "32-bit Windows is not supported. Please use a 64-bit system."
}

# ── Locate or download Node.js ────────────────────────────────
$NodeCmd = $null
$NpmCmd  = $null
$UseLocal = $false

try {
  $nodeVer = & node --version 2>$null
  if ($nodeVer -match "^v(\d+)") {
    $major = [int]$Matches[1]
    if ($major -lt 18) {
      Write-Warn "System Node.js is $nodeVer (too old). Downloading Node.js v$NODE_VERSION locally..."
      $UseLocal = $true
    } else {
      $NodeCmd = "node"
      $NpmCmd  = "npm"
      Write-Done "Node.js $nodeVer found on system"
    }
  }
} catch {
  $UseLocal = $true
}

if ($UseLocal -or -not $NodeCmd) {
  $RuntimeDir = Join-Path $ScriptDir ".node-runtime"
  $NodeDir    = Join-Path $RuntimeDir "node-v$NODE_VERSION-win-$ARCH"
  $NodeCmd    = Join-Path $NodeDir "node.exe"
  $NpmCmd     = Join-Path $NodeDir "npm.cmd"

  if (Test-Path $NodeCmd) {
    Write-Done "Using cached portable Node.js v$NODE_VERSION"
  } else {
    Write-Step "Downloading Node.js v$NODE_VERSION for Windows $ARCH (one-time ~30MB)..."
    New-Item -ItemType Directory -Force -Path $RuntimeDir | Out-Null

    $NodeUrl = "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-win-$ARCH.zip"
    $ZipPath = Join-Path $RuntimeDir "node.zip"

    try {
      # Try modern way first
      $ProgressPreference = 'SilentlyContinue'
      Invoke-WebRequest -Uri $NodeUrl -OutFile $ZipPath -UseBasicParsing
    } catch {
      Write-Err "Failed to download Node.js. Please check your internet connection and try again.`nError: $_"
    }

    Write-Step "Extracting Node.js..."
    Expand-Archive -Path $ZipPath -DestinationPath $RuntimeDir -Force
    Remove-Item $ZipPath
    Write-Done "Node.js v$NODE_VERSION ready"
  }

  # Add to PATH for this session
  $env:PATH = "$NodeDir;$env:PATH"
}

Write-Host ""

# ── Install npm dependencies ──────────────────────────────────
$PkgLock = Join-Path $ScriptDir "node_modules\.package-lock.json"
if (-not (Test-Path "node_modules") -or -not (Test-Path $PkgLock)) {
  Write-Step "Installing dependencies (first run only — may take a minute)..."
  & $NpmCmd install --prefer-offline --no-audit --no-fund
  Write-Done "Dependencies installed"
} else {
  Write-Done "Dependencies already installed"
}

# ── Ensure data directories exist ─────────────────────────────
New-Item -ItemType Directory -Force -Path "data"            | Out-Null
New-Item -ItemType Directory -Force -Path "public\uploads"  | Out-Null

$InventoryFile = Join-Path $ScriptDir "data\inventory.json"
if (-not (Test-Path $InventoryFile)) {
  "[]" | Set-Content $InventoryFile -Encoding UTF8
  Write-Done "Created data/inventory.json"
} else {
  Write-Done "data/inventory.json found"
}

# ── Launch ────────────────────────────────────────────────────
Write-Host ""
Write-Host "  Starting Inventory Manager..." -ForegroundColor Cyan
Write-Host "  ─────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  URL: http://localhost:3000" -ForegroundColor Green
Write-Host "  Press Ctrl+C to stop the server" -ForegroundColor DarkGray
Write-Host ""

# Open browser after a short delay
Start-Job -ScriptBlock {
  Start-Sleep -Seconds 4
  Start-Process "http://localhost:3000"
} | Out-Null

& $NpmCmd run dev
