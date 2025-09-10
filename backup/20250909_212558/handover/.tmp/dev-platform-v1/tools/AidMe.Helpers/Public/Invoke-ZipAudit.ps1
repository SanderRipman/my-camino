function Invoke-ZipAudit {
  [CmdletBinding()] param([string]$Root = "C:\Dev\my-camino")
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $zips = Get-ChildItem (Join-Path $Root 'handover\*-handover.zip') -ea 0 | Sort-Object LastWriteTime -Descending
  if(-not $zips){ Write-Warning "Fant ingen handover-zip"; return }
  foreach($z in $zips){
    Write-Host "== $($z.Name) ==" -ForegroundColor Cyan
    try {
      $za = [IO.Compression.ZipFile]::OpenRead($z.FullName)
      $za.Entries | Sort-Object FullName | Select-Object @{n='Entry';e={$_.FullName}}, Length, LastWriteTime |
        Format-Table -AutoSize | Out-Host
      $za.Dispose()
    } catch { Write-Host ("Størrelse: {0:N0} bytes | Dato: {1}" -f $z.Length, $z.LastWriteTime) }
    Write-Host ""
  }
}
