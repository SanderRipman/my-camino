param([switch]$Fix)
$Root = "C:\Dev\my-camino"
$Files = @(
  ".gitattributes",".gitignore","README.md","CHANGELOG.md","demo-data.json",
  "index.html","tools\auto-push.ps1","tools\favicons.ps1",".github\workflows\release-pr.yml"
)
Write-Host "== Sjekker handover-pakken i $Root ==" -ForegroundColor Cyan
$ok=$true
foreach($f in $Files){
  $p = Join-Path $Root $f
  if(Test-Path $p){ Write-Host "✔ $f" -ForegroundColor Green }
  else{
    Write-Host "⚠ Mangler: $f" -ForegroundColor Yellow; $ok=$false
    if($Fix){
      $dir = Split-Path $p -Parent
      if(-not(Test-Path $dir)){ New-Item -ItemType Directory -Path $dir -Force | Out-Null }
      if($f -match '\.ps1$|\.md$|\.yml$|\.yaml$|\.json$|\.txt$|index\.html|\.gitignore|\.gitattributes'){
        "" | Out-File $p -Encoding utf8
        Write-Host "  -> Opprettet placeholder: $f" -ForegroundColor DarkYellow
      }
    }
  }
}
if($ok){ Write-Host "`n✅ Alt på plass. Du kan jobbe videre trygt." -ForegroundColor Green }
else{
  if($Fix){ Write-Host "`n⚠ Noe mangler – placeholders lagt inn der mulig." -ForegroundColor Yellow }
  else    { Write-Host "`n⚠ Noe mangler – pakk ut aidme-handover-v3.zip i $Root eller kjør -Fix." -ForegroundColor Red }
}
Write-Host "`n📌 Husk: Last opp aidme-handover-v3.zip i ny chat ved bytte." -ForegroundColor Yellow
