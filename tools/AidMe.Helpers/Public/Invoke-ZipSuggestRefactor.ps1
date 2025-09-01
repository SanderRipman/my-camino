function Invoke-ZipSuggestRefactor {
  [CmdletBinding()] param([Parameter(Mandatory)][string]$ZipPath)
  try { $null = [System.IO.Compression.ZipFile] } catch { try { Add-Type -AssemblyName System.IO.Compression.FileSystem } catch {} }
  if(!(Test-Path $ZipPath)){ throw "Fant ikke $ZipPath" }

  $Root = "C:\Dev\my-camino"
  $Rep  = Join-Path $Root "docs\reports"
  New-Item -ItemType Directory -Path $Rep -EA SilentlyContinue | Out-Null

  function Guess-Key([string]$name,[string]$path){
    $p = ($name + ' ' + $path).ToLower()
    if($p -match 'github|action|ci|ps1|module|workflow') { return 'dev-platform' }
    if($p -match 'roadmap|feature|priorit')             { return 'product-roadmap' }
    if($p -match 'idé|ide|hypote|research|inspirasjon') { return 'ideer-lab' }
    if($p -match 'pilot|evaluering|studie')             { return 'pilot-studier' }
    if($p -match 'tilskudd|søknad|grant|partner')       { return 'partner-tilskudd' }
    if($p -match 'tur|camino|rute|kart|geo')            { return 'turplan-camino' }
    if($p -match 'artikkel|paper|studie|forsk')         { return 'forskning-studier' }
    'dev-platform'
  }

  $ts   = Get-Date -Format 'yyyyMMdd-HHmm'
  $out  = Join-Path $Rep ("zip-refactor-$ts.md")
  $zf   = [System.IO.Compression.ZipFile]::OpenRead($ZipPath)
  $lines = @("# Refaktor-forslag: $ZipPath","", "| Fil | Foreslått chatkey |","|-----|--------------------|")
  foreach($e in $zf.Entries){
    if(-not $e.FullName.EndsWith('/')){
      $k = Guess-Key $e.Name $e.FullName
      $lines += "| $($e.FullName) | $k |"
    }
  }
  $zf.Dispose()
  $lines -join "`r`n" | Set-Content -Encoding UTF8 $out
  Write-Host "✅ Forslag skrevet til $out" -ForegroundColor Green
}
