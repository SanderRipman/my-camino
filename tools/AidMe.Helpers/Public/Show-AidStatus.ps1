function Show-AidStatus {
  [CmdletBinding()]
  param([string]$Root="C:\Dev\my-camino",[string]$ChatKey="dev-platform-v1")
  $zip = Join-Path $Root "handover\$ChatKey-handover.zip"
  Write-Host "=== Status ($ChatKey) ===" -ForegroundColor Cyan
  & git -C $Root status --porcelain=v1 -b 2>$null | Out-Host
  & git -C $Root remote -v 2>$null | Out-Host
  & git -C $Root log --oneline -n 5 2>$null | Out-Host
  Write-Host ("ZIP: {0} present" -f ($(Test-Path $zip) ? '✅' : '❌'))
  $idx = Join-Path $Root 'AidMe-Index.md'
  Write-Host ("Index: {0} present" -f ($(Test-Path $idx) ? '✅' : '❌'))
}
