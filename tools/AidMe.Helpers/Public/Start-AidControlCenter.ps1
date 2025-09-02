function Start-AidControlCenter {
  [CmdletBinding()]
  param(
    [string]$Root = "C:\Dev\my-camino",
    [string]$ChatKey = "dev-platform-v1"
  )
  function S($t,$c="Cyan"){ Write-Host $t -ForegroundColor $c }
  Clear-Host
  S "=== Aid Control Center ==="
  S "[1] Snapshot" ; S "[2] Audit ZIP'er" ; S "[3] AutoPush (dev)" ; S "[4] Open PR (dev→main)"
  S "[5] Deploy Preview (Netlify)" ; S "[6] Write Note" ; S "[7] Repo Health"
  S "[V] Verify setup" ; S "[Q] Quit`n" "Gray"
  $sel = Read-Host "Choose"
  switch($sel.ToUpper()){
    '1' { New-AidSnapshot -ChatKey $ChatKey -Root $Root; Start-AidControlCenter -Root $Root -ChatKey $ChatKey }
    '2' { Get-ChildItem "$Root\handover\*-handover.zip" -ea 0 | Format-Table Name,Length,LastWriteTime; Start-AidControlCenter -Root $Root -ChatKey $ChatKey }
    '3' { git add .; git commit -m "chore: autopush ($ChatKey)" ; git push -u origin dev; Start-AidControlCenter -Root $Root -ChatKey $ChatKey }
    '4' { if(Get-Command gh -ea 0){ gh pr create --base main --head dev --fill } else { Write-Warning "gh CLI not installed" } ; Start-AidControlCenter -Root $Root -ChatKey $ChatKey }
    '5' { if(Get-Command netlify -ea 0){ netlify open --deploy } else { Write-Warning "netlify CLI not installed" } ; Start-AidControlCenter -Root $Root -ChatKey $ChatKey }
    '6' { $p = Join-Path $Root "handover\$ChatKey-notes.md"; $note = Read-Host "Note"; Write-AidNote -Path $p -Content $note; Start-AidControlCenter -Root $Root -ChatKey $ChatKey }
    '7' { git status; git remote -v; git log --oneline -n 5; Start-AidControlCenter -Root $Root -ChatKey $ChatKey }
    'V' { Verify-AidSetup -Root $Root -ChatKey $ChatKey; Test-AidModule; Start-AidControlCenter -Root $Root -ChatKey $ChatKey }
    'Q' { return }
    default { Start-AidControlCenter -Root $Root -ChatKey $ChatKey }
  }
}
