function New-AidMeHandover {
  [CmdletBinding()]
  param(
    [string]$ChatKey = "dev-platform",
    [string]$OutDir  = "C:\Dev\my-camino\handover"
  )
  Set-Location "C:\Dev\my-camino"
  New-Item -ItemType Directory -Path $OutDir -ErrorAction SilentlyContinue | Out-Null
  $stamp = Get-Date -Format "yyyyMMdd-HHmm"
  $tmp   = Join-Path $OutDir "$ChatKey-$stamp"
  New-Item -ItemType Directory -Path $tmp | Out-Null

  Copy-Item -Recurse -Force -Path `
    ".gitattributes",".gitignore","README.md","CHANGELOG.md","index.html",
    "demo-data.json","public","tools","docs",".github" `
    -Destination $tmp -ErrorAction SilentlyContinue

  @"
AidMe handover – $ChatKey
Dato: $(Get-Date)
Innhold: kode/skript/workflows/dokumentasjon for rask videreføring (dev→main)
"@ | Out-File (Join-Path $tmp "Handover_README.txt") -Encoding UTF8

  $zip = Join-Path $OutDir "$ChatKey-handover.zip"
  if (Test-Path $zip) { Remove-Item $zip -Force }
  Compress-Archive -Path (Join-Path $tmp "*") -DestinationPath $zip
  Remove-Item -Recurse -Force $tmp

  # Oppdater felles indeks
  $idxPath = Join-Path "C:\Dev\my-camino" "AidMe-Index.md"
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm"
  $line = "| $ChatKey | $ts | $zip |"
  if (!(Test-Path $idxPath)) {
@"
# AidMe – Handover-oversikt
| ChatKey       | Sist oppdatert       | ZIP-sti |
|---------------|----------------------|---------|
$line
"@ | Out-File $idxPath -Encoding UTF8
  } else {
    $content = Get-Content $idxPath
    $other = $content | Where-Object {$_ -notmatch "^\|\s*$ChatKey\s*\|"}
    ($other + $line) | Out-File $idxPath -Encoding UTF8
  }

  Write-Host "✅ Laget: $zip" -ForegroundColor Green
  Write-Host "✅ Oppdatert: $idxPath" -ForegroundColor Green
}
