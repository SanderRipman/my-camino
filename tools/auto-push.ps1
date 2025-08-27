param([string]$Branch="dev")
Set-Location "C:\Dev\my-camino"
git fetch --all --prune
git checkout $Branch
git pull --ff-only
if (-not (git status --porcelain)) { Write-Host "Ingen lokale endringer – ingenting å pushe."; exit 0 }
git add -A
$ts = Get-Date -Format "yyyy-MM-dd HH:mm"
git commit -m "chore(auto): scheduled sync $ts"
git push
