[CmdletBinding()]
param(
  [string]$DbName = 'indusscript_ai',
  [string]$DbUser = 'indusscript'
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
function Invoke-Compose {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
  & docker compose @Arguments
  if ($LASTEXITCODE -ne 0) { throw "docker compose failed with exit code $LASTEXITCODE" }
}
Push-Location $repoRoot
try {
  Invoke-Compose exec -T postgres pg_isready -U $DbUser -d $DbName
  Invoke-Compose exec -T postgres psql -v ON_ERROR_STOP=1 -U $DbUser -d $DbName -c "SELECT count(*) AS applied_migrations FROM schema_migrations; SELECT count(*) AS demo_inscriptions FROM inscriptions WHERE record_scope = 'demo';"
}
finally {
  Pop-Location
}
