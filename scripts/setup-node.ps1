$ErrorActionPreference = "Stop"

param(
  [string] $Version = "22.11.0",
  [ValidateSet("win-x64", "win-arm64")]
  [string] $Platform = "win-x64"
)

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$toolsDir = Join-Path $repoRoot "tools\\node"
$distDir = Join-Path $toolsDir "dist"
$extractDir = Join-Path $distDir "node-v$Version-$Platform"
$currentDir = Join-Path $toolsDir "current"

New-Item -ItemType Directory -Force -Path $toolsDir | Out-Null
New-Item -ItemType Directory -Force -Path $distDir | Out-Null

$zipName = "node-v$Version-$Platform.zip"
$zipPath = Join-Path $distDir $zipName
$url = "https://nodejs.org/dist/v$Version/$zipName"

Write-Host "[setup-node] Downloading $url"
Invoke-WebRequest -Uri $url -OutFile $zipPath

if (Test-Path $extractDir) {
  Remove-Item -Recurse -Force $extractDir
}

Write-Host "[setup-node] Extracting to $extractDir"
Expand-Archive -Path $zipPath -DestinationPath $distDir -Force

if (-not (Test-Path (Join-Path $extractDir "node.exe"))) {
  throw "[setup-node] node.exe not found after extract: $extractDir"
}

if (Test-Path $currentDir) {
  Remove-Item -Recurse -Force $currentDir
}

Write-Host "[setup-node] Pointing tools\\node\\current -> $extractDir"
try {
  New-Item -ItemType Junction -Path $currentDir -Target $extractDir | Out-Null
} catch {
  Write-Host "[setup-node] Junction failed; copying files instead."
  Copy-Item -Recurse -Force -Path $extractDir -Destination $currentDir
}

Write-Host "[setup-node] Done."
Write-Host "[setup-node] Use: scripts\\node.cmd -v"
Write-Host "[setup-node] Use: scripts\\npm.cmd -v"
