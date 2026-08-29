[CmdletBinding()]
param(
  [string]$DbName = 'indusscript_ai',
  [string]$DbUser = 'indusscript',
  [int]$ReadyTimeoutSeconds = 90
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
function Invoke-DockerCompose {
  param([Parameter(Mandatory)][string[]]$ComposeArguments)
  & docker compose @ComposeArguments
  if ($LASTEXITCODE -ne 0) { throw "docker compose $($ComposeArguments -join ' ') failed with exit code $LASTEXITCODE" }
}

function Wait-ForPostgresHealth {
  param([Parameter(Mandatory)][int]$TimeoutSeconds)
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  do {
    $health = & docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' indusscript-ai-postgres 2>$null
    if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL container indusscript-ai-postgres was not found after docker compose up.' }
    if ($health -eq 'healthy') {
      Write-Host 'PostgreSQL is healthy.'
      return
    }
    if ($health -eq 'unhealthy') { throw 'PostgreSQL container reported an unhealthy status. Run: docker compose logs postgres' }
    Start-Sleep -Seconds 2
  } while ((Get-Date) -lt $deadline)
  throw "PostgreSQL did not become healthy within $TimeoutSeconds seconds. Run: docker compose logs postgres"
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw 'Docker CLI was not found on PATH. Install/start Docker Desktop, then open a new PowerShell session.'
}

Push-Location $repoRoot
try {
  # Use an explicit array so the detach option cannot be consumed by PowerShell's parameter parser.
  Invoke-DockerCompose -ComposeArguments @('up', '--detach', 'postgres')
  Wait-ForPostgresHealth -TimeoutSeconds $ReadyTimeoutSeconds
  Invoke-DockerCompose -ComposeArguments @('exec', '--no-TTY', 'postgres', 'psql', '-v', 'ON_ERROR_STOP=1', '-U', $DbUser, '-d', $DbName, '-c', 'CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());')

  $migrations = Get-ChildItem (Join-Path $repoRoot 'db/migrations') -Filter '*.sql' | Sort-Object Name
  foreach ($migration in $migrations) {
    $version = $migration.Name
    $applied = & docker compose exec --no-TTY postgres psql -U $DbUser -d $DbName -tAc "SELECT 1 FROM schema_migrations WHERE version = '$version'"
    if ($LASTEXITCODE -ne 0) { throw "Could not read schema_migrations (exit code $LASTEXITCODE)" }
    if ($applied -eq '1') {
      Write-Host "Skipping applied migration $version"
      continue
    }
    Write-Host "Applying $version"
    Invoke-DockerCompose -ComposeArguments @('exec', '--no-TTY', 'postgres', 'psql', '-v', 'ON_ERROR_STOP=1', '-U', $DbUser, '-d', $DbName, '-f', "/workspace/db/migrations/$version")
    Invoke-DockerCompose -ComposeArguments @('exec', '--no-TTY', 'postgres', 'psql', '-v', 'ON_ERROR_STOP=1', '-U', $DbUser, '-d', $DbName, '-c', "INSERT INTO schema_migrations (version) VALUES ('$version');")
  }
}
finally {
  Pop-Location
}
