function New-AidSummaryPack {
  [CmdletBinding()]
  param([Parameter(Mandatory)][string]$ChatKey,[string]$Root="C:\Dev\my-camino")
  $capDir = Join-Path $Root "handover\captures\$ChatKey"
  $notes  = Join-Path $Root "handover\$ChatKey-notes.md"
  $outDir = Join-Path $Root "handover\out"; New-Item -ItemType Directory -Force -Path $outDir | Out-Null
  $out    = Join-Path $outDir ("Summary-$ChatKey-{0:yyyyMMdd-HHmmss}.md" -f (Get-Date))

  $lines = @("# Summary Pack — $ChatKey","")
  if (Test-Path $notes){
    $lines += "## Notes (siste)"
    $lines += (Get-Content $notes -Raw | Select-String -Pattern '####|\- ' -AllMatches).InputString
    $lines += ""
  }
  if (Test-Path $capDir){
    $files = Get-ChildItem $capDir -Filter *.md | Sort-Object LastWriteTime -Descending | Select-Object -First 6
    foreach($f in $files){
      $lines += "## Capture: $($f.Name)"
      $txt = Get-Content -Raw $f.FullName
      # Ta første 1200 tegn per capture
      if ($txt.Length -gt 1200) { $txt = $txt.Substring(0,1200) + ' …' }
      $lines += $txt
      $lines += ""
    }
  }
  Set-Content -Path $out -Value ($lines -join "`r`n") -Encoding UTF8
  Write-Host "📄 Summary klar: $out" -ForegroundColor Green
  try { Set-Clipboard -Path $out } catch {}
  Start-Process notepad.exe $out
}
