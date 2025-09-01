function HealthCheck {
  [CmdletBinding()] param()
  Set-Location "C:\Dev\my-camino"
  Write-Host "=== HealthCheck ===" -ForegroundColor Cyan
  try { Write-Host ("pwsh: " + $PSVersionTable.PSEdition + " " + $PSVersionTable.PSVersion) } catch {}
  try { Write-Host ("git:  " + (git --version)) } catch {}
  try { Write-Host ("magick: " + ((magick -version | Select-String '^Version:' -SimpleMatch))) } catch {}
  git remote -v
  git branch -vv
  git status -s
}
