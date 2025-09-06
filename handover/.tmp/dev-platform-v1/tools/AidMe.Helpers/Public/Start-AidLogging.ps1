function Start-AidLogging {
  param([string]$Root="C:\Dev\my-camino")
  if ($script:AidTranscriptActive) { Write-Host "Log already running." -ForegroundColor Yellow; return }
  $dir = Join-Path $Root 'handover\logs'
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $script:AidLogFile = Join-Path $dir ("control-{0:yyyyMMdd-HHmmss}.txt" -f (Get-Date))
  Start-Transcript -Path $script:AidLogFile -Force | Out-Null
  $script:AidTranscriptActive = $true
  Write-Host "Logging → $script:AidLogFile" -ForegroundColor Yellow
}
