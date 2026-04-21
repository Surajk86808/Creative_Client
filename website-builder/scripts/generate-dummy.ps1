param(
  [string]$Template = "global-website/restaurant-cafe",
  [string]$ShopId = "DUMMY_001",
  [string]$ShopName = "Demo Business",
  [string]$Category = "General Business",
  [string]$City = "Your City",
  [string]$Address = "123 Main Street, Your City",
  [string]$Phone = "+1 (555) 010-0000",
  [string]$Email = "hello@example.com"
)

$ErrorActionPreference = "Stop"

function Copy-DirSkip {
  param(
    [Parameter(Mandatory=$true)][string]$Source,
    [Parameter(Mandatory=$true)][string]$Dest,
    [Parameter(Mandatory=$true)][string[]]$SkipDirNames
  )

  if (-not (Test-Path -LiteralPath $Dest)) {
    New-Item -ItemType Directory -Path $Dest | Out-Null
  }

  Get-ChildItem -LiteralPath $Source -Force | ForEach-Object {
    $from = $_.FullName
    $to = Join-Path $Dest $_.Name

    if ($_.PSIsContainer) {
      if ($SkipDirNames -contains $_.Name) { return }
      Copy-DirSkip -Source $from -Dest $to -SkipDirNames $SkipDirNames
      return
    }

    Copy-Item -LiteralPath $from -Destination $to -Force
  }
}

$root = (Get-Location).Path
$templateAbs = if ([System.IO.Path]::IsPathRooted($Template)) { $Template } else { Join-Path $root $Template }
if (-not (Test-Path -LiteralPath $templateAbs)) {
  throw "Template folder not found: $templateAbs"
}

$outputRoot = Join-Path $root "output"
if (-not (Test-Path -LiteralPath $outputRoot)) {
  New-Item -ItemType Directory -Path $outputRoot | Out-Null
}

$outputFolder = Join-Path $outputRoot $ShopId
if (Test-Path -LiteralPath $outputFolder) {
  Remove-Item -LiteralPath $outputFolder -Recurse -Force
}

$skip = @("node_modules", "dist", ".git", "build", "coverage", ".npm-cache")
Copy-DirSkip -Source $templateAbs -Dest $outputFolder -SkipDirNames $skip

$tagline = "Trusted $Category services in $City"
$aboutText = "$ShopName provides professional $Category services for customers in $City. We focus on quality, clear communication, and great results. Call $Phone to get started."
$service1 = "Consultation"
$service2 = "On-site Service"
$service3 = "Ongoing Support"
$metaTitle = ("$ShopName $City | $Category").Substring(0, [Math]::Min(60, ("$ShopName $City | $Category").Length))

$replacements = @{
  SHOP_ID = $ShopId
  SHOP_NAME = $ShopName
  CATEGORY = $Category
  CITY = $City
  ADDRESS = $Address
  PHONE = $Phone
  EMAIL = $Email
  TAGLINE = $tagline
  ABOUT_TEXT = $aboutText
  SERVICE_1 = $service1
  SERVICE_2 = $service2
  SERVICE_3 = $service3
  META_TITLE = $metaTitle
}

$textExt = @(".html",".htm",".css",".js",".ts",".tsx",".json",".md",".txt")
$files = Get-ChildItem -LiteralPath $outputFolder -Recurse -File | Where-Object { $textExt -contains $_.Extension.ToLowerInvariant() }

$pattern = [regex]"(?:\{\{|\[\[)([A-Z_]+)(?:\}\}|\]\])"
foreach ($f in $files) {
  $raw = Get-Content -LiteralPath $f.FullName -Raw
  if (-not $pattern.IsMatch($raw)) { continue }
  $out = $pattern.Replace($raw, {
    param($m)
    $name = $m.Groups[1].Value
    if ($replacements.ContainsKey($name)) { return [string]$replacements[$name] }
    return $m.Value
  })
  if ($out -ne $raw) {
    Set-Content -LiteralPath $f.FullName -Value $out -Encoding utf8
  }
}

# Keep metadata.json consistent if present (same behavior as src/filler.js)
$metaPath = Join-Path $outputFolder "metadata.json"
if (Test-Path -LiteralPath $metaPath) {
  try {
    $parsed = Get-Content -LiteralPath $metaPath -Raw | ConvertFrom-Json
    $parsed.name = $ShopName
    $parsed.description = $aboutText
    ($parsed | ConvertTo-Json -Depth 10) + "`n" | Set-Content -LiteralPath $metaPath -Encoding utf8
  } catch {
    Write-Warning "metadata.json update failed: $($_.Exception.Message)"
  }
}

Write-Host "Generated dummy website at: $outputFolder"
Write-Host "To preview a Vite template:"
Write-Host "  cd `"$outputFolder`""
Write-Host "  npm install"
Write-Host "  npm run dev"
