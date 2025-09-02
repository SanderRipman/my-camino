function Invoke-ZipSuggestRefactor {
  [CmdletBinding()]
  param([string]$Root = "C:\Dev\my-camino")
  Write-Host "== Forslag til refaktorering ==" -ForegroundColor Cyan
  $public = Join-Path $Root 'tools\AidMe.Helpers\Public'
  if(Test-Path $public){
    $files = Get-ChildItem $public -Filter *.ps1
    foreach($f in $files){
      $text = Get-Content -Raw $f.FullName
      if($text -match 'Write-Host'){
        Write-Host "• $($f.Name): Vurder mindre bruk av Write-Host → returner objekter, bruk Write-Verbose for støy." -ForegroundColor Yellow
      }
    }
  }
  $wf = Join-Path $Root '.github\workflows'
  if(Test-Path $wf){
    Get-ChildItem "$wf\*.yml" | %{
      if(-not (Select-String -Path $_.FullName -Pattern 'PSScriptAnalyzer' -Quiet)){
        Write-Host "• $($_.Name): Legg til PSScriptAnalyzer steg (kvalitetssikring)." -ForegroundColor Yellow
      }
    }
  }
  Write-Host "• Vurder Pester-tester i .\tests\ for modulfunksjoner." -ForegroundColor Yellow
}
