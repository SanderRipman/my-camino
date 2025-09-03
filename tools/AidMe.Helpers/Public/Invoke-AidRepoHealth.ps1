function Invoke-AidRepoHealth {
  param([string]$Root="C:\Dev\my-camino")
  Write-Host "== Repo Health ==" -ForegroundColor Cyan
  git status
  try {
    Install-Module PSScriptAnalyzer -Scope CurrentUser -Force | Out-Null
    Write-Host "-- PSScriptAnalyzer (tools/AidMe.Helpers) --" -ForegroundColor Cyan
    Invoke-ScriptAnalyzer -Path (Join-Path $Root 'tools\AidMe.Helpers') -Recurse -Severity Warning,Error
  } catch { Write-Warning "PSScriptAnalyzer feilet: $_" }
  try {
    Install-Module Pester -Scope CurrentUser -Force | Out-Null
    if (Test-Path (Join-Path $Root 'tests')) { Push-Location $Root; Invoke-Pester -CI; Pop-Location }
    else { Write-Host "No tests folder (OK, valgfritt)" -ForegroundColor DarkGray }
  } catch { Write-Warning "Pester feilet: $_" }
}
