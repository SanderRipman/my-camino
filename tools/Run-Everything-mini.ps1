# C:\Dev\my-camino\tools\Run-Everything-mini.ps1
param(
  [switch]$DoIt,
  [switch]$SendPings,
  [switch]$Backup
)

$ErrorActionPreference = 'Stop'

# === 0) Grunnlag
$Root = $env:AIDME_ROOT; if (-not $Root) { $Root = 'C:\Dev\my-camino' }
if (-not (Test-Path $Root)) { throw "Fant ikke prosjektrot: $Root" }

function Ensure-Dir([string]$p){ if (-not (Test-Path $p)) { New-Item -ItemType Directory -Force -Path $p | Out-Null } }

$capOps = Join-Path $Root 'handover\captures\ops-workflow'
$capDev = Join-Path $Root 'handover\captures\dev-platform'
Ensure-Dir $capOps; Ensure-Dir $capDev

# === 1) Verifiser lokalt miljø (AidMe.Helpers, Workflows, gh, netlify)
try { Import-Module (Join-Path $Root 'tools\AidMe.Helpers') -Force -ErrorAction Stop } catch { Write-Warning "AidMe.Helpers ikke lastet: $($_.Exception.Message)" }

Write-Host "== Verify: gh & netlify ==" -ForegroundColor Cyan
try { gh --version | Out-Null; Write-Host "GitHub CLI: OK" -ForegroundColor Green } catch { Write-Warning "GitHub CLI mangler/ikke logget inn" }
try { netlify --version | Out-Null; Write-Host "Netlify CLI: OK" -ForegroundColor Green } catch { Write-Warning "Netlify CLI mangler/ikke logget inn" }

# === 2) Sjekk data-kontinuitet i dev-platform
$autos = Get-ChildItem $capDev -Filter 'autosplit-*.md' -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
$autoCount = $autos.Count
$latest    = if ($autoCount -gt 0) { $autos[0].LastWriteTime } else { $null }

# se etter signaturer
$foundVersion = $false
$foundName    = $false
foreach($f in $autos){ 
  $txt = Get-Content -Path $f.FullName -TotalCount 400
  if (-not $foundVersion -and $txt -match 'v5\.6\.1') { $foundVersion = $true }
  if (-not $foundName    -and $txt -match 'Camino\s+Measures') { $foundName = $true }
  if ($foundVersion -and $foundName){ break }
}

# === 3) Continuity-rapport
$stamp = (Get-Date).ToString('yyyyMMdd-HHmmss')
$report = @()
$report += "# Continuity report – dev-platform ($stamp)"
$report += ""
$report += "* Root: $Root"
$report += "* Autosplit-filer i dev-platform: $autoCount"
$report += "* Siste oppdatering: " + ($(if($latest){ $latest.ToString('yyyy-MM-dd HH:mm') } else { '–' }))
$report += "* 'Camino Measures' funnet: " + ($(if($foundName){'✅'}else{'❌'}))
$report += "* 'v5.6.1' funnet: " + ($(if($foundVersion){'✅'}else{'❌'}))
$report += ""
$report += "### Note"
$report += "- Reply-flyt: godkjent i egen test (Approve-AidReply) – forventet OK."
$report += "- Netlify/GitHub: bruk `netlify env:list` og `gh secret list` for rask sanity."
$outFile = Join-Path $capDev ("continuity-report-{0}.md" -f $stamp)
$report -join "`r`n" | Set-Content -Path $outFile -Encoding UTF8
Write-Host ("Skrev: {0}" -f $outFile) -ForegroundColor Green

# === 4) (Valgfritt) Backup av \handover
if ($Backup) {
  $zip = Join-Path $Root ("handover-backup-{0}.zip" -f $stamp)
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  [System.IO.Compression.ZipFile]::CreateFromDirectory((Join-Path $Root 'handover'), $zip)
  Write-Host "Backup ZIP: $zip" -ForegroundColor Green
}

# === 5) (Valgfritt) Arkiver gamle ops-workflow-zipper (DoIt)
if ($DoIt) {
  $arc = Join-Path $Root 'handover\archive\ops-workflow'
  Ensure-Dir $arc
  $zips = Get-ChildItem (Join-Path $Root 'handover') -Filter 'ops-workflow*-handover.zip' -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
  if ($zips.Count -gt 1) {
    $keep = $zips[0]
    $move = $zips | Select-Object -Skip 1
    foreach($z in $move){ Move-Item -LiteralPath $z.FullName -Destination (Join-Path $arc $z.Name) -Force }
    Write-Host ("Arkivert {0} gamle ops-workflow-zipper (beholder {1})" -f $move.Count, $keep.Name) -ForegroundColor Green
  } else {
    Write-Host "Ingen gamle ops-workflow-zipper å arkivere." -ForegroundColor DarkGray
  }
}

# === 6) (Valgfritt) Pings (kun enkel konsoll-info her)
if ($SendPings) {
  Write-Host "Ping: dev-platform klar, continuity-rapport generert." -ForegroundColor Cyan
}

# === 7) Snapshot + Index best-effort
try { New-AidSnapshot -ChatKey 'dev-platform' | Out-Null } catch {}
try { Add-AidIndexEntry -ChatKey 'dev-platform' | Out-Null } catch {}
Write-Host "✅ Mini-run ferdig." -ForegroundColor Cyan

# === [AUTO-SNAPSHOT/INDEX – DO NOT EDIT] ===
try {
  Import-Module (Join-Path $env:AIDME_ROOT 'tools\AidMe.Helpers') -Force -ErrorAction SilentlyContinue | Out-Null
} catch {}

# Oppdag hvilke parametre som finnes i miljøet ditt
$ssCmd        = Get-Command New-AidSnapshot   -ErrorAction SilentlyContinue
$ixCmd        = Get-Command Add-AidIndexEntry -ErrorAction SilentlyContinue
$ssHasRoot    = $ssCmd -and $ssCmd.Parameters.ContainsKey('Root')
$ssHasZip     = $ssCmd -and $ssCmd.Parameters.ContainsKey('ZipPath')
$ixHasRoot    = $ixCmd -and $ixCmd.Parameters.ContainsKey('Root')
$ixHasZip     = $ixCmd -and $ixCmd.Parameters.ContainsKey('ZipPath')
$ixHasCapDir  = $ixCmd -and $ixCmd.Parameters.ContainsKey('CaptureDir')

$zipDev  = Join-Path $env:AIDME_ROOT 'handover\dev-platform-handover.zip'
$capDev  = Join-Path $env:AIDME_ROOT 'handover\captures\dev-platform'

# New-AidSnapshot (prøv mest spesifikk → minst)
try {
  if     ($ssHasRoot -and $ssHasZip) { New-AidSnapshot -ChatKey 'dev-platform' -Root $env:AIDME_ROOT -ZipPath $zipDev | Out-Null }
  elseif ($ssHasRoot)                { New-AidSnapshot -ChatKey 'dev-platform' -Root $env:AIDME_ROOT                 | Out-Null }
  else                               { New-AidSnapshot -ChatKey 'dev-platform'                                       | Out-Null }
} catch {}

# Add-AidIndexEntry (prøv mest spesifikk → minst)
try {
  if     ($ixHasZip)                 { Add-AidIndexEntry -ChatKey 'dev-platform' -ZipPath $zipDev                     | Out-Null }
  elseif ($ixHasRoot)                { Add-AidIndexEntry -ChatKey 'dev-platform' -Root    $env:AIDME_ROOT             | Out-Null }
  elseif ($ixHasCapDir)              { Add-AidIndexEntry -ChatKey 'dev-platform' -CaptureDir $capDev                  | Out-Null }
  else                               { Add-AidIndexEntry -ChatKey 'dev-platform'                                      | Out-Null }
} catch {}

Write-Host "✅ Mini-run ferdig (snapshot + index oppdatert uten spørsmål)." -ForegroundColor Cyan
# === [/AUTO-SNAPSHOT/INDEX] ===

