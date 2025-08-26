param(
  [ValidateSet("dev")]
  [string]$Branch = "dev",
  [string]$Message = "chore(auto): scheduled sync"
)
$ErrorActionPreference = "Stop"
$repo = "C:\Dev\my-camino"
if (!(Test-Path $repo)) { throw "Repo ikke funnet: $repo" }
Set-Location $repo
git fetch --all --prune
if (-not (git branch --list $Branch)) { git checkout -b $Branch origin/$Branch } else { git checkout $Branch }
git pull --ff-only
# Kun push hvis filer faktisk endret (kode/asset/docs – alt i første omgang)
$changes = git status --porcelain
if (-not $changes) { Write-Host "Ingen lokale endringer – ingenting å pushe."; exit 0 }
git add -A
git commit -m $Message
git push origin $Branch
Write-Host "✅ Auto-push til $Branch: $Message"
