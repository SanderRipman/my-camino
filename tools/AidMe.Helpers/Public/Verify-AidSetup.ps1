function Verify-AidSetup {
  [CmdletBinding()] param([string]$Root="C:\Dev\my-camino",[string]$ChatKey="dev-platform-v1")
  Write-Host "=== Verify-AidSetup ===" -ForegroundColor Cyan
  Write-Host ("GitHub CLI: {0}" -f ((Get-Command gh -ea 0) ? '✅' : '❌'))
  Write-Host ("Netlify CLI: {0}" -f ((Get-Command netlify -ea 0) ? '✅' : '❌'))
  $wf = Join-Path $Root '.github\workflows'
  Write-Host ("Workflows folder: {0}`n" -f ((Test-Path $wf) ? '✅' : '❌'))
  if (Test-Path $wf) { Get-ChildItem "$wf\*.yml" | Select Name,LastWriteTime | Format-Table -AutoSize | Out-Host }
  $zip = Join-Path $Root "handover\$ChatKey-handover.zip"
  Write-Host ("`nHandover zip: {0}" -f ((Test-Path $zip) ? '✅' : '❌'))
  $idx = Join-Path $Root 'AidMe-Index.md'
  Write-Host ("AidMe-Index.md: {0}" -f ((Test-Path $idx) ? '✅' : '❌'))
  if ((Get-Command git -ea 0)) {
    & git -C $Root rev-parse --abbrev-ref HEAD 2>$null | % { Write-Host "Branch: $_" }
  }
  Write-Host "✅ Setup OK"
}
