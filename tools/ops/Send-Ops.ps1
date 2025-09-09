param()
$ErrorActionPreference = "Stop"
$Root = if ($env:AIDME_ROOT) { $env:AIDME_ROOT } else { "C:\Dev\my-camino" }

function Get-CapDir {
  param([Parameter(Mandatory)][string]$ChatKey)
  Join-Path $Root "handover\captures\$ChatKey"
}

function New-SafeName {
  param([Parameter(Mandatory)][string]$Title)
  $clean = ($Title -replace '[^\p{L}\p{N}\- _]+','').Trim()
  if (-not $clean) { $clean = 'message' }
  ($clean -replace '\s+','-')
}

function Approve-AidReply {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory)][string]$DraftPath,
    [Parameter(Mandatory)][string]$TargetChatKey,
    [string]$Title = 'reply'
  )
  if (-not (Test-Path -LiteralPath $DraftPath)) { throw "Finner ikke utkast: $DraftPath" }
  $dstDir = Get-CapDir -ChatKey $TargetChatKey
  if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Force -Path $dstDir | Out-Null }

  $stamp = (Get-Date).ToString('yyyyMMdd-HHmmss')
  $name  = "ops-reply-$stamp-$(New-SafeName -Title $Title).md"
  $dest  = Join-Path $dstDir $name

  Move-Item -LiteralPath $DraftPath -Destination $dest -Force

  # Snapshot + index (tolerant for ulike signaturer)
  try { Import-Module (Join-Path $Root 'tools\AidMe.Helpers') -Force -ErrorAction SilentlyContinue | Out-Null } catch {}
  try {
    $ss = Get-Command New-AidSnapshot   -ErrorAction SilentlyContinue
    $ix = Get-Command Add-AidIndexEntry -ErrorAction SilentlyContinue
    if ($ss) { if ($ss.Parameters.ContainsKey('Root')) { New-AidSnapshot -ChatKey $TargetChatKey -Root $Root | Out-Null } else { New-AidSnapshot -ChatKey $TargetChatKey | Out-Null } }
    if ($ix) {
      if     ($ix.Parameters.ContainsKey('ZipPath'))  { $zip = Join-Path $Root "handover\$TargetChatKey-handover.zip"; Add-AidIndexEntry -ChatKey $TargetChatKey -ZipPath $zip | Out-Null }
      elseif ($ix.Parameters.ContainsKey('Root'))     { Add-AidIndexEntry -ChatKey $TargetChatKey -Root $Root | Out-Null }
      elseif ($ix.Parameters.ContainsKey('CaptureDir')) { Add-AidIndexEntry -ChatKey $TargetChatKey -CaptureDir (Get-CapDir -ChatKey $TargetChatKey) | Out-Null }
      else { Add-AidIndexEntry -ChatKey $TargetChatKey | Out-Null }
    }
  } catch {}

  Write-Host "✅ Sendt til $TargetChatKey → $dest" -ForegroundColor Green
  Get-Item $dest
}
