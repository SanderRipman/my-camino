function Invoke-ZipStage {
  [CmdletBinding()]
  param(
    [string]$Root = "C:\Dev\my-camino",
    [string]$OutName = "aidme-handover-staging.zip"
  )
  $paths = @("$Root\tools","$Root\scripts","$Root\.github\workflows","$Root\README.md") | ? { Test-Path $_ }
  if(-not $paths){ throw "Ingen paths å pakke" }
  $out = Join-Path $Root $OutName
  if(Test-Path $out){ Remove-Item $out -Force }
  Compress-Archive -Path $paths -DestinationPath $out -Force
  Write-Host "Staging ZIP: $out" -ForegroundColor Green
}
