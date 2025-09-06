function Show-AidStatus {
  param([string]$Root="C:\Dev\my-camino",[string]$ChatKey="dev-platform-v1")
  Write-Host "=== Status ($ChatKey) ===" -ForegroundColor Cyan
  git status
  git remote -v
  git log --oneline -n 5
  $zip = Join-Path $Root "handover\$ChatKey-handover.zip"
  Write-Host ("ZIP: {0}" -f ($(if(Test-Path $zip){'✅ present'}else{'❌ missing'})))
  $idx = @("$Root\AidMe-Index.md","$Root\handover\..\AidMe-Index.md") | ? { Test-Path $_ } | Select-Object -First 1
  Write-Host ("Index: {0}" -f ($(if($idx){'✅ present'}else{'❌ missing'})))
}
