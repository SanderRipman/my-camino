function Check-Handover {
  [CmdletBinding()] param([switch]$Fix,[string]$Root="C:\Dev\my-camino")
  $Files = @(".gitattributes",".gitignore","README.md","CHANGELOG.md","demo-data.json","index.html",
    "tools\auto-push.ps1","tools\favicons.ps1",".github\workflows\release-pr.yml")
  Write-Host "== Sjekker handover i $Root ==" -ForegroundColor Cyan
  $ok=$true
  foreach($f in $Files){
    $p=Join-Path $Root $f
    if(Test-Path $p){ Write-Host "✔ $f" -ForegroundColor Green }
    else{
      Write-Host "⚠ $f mangler" -ForegroundColor Yellow; $ok=$false
      if($Fix){
        $dir=Split-Path $p -Parent
        New-Item -ItemType Directory -Path $dir -Force -ErrorAction SilentlyContinue|Out-Null
        ""|Out-File $p -Encoding utf8
        Write-Host "  -> placeholder laget" -ForegroundColor DarkYellow
      }
    }
  }
  if($ok){ Write-Host "✅ Alt på plass" -ForegroundColor Green } else { Write-Host "⚠ Noe mangler" -ForegroundColor Yellow }
  return $ok
}
