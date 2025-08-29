# === AidMe PowerShell Helpers ===
function Open-Repo { Set-Location "C:\Dev\my-camino"; git status }
function New-Feature { param([string]$name) Set-Location "C:\Dev\my-camino"; git checkout dev; git pull --ff-only; $branch = "feat/"+$name; git checkout -b $branch; git push -u origin $branch }
function Release { param([string]$version,[string]$notes) Set-Location "C:\Dev\my-camino"; git checkout main; git pull --ff-only; git tag $version; git push origin main --tags }
