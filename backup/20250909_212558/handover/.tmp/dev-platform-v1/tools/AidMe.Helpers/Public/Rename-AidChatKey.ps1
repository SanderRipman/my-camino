function Rename-AidChatKey {
  [CmdletBinding()]
  param([Parameter(Mandatory)][string]$Old,[Parameter(Mandatory)][string]$New,[string]$Root="C:\Dev\my-camino")
  $idx = Join-Path $Root 'AidMe-Index.md'
  if (Test-Path $idx) {
    $md = Get-Content -Raw $idx
    $md = $md -replace "^\|\s*$([regex]::Escape($Old))\s*\|","| $New |"
    Set-Content -Path $idx -Value $md -Encoding UTF8
  }
  $oldZip = Join-Path $Root "handover\$Old-handover.zip"
  $newZip = Join-Path $Root "handover\$New-handover.zip"
  if (Test-Path $oldZip) { Move-Item $oldZip $newZip -Force }
  $oldNotes = Join-Path $Root "handover\$Old-notes.md"
  $newNotes = Join-Path $Root "handover\$New-notes.md"
  if (Test-Path $oldNotes) { Move-Item $oldNotes $newNotes -Force }
  Write-Host "ChatKey renamed: $Old → $New" -ForegroundColor Green
}
