param([switch]$Fix)
$Root = "C:\Dev\my-camino"
$Files = @(
  ".gitattributes",".gitignore","README.md","CHANGELOG.md","demo-data.json",
  "index.html","tools\auto-push.ps1","tools\favicons.ps1",".github\workflows\release-pr.yml"
)
Write-Host "== Sjekker handover i $Root ==" -ForegroundColor Cyan
$ok=$true
foreach($f in $Files){
  $p=Join-Path $Root $f
  if(Test-Path $p){ Write-Host "✔ $f" -ForegroundColor Green }
  else{
    Write-Host "⚠ $f mangler" -ForegroundColor Yellow; $ok=$false
    if($Fix){
      $dir = Split-Path $p -Parent
      if(-not(Test-Path $dir)){ New-Item -ItemType Directory -Path $dir -Force | Out-Null }
      "" | Out-File $p -Encoding utf8
      Write-Host "  -> placeholder laget" -ForegroundColor DarkYellow
    }
  }
}
if($ok){ Write-Host "✅ Alt på plass" -ForegroundColor Green }
else   { Write-Host "⚠ Noe mangler – bruk -Fix eller pakk ut handover-zip" -ForegroundColor Yellow }
