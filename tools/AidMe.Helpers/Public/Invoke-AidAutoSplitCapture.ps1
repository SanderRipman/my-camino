function Invoke-AidAutoSplitCapture {
  [CmdletBinding(DefaultParameterSetName='ByKey')]
  param(
    [Parameter(ParameterSetName='ByFile', Mandatory=$true)][string]$SourceFile,
    [Parameter(ParameterSetName='ByKey', Mandatory=$true)][string]$ChatKey,
    [string]$Root="C:\Dev\my-camino"
  )
  if ($PSCmdlet.ParameterSetName -eq 'ByKey') { $SourceFile = Get-AidLatestCapture -ChatKey $ChatKey -Root $Root }
  if (-not (Test-Path $SourceFile)) { throw "Fant ikke $SourceFile" }
  $raw = Get-Content -Raw $SourceFile; if (-not $raw.Trim()) { throw "Tom fil: $SourceFile" }

  $parts = ($raw -split "(`r?`n){2,}") | ? { $_.Trim() }
  $routed = @{}
  foreach($c in $parts){
    $ck = (Invoke-AidSuggestChatKey -Text $c -Root $Root | Select-Object -First 1)
    if (-not $ck) { $ck = 'inbox' }
    if (-not $routed.ContainsKey($ck)) { $routed[$ck] = @() }
    $routed[$ck] += $c.Trim()
  }

  foreach($ck in $routed.Keys){
    $dir = Join-Path $Root "handover\captures\$ck"; New-Item -ItemType Directory -Force -Path $dir | Out-Null
    $out = Join-Path $dir ("autosplit-{0:yyyyMMdd-HHmmss}.md" -f (Get-Date))
    Set-Content -Path $out -Value (($routed[$ck] -join "`r`n`r`n---`r`n`r`n")) -Encoding UTF8
    Write-AidNote -Path (Join-Path $Root "handover\$ck-notes.md") -Content ("#### AutoSplit`r`n- Kilde: $([IO.Path]::GetFileName($SourceFile))`r`n- Antall seksjoner: {0}`r`n- Fil: $([IO.Path]::GetFileName($out))" -f $routed[$ck].Count)
    Write-Host "→ $ck : $([IO.Path]::GetFileName($out))" -ForegroundColor Cyan
  }
  Write-Host "✅ AutoSplit ferdig" -ForegroundColor Green
}
