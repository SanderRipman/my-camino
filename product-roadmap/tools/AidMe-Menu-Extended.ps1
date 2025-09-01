param()
$Root = 'C:\Dev\my-camino'
Import-Module "$Root\tools\AidMe.Helpers\AidMe.Helpers.psd1" -Force
Write-Host "AidMe Kontrollsenter – utvidet" -ForegroundColor Cyan
Write-Host "Repo: $Root
"
Write-Host "Z) Vis ZIP-indeks (AidMe-Index.md)"
Write-Host "D) Diagnose alle ZIP-er (rapport)"
Write-Host "F) Forslag til refaktor (angi ZIP)"
Write-Host "X) Stage innhold fra ZIP → _staging\<chatkey>"
Write-Host "Q) Tilbake
"
$choice = (Read-Host "Velg").ToUpper()
switch ($choice) {
  'Z' { notepad "$Root\AidMe-Index.md" }
  'D' { Invoke-ZipAudit }
  'F' {
    $z = Read-Host "Full sti til ZIP (eller navn i .\handover\)"
    if ($z -and -not (Test-Path $z)) { $z = Join-Path $Root ("handover\"+$z) }
    if ($z){ Invoke-ZipSuggestRefactor -ZipPath $z }
  }
  'X' {
    $z = Read-Host "Full sti til ZIP (eller navn i .\handover\)"
    if ($z -and -not (Test-Path $z)) { $z = Join-Path $Root ("handover\"+$z) }
    $k = Read-Host "ChatKey (f.eks dev-platform)"
    if ($z -and $k) { Invoke-ZipStage -ZipPath $z -ChatKey $k }
  }
  default { }
}
