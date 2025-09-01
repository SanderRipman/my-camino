param()
using namespace System.IO.Compression
$Root   = "C:\Dev\my-camino"
$Rep    = Join-Path $Root "docs\reports"
$Stage  = Join-Path $Root "_staging"
$Index  = Join-Path $Root "AidMe-Index.md"
New-Item -ItemType Directory -Path $Rep,$Stage -ErrorAction SilentlyContinue|Out-Null

function Get-AidMeIndexLocal {
  $lines = Get-Content $Index
  $rows  = $lines | Where-Object { $_ -match '^\|\s*[^|]+' } | Where-Object { $_ -notmatch '^\|\s*-+' }
  foreach ($r in $rows) {
    $cols = ($r -split '\|')[1..3].ForEach{ $_.Trim() }
    # Støtt både fulle stier og kun filnavn (ligger i handover\)
    $zipPath = $cols[2]
    if ($zipPath -notmatch '^[A-Za-z]:\\' ) {
      $zipPath = Join-Path $Root "handover\$zipPath"
    }
    [pscustomobject]@{ ChatKey=$cols[0]; Updated=$cols[1]; Zip=$zipPath }
  }
}

$ts   = Get-Date -Format "yyyyMMdd-HHmm"
$csv  = Join-Path $Rep "zip-audit-$ts.csv"
$md   = Join-Path $Rep "zip-audit-$ts.md"

$rows = New-Object System.Collections.Generic.List[object]

foreach ($row in Get-AidMeIndexLocal) {
  $exists   = Test-Path $row.Zip
  $count    = 0
  $hasIdx   = $false
  $hasChg   = $false
  $hasTools = $false
  $zipDate  = $null
  if ($exists) {
    try {
      $zf = [IO.Compression.ZipFile]::OpenRead($row.Zip)
      $count = $zf.Entries.Count
      $hasIdx   = $zf.Entries.Name -contains "index.html"
      $hasChg   = $zf.Entries.Name -contains "CHANGELOG.md"
      $hasTools = ($zf.Entries | Where-Object { $_.FullName -like 'tools/*' }).Count -gt 0
      $hdr      = $zf.Entries | Where-Object { $_.FullName -match 'Handover_README\.txt$' } | Select-Object -First 1
      if ($hdr) {
        $sr = New-Object System.IO.StreamReader($hdr.Open())
        $txt= $sr.ReadToEnd()
        $sr.Close()
        $m = [regex]::Match($txt,'\d{4}-\d{2}-\d{2} \d{2}:\d{2}')
        if ($m.Success) { $zipDate = $m.Value }
      }
      $zf.Dispose()
    } catch {
      $exists = $false
    }
  }
  $rows.Add([pscustomobject]@{
    ChatKey   = $row.ChatKey
    ZipPath   = $row.Zip
    InIndex   = $true
    Exists    = $exists
    Entries   = $count
    IndexHtml = $hasIdx
    Changelog = $hasChg
    Tools     = $hasTools
    ZipStamp  = $zipDate
    IndexTime = $row.Updated
  })
}

$rows | Export-Csv -NoTypeInformation -Encoding UTF8 -Path $csv

$header = @"
# ZIP-audit $ts

| ChatKey | Exists | Entries | index.html | CHANGELOG.md | tools/ | ZipStamp | IndexTime | ZipPath |
|---|:---:|---:|:---:|:---:|:---:|---|---|---|
"@
$lines = foreach($r in $rows){
  "| {0} | {1} | {2} | {3} | {4} | {5} | {6} | {7} | {8} |" -f `
  $r.ChatKey, ($r.Exists?'✔':'❌'), $r.Entries, ($r.IndexHtml?'✔':'❌'), ($r.Changelog?'✔':'❌'), ($r.Tools?'✔':'❌'), ($r.ZipStamp??'-'), $r.IndexTime, $r.ZipPath
}
($header + ($lines -join "`r`n")) | Set-Content -Encoding UTF8 $md

Write-Host "✅ Rapport laget:" -ForegroundColor Green
Write-Host " - $csv"
Write-Host " - $md"
