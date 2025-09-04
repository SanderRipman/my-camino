function Rename-AidChatKey {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory)][string]$Old,
    [Parameter(Mandatory)][string]$New,
    [string]$Root = "C:\Dev\my-camino"
  )
  $idx = Join-Path $Root 'AidMe-Index.md'
  $notesOld = Join-Path $Root "handover\$Old-notes.md"
  $notesNew = Join-Path $Root "handover\$New-notes.md"
  $zipOld   = Join-Path $Root "handover\$Old-handover.zip"
  $zipNew   = Join-Path $Root "handover\$New-handover.zip"

  if (Test-Path $notesOld) { Rename-Item $notesOld $notesNew -Force }
  if (Test-Path $zipOld)   { Rename-Item $zipOld   $zipNew   -Force }

  if (Test-Path $idx) {
    $md = Get-Content -Raw $idx
    $lineNew = "| $New | $(Get-Date -Format 'yyyy-MM-dd HH:mm') | handover\$New-handover.zip |"
    if ($md -match "^\|\s*$([regex]::Escape($Old))\s*\|.*$") {
      $md = $md -replace "^\|\s*$([regex]::Escape($Old))\s*\|.*$", $lineNew
    } else {
      $md = $md + "`r`n" + $lineNew
    }
    Set-Content -Path $idx -Value $md -Encoding UTF8
  }
  Write-Host "✅ Omdøpt $Old → $New" -ForegroundColor Green
}
