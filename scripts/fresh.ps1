#!/usr/bin/env pwsh
# ----------------------------------------------------------------------
# scripts/fresh.ps1 — nuke .next cache + restart dev server
#
# Use this when:
#   - The site loads but every button is dead
#   - HMR shows "performing full reload because your application had
#     an unrecoverable error"
#   - /_next/static/chunks/main-app.js returns HTTP 500
#
# Symptom: HTML pages return 200 but nothing is interactive — React
# never hydrates because the JS bundles can't be served. The .next
# webpack cache is corrupted (happens after batch edits).
# ----------------------------------------------------------------------
$ErrorActionPreference = "Stop"
$env:ANTHROPIC_API_KEY = $null  # Claude Code injects an empty key, kill it

Set-Location -Path (Split-Path -Parent $PSScriptRoot)

Write-Host "🔪 Killing dev server on port 3000..." -ForegroundColor Yellow
$conn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($conn) {
    Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

Write-Host "🗑️  Removing .next cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

Write-Host "🚀 Starting fresh dev server..." -ForegroundColor Green
npm run dev
