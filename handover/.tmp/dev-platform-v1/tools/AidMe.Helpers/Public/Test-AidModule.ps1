function Test-AidModule {
  [CmdletBinding()] param()
  $required = @(
    'Invoke-ZipAudit','Invoke-ZipStage','Invoke-ZipSuggestRefactor','New-AidMeHandover',
    'Write-AidNote','Start-AidControlCenter','Verify-AidSetup','Add-AidIndexEntry','New-AidSnapshot','Invoke-AidReportCleanup'
  )
  $rows = foreach($n in $required){
    [pscustomobject]@{ Function=$n; Present=[bool](Get-Command $n -ErrorAction SilentlyContinue) }
  }
  $rows | Format-Table -AutoSize
  if($rows.Present -contains $false){
    $missing = ($rows | Where-Object { -not $_.Present }).Function -join ', '
    throw "Manglende funksjoner: $missing"
  }
  Write-Host "✅ AidMe.Helpers OK" -ForegroundColor Green
}
