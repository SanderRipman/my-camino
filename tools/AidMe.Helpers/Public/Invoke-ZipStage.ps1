param([Parameter(Mandatory)][string]$ZipPath,[Parameter(Mandatory)][string]$ChatKey)
using namespace System.IO.Compression
$stage = Join-Path "C:\Dev\my-camino\_staging" $ChatKey
New-Item -ItemType Directory -Path $stage -ErrorAction SilentlyContinue|Out-Null
if(!(Test-Path $ZipPath)){ throw "Fant ikke $ZipPath" }

$zf = [IO.Compression.ZipFile]::OpenRead($ZipPath)

Write-Host "Velg hva som skal stages fra: $ZipPath" -ForegroundColor Cyan
$all = $zf.Entries | Where-Object { -not $_.FullName.EndsWith('/') }
$i=0
$menu = $all | ForEach-Object {
  "{0,3}) {1}" -f (++$i), $_.FullName
}
$menu | Select-Object -First 40 | ForEach-Object { $_ | Out-Host }
Write-Host "(viser inntil 40 først; du kan skrive mønster f.eks. 'tools/*' eller tall med komma '1,2,15')" -ForegroundColor DarkGray
$pick = Read-Host "Valg (mønster eller tall)"
$targets = @()
if($pick -match '^\d'){
  $nums = $pick -split ',' | ForEach-Object { [int]($_.Trim()) }
  $targets = forEach($n in $nums){ $all[$n-1] }
}else{
  $pat = $pick.Replace('\','/').ToLower()
  $targets = $all | Where-Object { $_.FullName.ToLower() -like $pat }
}
foreach($e in $targets){
  $dest = Join-Path $stage $e.FullName
  New-Item -ItemType Directory -Path (Split-Path $dest -Parent) -Force -ErrorAction SilentlyContinue|Out-Null
  $fs = New-Object System.IO.FileStream($dest,[System.IO.FileMode]::Create,[System.IO.FileAccess]::Write)
  $es = $e.Open()
  $es.CopyTo($fs)
  $fs.Close(); $es.Close()
  Write-Host "  -> $($e.FullName) → $stage" -ForegroundColor Green
}
$zf.Dispose()
Write-Host "✅ Ferdig. Gå gjennom _staging\$ChatKey og flytt videre manuelt ved behov." -ForegroundColor Green
