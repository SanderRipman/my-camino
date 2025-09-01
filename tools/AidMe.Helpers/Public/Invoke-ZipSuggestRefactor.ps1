param([Parameter(Mandatory)][string]$ZipPath)
using namespace System.IO.Compression
function Guess-Key([string]$name,[string]$path){
  $p = ($name + ' ' + $path).ToLower()
  if($p -match 'github|action|ci|ps1|module|workflow') { return 'dev-platform' }
  if($p -match 'roadmap|feature|priorit')             { return 'product-roadmap' }
  if($p -match 'idé|ide|hypote|research|inspirasjon') { return 'ideer-lab' }
  if($p -match 'pilot|evaluering|studie')             { return 'pilot-studier' }
  if($p -match 'tilskudd|søknad|grant|partner')       { return 'partner-tilskudd' }
  if($p -match 'tur|camino|rute|kart|geo')            { return 'turplan-camino' }
  if($p -match 'artikkel|paper|studie|forsk')         { return 'forskning-studier' }
  return 'dev-platform'
}
if(!(Test-Path $ZipPath)){ throw "Fant ikke $ZipPath" }
$zf = [IO.Compression.ZipFile]::OpenRead($ZipPath)
$ts = Get-Date -Format "yyyyMMdd-HHmm"
$out= Join-Path "C:\Dev\my-camino\docs\reports" "zip-refactor-$ts.md"
$lines = @("# Refaktor-forslag: $ZipPath","")
$lines += "| Fil | Foreslått chatkey |"
$lines += "|-----|--------------------|"
foreach($e in $zf.Entries){
  if($e.FullName.EndsWith('/')){ continue }
  $k = Guess-Key $e.Name $e.FullName
  $lines += "| $($e.FullName) | $k |"
}
$zf.Dispose()
$lines -join "`r`n" | Set-Content -Encoding UTF8 $out
Write-Host "✅ Forslag skrevet til $out" -ForegroundColor Green
