function Invoke-ZipStage {
  [CmdletBinding()] param(
    [Parameter(Mandatory)][string]$ZipPath,
    [Parameter(Mandatory)][string]$ChatKey
  )
  try { $null = [System.IO.Compression.ZipFile] } catch { try { Add-Type -AssemblyName System.IO.Compression.FileSystem } catch {} }

  $Root  = "C:\Dev\my-camino"
  $Stage = Join-Path $Root "_staging"
  $destRoot = Join-Path $Stage $ChatKey
  New-Item -ItemType Directory -Path $destRoot -EA SilentlyContinue | Out-Null

  if(!(Test-Path $ZipPath)){ throw "Fant ikke $ZipPath" }
  $zf = [System.IO.Compression.ZipFile]::OpenRead($ZipPath)

  Write-Host "Velg hva som skal stages fra: $ZipPath" -ForegroundColor Cyan
  $all = $zf.Entries | Where-Object { -not $_.FullName.EndsWith('/') }
  $i=0
  $menu = $all | ForEach-Object { "{0,3}) {1}" -f (++$i), $_.FullName }
  $menu | Select-Object -First 40 | ForEach-Object { $_ | Out-Host }
  Write-Host "(viser inntil 40 først; du kan skrive mønster f.eks. 'tools/*' eller tall med komma '1,2,15')" -ForegroundColor DarkGray
  $pick = Read-Host "Valg (mønster eller tall)"

  $targets = @()
  if($pick -match '^\d'){
    $nums = $pick -split ',' | ForEach-Object { [int]($_.Trim()) }
    foreach($n in $nums){ $targets += $all[$n-1] }
  }else{
    $pat = $pick.Replace('\','/').ToLower()
    $targets = $all | Where-Object { $_.FullName.ToLower() -like $pat }
  }

  foreach($e in $targets){
    $dest = Join-Path $destRoot $e.FullName
    New-Item -ItemType Directory -Path (Split-Path $dest -Parent) -Force -EA SilentlyContinue | Out-Null
    $fs = [System.IO.FileStream]::new($dest,[System.IO.FileMode]::Create,[System.IO.FileAccess]::Write)
    $es = $e.Open(); $es.CopyTo($fs); $fs.Close(); $es.Close()
    Write-Host "  -> $($e.FullName) → $destRoot" -ForegroundColor Green
  }
  $zf.Dispose()
  Write-Host "✅ Ferdig. Gå gjennom _staging\$ChatKey og flytt videre ved behov." -ForegroundColor Green
}
