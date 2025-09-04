function Get-AidLatestCapture { [CmdletBinding()]
  param([Parameter(Mandatory)][string]$ChatKey,[string]$Root="C:\Dev\my-camino")
  $dir = Join-Path $Root "handover\captures\$ChatKey"
  if (-not (Test-Path $dir)) { throw "Ingen captures-katalog for $ChatKey ($dir)" }
  $f = Get-ChildItem $dir -Filter *.md -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if (-not $f) { throw "Fant ingen .md i $dir" }
  $f.FullName
}
