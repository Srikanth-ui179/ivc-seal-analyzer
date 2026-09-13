# cisi-ingest.ps1
# PowerShell wrapper for the CISI corpus ingestion runner.
# Reads DATABASE_URL from the .env file if not already set in the environment.

param(
    [switch]$DryRun,
    [switch]$Promote
)

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$EnvFile  = Join-Path $RepoRoot ".env"

if (-not $env:DATABASE_URL -and (Test-Path $EnvFile)) {
    foreach ($line in (Get-Content $EnvFile)) {
        if ($line -match '^\s*DATABASE_URL\s*=\s*(.+)$') {
            $env:DATABASE_URL = $Matches[1].Trim().Trim('"').Trim("'")
        }
    }
}

if (-not $env:DATABASE_URL) {
    Write-Error "DATABASE_URL is not set. Configure it in .env or as an environment variable."
    exit 1
}

$ScriptPath = Join-Path $RepoRoot "scripts\ingest-cisi-corpus.mjs"

$NodeArgs = @($ScriptPath)
if ($DryRun)  { $NodeArgs += "--dry-run" }
if ($Promote) { $NodeArgs += "--promote" }

Write-Host "Running: node $($NodeArgs -join ' ')"
& node @NodeArgs
exit $LASTEXITCODE
