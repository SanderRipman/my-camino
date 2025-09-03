if (-not (Get-Command Pause-Aid -ErrorAction SilentlyContinue)) {
  function Pause-Aid { Read-Host "Trykk Enter for å fortsette" | Out-Null }
}
if (-not (Test-Path variable:script:AidTranscriptActive)) { $script:AidTranscriptActive = $false }
function Start-AidLogging { param([string]$Root="C:\Dev\my-camino")
  if ($script:AidTranscriptActive) { return }
  $dir = Join-Path $Root 'handover\logs'; New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $log = Join-Path $dir ("session-{0:yyyyMMdd-HHmmss}.txt" -f (Get-Date))
  Start-Transcript -Path $log -Force | Out-Null; $script:AidTranscriptActive=$true
  Write-Host "Logging → $log" -ForegroundColor Yellow
}
function Stop-AidLogging {
  if (-not $script:AidTranscriptActive) { return }
  Stop-Transcript | Out-Null; $script:AidTranscriptActive=$false
  Write-Host "Logging avsluttet" -ForegroundColor Yellow
}
