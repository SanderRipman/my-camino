function Start-AidSmartCapture {
  [CmdletBinding()] param([string]$Root="C:\Dev\my-camino",[string]$DefaultKey="dev-platform-v1")
  $capDir = Join-Path $Root 'handover\captures'; New-Item -ItemType Directory -Force -Path $capDir | Out-Null
  $tmp = Join-Path $capDir ("capture-{0:yyyyMMdd-HHmmss}.md" -f (Get-Date))
  Set-Content -Path $tmp -Value "# Lim inn innhold fra gammel chat under denne linjen:`r`n" -Encoding UTF8
  Start-Process notepad.exe $tmp -Wait
  $raw = Get-Content -Raw $tmp; if ([string]::IsNullOrWhiteSpace($raw)) { Write-Warning "Ingen innhold limt inn."; return }
  $title = ($raw -split "`r?`n" | ? { $_.Trim() } | Select-Object -First 1); if ($title.Length -gt 80){ $title=$title.Substring(0,80).Trim() }; if(-not $title){$title="Uten tittel"}
  $url = [regex]::Match($raw,'https?://\S+').Value
  $lines = ($raw -split "`r?`n") | ? { $_.Trim() } | Select-Object -First 5
  $summary = ($lines -join ' ').Trim(); if ($summary.Length -gt 300) { $summary = $summary.Substring(0,300) + '…' }
  $suggest = Invoke-AidSuggestChatKey -Text $raw -Root $Root; if (-not $suggest){ $suggest=@($DefaultKey) }
  Write-Host "Tittel:" -ForegroundColor Cyan; Write-Host "  $title"
  Write-Host "Foreslått ChatKeys:" -ForegroundColor Cyan; $suggest | % { Write-Host "  - $_" }
  Write-Host "URL (hvis funnet): $url" -ForegroundColor Cyan
  Write-Host "Oppsummering (auto): $summary`r`n" -ForegroundColor Cyan
  $targets = Read-Host "Angi mål-chatkeys separert med komma (tomt = anbefalt)"; if([string]::IsNullOrWhiteSpace($targets)){ $targets=($suggest -join ',') }
  $targetList = $targets.Split(',') | % { $_.Trim() } | ? { $_ }
  foreach($ck in $targetList){
    New-AidChatKey -ChatKey $ck -Root $Root
    $dstDir = Join-Path $capDir $ck; New-Item -ItemType Directory -Force -Path $dstDir | Out-Null
    $fileName = ($title -replace '[^\w\- ]','').Trim(); if(-not $fileName){ $fileName = "capture" }
    $dst = Join-Path $dstDir ($fileName + '.md'); Copy-Item $tmp $dst -Force
    $p = Join-Path $Root "handover\$ck-notes.md"
    $body = @("#### Capture","- Tittel: $title"); if($url){ $body += "- Link: $url" }; $body += "- Oppsummering: $summary"; $body += "- Fil: $([IO.Path]::GetFileName($dst))"; $body += "- Neste steg: "
    Write-AidNote -Path $p -Content ($body -join "`r`n")
  }
  Write-Host "Smart Capture ferdig (lagret under handover\captures)." -ForegroundColor Green
}
