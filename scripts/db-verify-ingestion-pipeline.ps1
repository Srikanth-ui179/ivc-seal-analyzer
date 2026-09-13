[CmdletBinding()]
param(
  [string]$DbName = 'indusscript_ai',
  [string]$DbUser = 'indusscript'
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
function Invoke-DockerCompose {
  param([Parameter(Mandatory)][string[]]$ComposeArguments)
  & docker compose @ComposeArguments
  if ($LASTEXITCODE -ne 0) { throw "docker compose $($ComposeArguments -join ' ') failed with exit code $LASTEXITCODE" }
}

Push-Location $repoRoot
try {
  Invoke-DockerCompose -ComposeArguments @('exec', '--no-TTY', 'postgres', 'psql', '-v', 'ON_ERROR_STOP=1', '-U', $DbUser, '-d', $DbName, '-f', '/workspace/db/scripts/ingestion_pipeline_verify.sql')
}
finally {
  Pop-Location
}
