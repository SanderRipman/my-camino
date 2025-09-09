# =======================
# AidMe Ops Cheatsheet
# sos  = send alle draft-* fra outbox\ops-workflow\
# snap = snapshot + index for ops-workflow (auto)
# ctrl = kontrollrapport (teller autosplit etc. pr ChatKey)
# =======================
$script:Root = if ($env:AIDME_ROOT) { $env:AIDME_ROOT } else { "C:\Dev\my-camino" }

function Get-CapDir([string]$ChatKey){
  Join-Path $script:Root "handover\captures\$ChatKey"
}

function Invoke-AidSnapshotIndex([string]$ChatKey){
  Import-Module (Join-Path $script:Root 'tools\AidMe.Helpers') -Force -ErrorAction SilentlyContinue | Out-Null
  $zip = Join-Path $script:Root ("handover\{0}-handover.zip" -f $ChatKey)

  $ss = Get-Command New-AidSnapshot   -ErrorAction SilentlyContinue
  $ix = Get-Command Add-AidIndexEntry -ErrorAction SilentlyContinue

  if ($ss) {
    try {
      if ($ss.Parameters.ContainsKey('Root')) { New-AidSnapshot -ChatKey $ChatKey -Root $script:Root | Out-Null }
      else                                     { New-AidSnapshot -ChatKey $ChatKey                    | Out-Null }
    } catch { }
  }
  if ($ix) {
    try {
      if     ($ix.Parameters.ContainsKey('ZipPath')) { Add-AidIndexEntry -ChatKey $ChatKey -ZipPath $zip | Out-Null }
      elseif ($ix.Parameters.ContainsKey('Root'))    { Add-AidIndexEntry -ChatKey $ChatKey -Root   $script:Root | Out-Null }
      elseif ($ix.Parameters.ContainsKey('CaptureDir')) { Add-AidIndexEntry -ChatKey $ChatKey -CaptureDir (Get-CapDir $ChatKey) | Out-Null }
      else { Add-AidIndexEntry -ChatKey $ChatKey | Out-Null }
    } catch { }
  }
}

# Lokal fallback hvis Approve-AidReply ikke finnes i økta
function Approve-Local([string]$DraftPath,[string]$TargetChatKey,[string]$Title='reply'){
  if (-not (Test-Path -LiteralPath $DraftPath)) { throw "Finner ikke utkast: $DraftPath" }
  $dstDir = Get-CapDir $TargetChatKey
  if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Force -Path $dstDir | Out-Null }

  $stamp = (Get-Date).ToString('yyyyMMdd-HHmmss')
  $safe  = ($Title -replace '[^\p{L}\p{N}\- _]+','').Trim(); if (-not $safe) { $safe = 'reply' }
  $safe  = ($safe -replace '\s+','-')
  $dest  = Join-Path $dstDir ("ops-reply-{0}-{1}.md" -f $stamp,$safe)

  Move-Item -LiteralPath $DraftPath -Destination $dest -Force
  # Oppdater mål-chat snapshot + index (best-effort)
  Invoke-AidSnapshotIndex $TargetChatKey
  Write-Host ("✔ Sendt → {0}: {1}" -f $TargetChatKey,$dest)
  return $dest
}

function Send-Ops {
  $out = Join-Path $script:Root 'handover\outbox\ops-workflow'
  if (-not (Test-Path $out)) { Write-Host "Ingen outbox: $out" -ForegroundColor Yellow; return }
  $drafts = Get-ChildItem $out -File -Filter 'draft-*.md' -ErrorAction SilentlyContinue
  if (-not $drafts -or $drafts.Count -eq 0) { Write-Host "Ingen utkast å sende (outbox tom)." -ForegroundColor DarkGray; return }

  $ok = 0; $fail = 0
  foreach($f in $drafts){
    $name = $f.Name
    # Forventer navn som draft-<chatkey>-*.md
    if ($name -notmatch '^draft-([^-.]+)-') {
      Write-Host "Hopper over (ukjent mønster): $name" -ForegroundColor DarkGray
      continue
    }
    $target = $matches[1]
    $title  = ($name -replace '^draft-[^-.]+-','') -replace '\.md$',''
    try {
      if (Get-Command Approve-AidReply -ErrorAction SilentlyContinue) {
        Approve-AidReply -DraftPath $f.FullName -TargetChatKey $target -Title $title | Out-Null
      } else {
        Approve-Local -DraftPath $f.FullName -TargetChatKey $target -Title $title | Out-Null
      }
      $ok++
    } catch {
      $fail++
      Write-Host ("❌ Feil ved sending av {0} → {1}: {2}" -f $name,$target,($_.Exception.Message)) -ForegroundColor Red
    }
  }
  Write-Host ("== Send-Ops: OK={0}, FAIL={1} ==" -f $ok,$fail) -ForegroundColor Cyan
}

function Snap-Ops {
  Invoke-AidSnapshotIndex 'ops-workflow'
  Write-Host "== Snapshot + index oppdatert (ops-workflow) ==" -ForegroundColor Cyan
}

function Ctrl-Aid {
  $chatkeys = @('dev-platform','ops-workflow','product-roadmap','pilot-studier','forskning-studier','partner-tilskudd','turplan-camino','ideer-lab')
  $rows = foreach($ck in $chatkeys){
    $cap = Get-CapDir $ck
    if (-not (Test-Path $cap)) {
      [pscustomobject]@{ ChatKey=$ck; Autosplit=0; LastAutoSplit=$null; Replies=0; LastReply=$null }
      continue
    }
    $auto   = Get-ChildItem $cap -Filter 'autosplit-*.md' -File -ErrorAction SilentlyContinue
    $reply  = Get-ChildItem $cap -Filter 'ops-reply-*.md' -File -ErrorAction SilentlyContinue
    [pscustomobject]@{
      ChatKey      = $ck
      Autosplit    = ($auto|Measure-Object).Count
      LastAutoSplit= ($auto|Sort-Object LastWriteTime -Desc|Select-Object -First 1).LastWriteTime
      Replies      = ($reply|Measure-Object).Count
      LastReply    = ($reply|Sort-Object LastWriteTime -Desc|Select-Object -First 1).LastWriteTime
    }
  }
  $rows | Sort-Object ChatKey | Format-Table -AutoSize
}

Set-Alias sos  Send-Ops  -Force
Set-Alias snap Snap-Ops  -Force
Set-Alias ctrl Ctrl-Aid  -Force
