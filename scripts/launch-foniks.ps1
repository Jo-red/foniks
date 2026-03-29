param(
  [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$siteUrl = "http://localhost:3000/"
$nodeModulesPath = Join-Path $projectRoot "node_modules"
$databasePath = Join-Path $projectRoot "data\foniks.sqlite"
$seedPath = Join-Path $projectRoot "data\seed.json"

function Test-FoniksServer {
  try {
    $response = Invoke-WebRequest -Uri $siteUrl -UseBasicParsing -TimeoutSec 2
    return $response.StatusCode -eq 200
  } catch {
    return $false
  }
}

function Wait-ForFoniksServer {
  param(
    [int]$TimeoutSeconds = 40
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

  while ((Get-Date) -lt $deadline) {
    if (Test-FoniksServer) {
      return $true
    }

    Start-Sleep -Milliseconds 700
  }

  return $false
}

if (Test-FoniksServer) {
  Write-Host "FONIKS is already running."

  if (-not $NoBrowser) {
    Start-Process $siteUrl
  }

  exit 0
}

Set-Location -LiteralPath $projectRoot

if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
  throw "npm.cmd was not found on PATH."
}

$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue

if (-not $nodeCommand) {
  throw "node.exe was not found on PATH."
}

if (-not (Test-Path -LiteralPath $nodeModulesPath)) {
  Write-Host "Installing dependencies..."
  & npm.cmd install

  if ($LASTEXITCODE -ne 0) {
    throw "npm install failed."
  }
}

$needsDatabaseInit = -not (Test-Path -LiteralPath $databasePath)

if (-not $needsDatabaseInit -and (Test-Path -LiteralPath $seedPath)) {
  $needsDatabaseInit = (Get-Item -LiteralPath $seedPath).LastWriteTimeUtc -gt (Get-Item -LiteralPath $databasePath).LastWriteTimeUtc
}

if ($needsDatabaseInit) {
  Write-Host "Initializing database..."
  & npm.cmd run db:init -- --force

  if ($LASTEXITCODE -ne 0) {
    throw "Database initialization failed."
  }
}

Write-Host "Starting FONIKS server..."
Start-Process -FilePath $nodeCommand.Source -WorkingDirectory $projectRoot -ArgumentList "server.js" | Out-Null

if (-not (Wait-ForFoniksServer)) {
  throw "FONIKS did not become ready in time."
}

if (-not $NoBrowser) {
  Start-Process $siteUrl
}

Write-Host "FONIKS is ready at $siteUrl"
