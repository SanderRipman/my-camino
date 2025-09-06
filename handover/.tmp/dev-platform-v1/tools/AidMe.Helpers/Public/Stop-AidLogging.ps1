function Stop-AidLogging {
  if ($script:AidTranscriptActive) {
    try { Stop-Transcript | Out-Null } catch {}
    Write-Host "Logging stopped: $script:AidLogFile" -ForegroundColor Yellow
    $script:AidTranscriptActive = $false
    $script:AidLogFile = $null
  } else { Write-Host "No active log." }
}
