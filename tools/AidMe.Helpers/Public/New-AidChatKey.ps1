function New-AidChatKey {
  [CmdletBinding()]
  param([Parameter(Mandatory)][string]$ChatKey,[string]$Root="C:\Dev\my-camino",[switch]$Snapshot)
  $notes = Join-Path $Root "handover\$ChatKey-notes.md"
  if (-not (Test-Path (Split-Path $notes -Parent))) { New-Item -ItemType Directory -Force -Path (Split-Path $notes -Parent) | Out-Null }
  if (-not (Test-Path $notes)) { "# Notes ($ChatKey)`r`n" | Set-Content -Encoding UTF8 $notes }
  Write-Host "Opprettet notes for $ChatKey" -ForegroundColor Green
  if ($Snapshot) { New-AidSnapshot -ChatKey $ChatKey -Root $Root }
}
