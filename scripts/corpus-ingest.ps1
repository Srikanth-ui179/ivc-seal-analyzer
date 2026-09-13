[CmdletBinding()]
param(
  [switch]$DryRun,
  [switch]$Promote
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

Push-Location $repoRoot
try {
  $nodeArgs = @('scripts/ingest-corpus.mjs')
  if ($DryRun) { $nodeArgs += '--dry-run' }
  if ($Promote) { $nodeArgs += '--promote' }

  & node @nodeArgs
}
finally {
  Pop-Location
}
