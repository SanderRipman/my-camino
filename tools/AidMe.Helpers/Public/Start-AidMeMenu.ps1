function Start-AidMeMenu {
  [CmdletBinding()] param([string]$RepoRoot = "C:\Dev\my-camino")
  Set-Location $RepoRoot
  while ($true) {
    Clear-Host
    Write-Host "AidMe Kontrollsenter" -ForegroundColor Cyan
    Write-Host "1) Open repo (git status)"
    Write-Host "2) Ny feature-branch → feat/<navn>"
    Write-Host "3) Lag release-tag vX.Y.Z"
    Write-Host "4) Helsesjekk"
    Write-Host "5) Kjør auto-push nå (til dev)"
    Write-Host "S) Snapshot (angi ChatKey manuelt)"
    Write-Host "D) Snapshot: dev-platform"
    Write-Host "R) Snapshot: product-roadmap"
    Write-Host "I) Snapshot: ideer-lab"
    Write-Host "P) Snapshot: pilot-studier"
    Write-Host "T) Snapshot: partner-tilskudd"
    Write-Host "C) Snapshot: turplan-camino"
    Write-Host "F) Snapshot: forskning-studier"
    Write-Host "X) Utvidet migrering/vedlikehold"
    Write-Host "Q) Avslutt"
    $c = (Read-Host "`nVelg").ToUpper()
    switch ($c) {
      '1' { Open-Repo }
      '2' { $n=Read-Host 'Kort navn'; if($n){ New-Feature -Name $n } }
      '3' { $v=Read-Host 'vX.Y.Z'; $n=Read-Host 'Kort notat'; if($v -and $n){ Release -Version $v -Notes $n } }
      '4' { HealthCheck }
      '5' { Invoke-AutoPush -Branch 'dev' }
      'S' { $k=Read-Host 'ChatKey'; if($k){ New-AidMeHandover -ChatKey $k } }
      'D' { New-AidMeHandover -ChatKey 'dev-platform' }
      'R' { New-AidMeHandover -ChatKey 'product-roadmap' }
      'I' { New-AidMeHandover -ChatKey 'ideer-lab' }
      'P' { New-AidMeHandover -ChatKey 'pilot-studier' }
      'T' { New-AidMeHandover -ChatKey 'partner-tilskudd' }
      'C' { New-AidMeHandover -ChatKey 'turplan-camino' }
      'F' { New-AidMeHandover -ChatKey 'forskning-studier' }
      'X' { if (Get-Command Start-AidMeMenuExtended -ErrorAction SilentlyContinue) { Start-AidMeMenuExtended } else { Write-Host 'Utvidet meny ikke tilgjengelig.' -ForegroundColor Yellow } }
      'Q' { break }
      default { }
    }
  }
}
Set-Alias aid Start-AidMeMenu
