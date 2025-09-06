function Add-AidIndexEntry {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory)][string]$ChatKey,
    [Parameter(Mandatory)][string]$ZipPath,
    [string]$IndexPath = "C:\Dev\my-camino\AidMe-Index.md"
  )
  if (-not (Test-Path $IndexPath)){
    $hdr = "# AidMe – Handover-oversikt`r`n| ChatKey       | Sist oppdatert       | ZIP-sti |`r`n|---------------|----------------------|---------|"
    Set-Content -Path $IndexPath -Value $hdr -Encoding UTF8
  }
  $line = "| $ChatKey | $(Get-Date -Format 'yyyy-MM-dd HH:mm') | $ZipPath |"
  $md = Get-Content -Raw $IndexPath
  if ($md -notmatch "^\|\s*$([regex]::Escape($ChatKey))\s*\|" ) {
    Add-Content -Path $IndexPath -Value $line
  } else {
    $md = $md -replace "^\|\s*$([regex]::Escape($ChatKey))\s*\|.*$", $line
    Set-Content -Path $IndexPath -Value $md -Encoding UTF8
  }
  Write-Host "Index oppdatert: $ChatKey" -ForegroundColor Green
}
