function New-Feature {
  [CmdletBinding()] param([Parameter(Mandatory)][string]$Name)
  Set-Location "C:\Dev\my-camino"
  git checkout dev | Out-Host
  git pull --ff-only | Out-Host
  $Branch = "feat/" + ($Name -replace '\s+','-').ToLower()
  git checkout -b $Branch | Out-Host
  git push -u origin $Branch | Out-Host
  Write-Host "Feature-branch: $Branch" -ForegroundColor Green
  Write-Host "Åpne PR: https://github.com/SanderRipman/my-camino/compare/dev...$Branch?expand=1" -ForegroundColor Yellow
}
