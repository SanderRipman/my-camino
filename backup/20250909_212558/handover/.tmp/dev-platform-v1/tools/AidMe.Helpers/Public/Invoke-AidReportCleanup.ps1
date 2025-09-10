function Invoke-AidReportCleanup {
  [CmdletBinding()]
  param(
    [string]$Folder = "C:\Dev\my-camino\handover",
    [int]$Keep = 5,
    [int]$Days = 30
  )
  if(-not(Test-Path $Folder)){ return }
  $files = Get-ChildItem $Folder -Filter "*-report.json" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
  $toKeep = $files | Select-Object -First $Keep
  $toDelete = $files | Where-Object { $_ -notin $toKeep -and $_.LastWriteTime -lt (Get-Date).AddDays(-$Days) }
  $toDelete | Remove-Item -Force -ErrorAction SilentlyContinue
  Write-Host ("Ryddet {0} rapport(er)" -f ($toDelete | Measure-Object).Count) -ForegroundColor Yellow
}
