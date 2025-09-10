function Verify-AidSetup {
  [CmdletBinding()]
  param(
    [string]$Root="C:\Dev\my-camino",
    [string]$ChatKey="dev-platform-v1"
  )
  $ok = $true
  Write-Host "=== Verify-AidSetup ===" -ForegroundColor Cyan

  foreach($pair in @(@('gh','GitHub CLI'),@('netlify','Netlify CLI'))){
    $present = [bool](Get-Command $pair[0] -ErrorAction SilentlyContinue)
    Write-Host ("{0}: {1}" -f $pair[1], ($(if($present){'✅'}else{'❌'})))
    if(-not $present){ $ok=$false }
  }

  $wf = Join-Path $Root '.github\workflows'
  $haveWf = Test-Path $wf
  Write-Host ("Workflows folder: {0}" -f ($(if($haveWf){'✅'}else{'❌'})))
  if($haveWf){
    Get-ChildItem "$wf\*.yml" -ea 0 | Select Name,LastWriteTime | Format-Table -AutoSize | Out-Host
  } else { $ok=$false }

  $zip = Join-Path $Root "handover\$ChatKey-handover.zip"
  Write-Host ("Handover zip: {0}" -f ($(if(Test-Path $zip){'✅'}else{'❌'})))

  $idx = @("$Root\AidMe-Index.md","$Root\handover\..\AidMe-Index.md") | Where-Object { Test-Path $_ } | Select-Object -First 1
  Write-Host ("AidMe-Index.md: {0}" -f ($(if($idx){'✅'}else{'❌'})))

  if($ok){ Write-Host "✅ Setup OK" -ForegroundColor Green } else { Write-Warning "Noen mangler – se over" }
}
