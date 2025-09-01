function Start-AidMeMenu {
  [CmdletBinding()] param()
  $repo = "C:\Dev\my-camino"
  if (-not (Test-Path $repo)) { Write-Host "Repo ikke funnet: $repo" -ForegroundColor Red; return }
  while ($true) {
    Clear-Host
    Write-Host "AidMe Kontrollsenter`n" -ForegroundColor Cyan
    "1) Open repo (git status)
2) Ny feature-branch → feat/<navn>
3) Lag release-tag vX.Y.Z
4) Helsesjekk
5) Kjør auto-push nå (til dev)
S) Snapshot (lag ny handover.zip)
F) Favicons: generer på nytt
Q) Avslutt" | Write-Host
    $c = (Read-Host "Velg").ToUpper()
    switch ($c) {
      '1' { Open-Repo }
      '2' { $n=Read-Host 'Kort navn'; if($n){ New-Feature -Name $n } }
      '3' { $v=Read-Host 'vX.Y.Z'; $n=Read-Host 'Kort notat'; if($v -and $n){ Release -Version $v -Notes $n } }
      '4' { HealthCheck }
      '5' { Invoke-AutoPush -Branch 'dev' }
      'S' { $k=Read-Host 'ChatKey (f.eks dev-platform)'; if(!$k){$k='dev-platform'}; New-AidMeHandover -ChatKey $k }
      'F' {
        $src = Read-Host 'Full sti til logo (PNG)'
        if (Test-Path $src) { New-Favicons -Src $src } else { Write-Host 'Fant ikke fil' -ForegroundColor Red }
      }
      'Q' { break }
      default { }
    }
    if ($c -ne 'Q') { Read-Host "`nEnter for meny..." | Out-Null }
  }
}
Set-Alias aid Start-AidMeMenu
