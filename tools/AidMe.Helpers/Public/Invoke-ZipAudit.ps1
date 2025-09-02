function Invoke-ZipAudit {
  [CmdletBinding()]
  param(
    [string]$Root = "C:\Dev\my-camino"
  )
  $zips = Get-ChildItem (Join-Path $Root 'handover\*-handover.zip') -ErrorAction SilentlyContinue
  if(-not $zips){ Write-Warning "Fant ingen handover-zip"; return }
  foreach($z in $zips){
    Write-Host "== $($z.Name) ==" -ForegroundColor Cyan
    try {
      $tmp = Join-Path $env:TEMP ([IO.Path]::GetFileNameWithoutExtension($z.Name) + "-list.txt")
      Expand-Archive -Path $z.FullName -DestinationPath $tmp -Force -ErrorAction Stop
      Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
      # Fallback: bare vis størrelse/tid dersom Expand-Archive ikke passer
      Write-Host ("Størrelse: {0:N0} bytes | Dato: {1}" -f $z.Length, $z.LastWriteTime)
    } catch {
      Write-Host ("Størrelse: {0:N0} bytes | Dato: {1}" -f $z.Length, $z.LastWriteTime)
    }
  }
}
