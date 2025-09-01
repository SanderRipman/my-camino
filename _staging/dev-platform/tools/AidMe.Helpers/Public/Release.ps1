function Release {
  [CmdletBinding()] param([Parameter(Mandatory)][string]$Version,[Parameter(Mandatory)][string]$Notes)
  Set-Location "C:\Dev\my-camino"
  git checkout main | Out-Host
  git pull --ff-only | Out-Host
  $cl = Join-Path "C:\Dev\my-camino" "CHANGELOG.md"
  if (-not (Test-Path $cl)) { "" | Out-File $cl -Encoding utf8 }
  $date  = Get-Date -Format "yyyy-MM-dd"
  $entry = "## $Version ($date)`n- $Notes`n"
  ($entry + (Get-Content $cl -Raw)) | Out-File $cl -Encoding utf8
  git add CHANGELOG.md
  git commit -m "chore(release): $Version – $Notes"
  git tag $Version
  git push origin main --tags
  Write-Host "Tag $Version opprettet og pushet." -ForegroundColor Green
}
