function New-AidSnapshot {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory)][string]$ChatKey,
    [Parameter(Mandatory)][string]$Root
  )
  $outDir = Join-Path $Root 'handover'
  if(-not(Test-Path $outDir)){ New-Item -ItemType Directory -Force -Path $outDir | Out-Null }
  $paths = @("$Root\tools","$Root\scripts","$Root\.github\workflows","$Root\README.md") | Where-Object { Test-Path $_ }
  if(-not $paths){ throw "Ingen paths å pakke" }
  $zip = Join-Path $outDir "$ChatKey-handover.zip"
  if(Test-Path $zip){ Remove-Item $zip -Force }
  Compress-Archive -Path $paths -DestinationPath $zip -Force
  Add-AidIndexEntry -ChatKey $ChatKey -ZipPath $zip
  Write-Host "Snapshot: $zip" -ForegroundColor Green
}
