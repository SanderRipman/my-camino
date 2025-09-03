function Invoke-ZipSuggestRefactor {
  [CmdletBinding()] param([string]$Root = "C:\Dev\my-camino")
  Write-Host "== Forslag til refaktorering ==" -ForegroundColor Cyan
  $public = Join-Path $Root 'tools\AidMe.Helpers\Public'
  if(Test-Path $public){
    Get-ChildItem $public -Filter *.ps1 | %{
      $t = Get-Content -Raw $_.FullName
      if($t -match 'Write-Host'){ Write-Host "• $($_.Name): Vurder mindre Write-Host; returner objekt/Write-Verbose." -ForegroundColor Yellow }
    }
  }
  $wf = Join-Path $Root '.github\workflows'
  if(Test-Path $wf){
    Get-ChildItem "$wf\*.yml" | ? { -not (Select-String -Path $_.FullName -Pattern 'PSScriptAnalyzer' -Quiet) } |
      % { Write-Host "• $($_.Name): Legg til PSScriptAnalyzer-steg." -ForegroundColor Yellow }
  }
  Write-Host "• Vurder Pester-tester i .\tests\ for modulfunksjoner." -ForegroundColor Yellow
}
