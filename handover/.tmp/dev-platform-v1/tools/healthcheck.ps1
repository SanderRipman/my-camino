param([switch]$Verbose)

function Test-Cmd { param([string]$Cmd)
  $found = (Get-Command $Cmd -ErrorAction SilentlyContinue)
  if ($found) { "OK    $Cmd = $($found.Source)" } else { "MISSING $Cmd" }
}

Write-Host "=== HealthCheck (local) ===" -ForegroundColor Cyan

# PowerShell
"$($PSVersionTable.PSEdition) $($PSVersionTable.PSVersion)"

# Git
Write-Host (Test-Cmd git)
try { git --version } catch {}

# ImageMagick (for favicons)
Write-Host (Test-Cmd magick)
try { magick -version | Select-String Version } catch {}

# Repo
try {
  $here = Get-Location
  if ($here.Path -ne "C:\Dev\my-camino") { Set-Location C:\Dev\my-camino }
  $status = git status --porcelain=v1
  $branch = (git rev-parse --abbrev-ref HEAD).Trim()
  Write-Host "Repo: C:\Dev\my-camino (branch: $branch)"
  if ($status) { Write-Host "Uncommitted changes:"; $status } else { Write-Host "Working tree clean" }
} catch {
  Write-Warning "Git status failed: $_"
} finally {
  if ($here) { Set-Location $here }
}

# Files we rely on
$must = @("index.html","public")
$must | ForEach-Object {
  if (Test-Path $_) { Write-Host "Found: $_" } else { Write-Host "Missing: $_" -ForegroundColor Yellow }
}

Write-Host "=== Done ===" -ForegroundColor Cyan
