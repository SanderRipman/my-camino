param()
$Root = "C:\Dev\my-camino"
Import-Module "$Root\tools\AidMe.Helpers\AidMe.Helpers.psd1" -Force
Write-Host "AidMe Kontrollsenter – utvidet" -ForegroundColor Cyan
Write-Host "Repo: $Root`n"
Write-Host "M) Migrer fra gammel chat (lim-inn → auto-forslag chatkey)"
Write-Host "N) Notepad-migrering (lag ett eller flere notater)"
Write-Host "B) Bulk-migrering fra _migrate\ (.txt filer)"
Write-Host "Z) Vis ZIP-indeks (AidMe-Index.md)"
Write-Host "D) Diagnose alle ZIP-er (rapport)"
Write-Host "F) Forslag til refaktor (angi ZIP)"
Write-Host "X) Stage innhold fra ZIP → _staging\<chatkey>"
Write-Host "A) SNAPSHOT alle chatkeys"
Write-Host "C) SNAPSHOT endret (heuristikk – hopper over hvis ingen lokale endringer)"
Write-Host "Q) Tilbake`n"
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
