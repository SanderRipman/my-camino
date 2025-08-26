param(
  [ValidateSet("dev","main")]
  [string]$Branch = "dev"
)

$ErrorActionPreference = "Stop"
$repo = "C:\Dev\my-camino"

if (!(Test-Path $repo)) { throw "Repo ikke funnet: $repo" }

Set-Location $repo

# Oppdater lokalt og bytt til ønsket branch
git fetch --all --prune
git checkout $Branch
git pull --ff-only

# Finn endringer
$changes = git status --porcelain

if (-not $changes) {
  Write-Host "Ingen lokale endringer – ingenting å pushe."
  exit 0
}

# Legg til, commit og push
git add -A
$msg = "chore(auto): scheduled sync $(Get-Date -Format s)"
git commit -m $msg
git push origin $Branch

Write-Host "✅ Pushet til $Branch med melding: $msg"
