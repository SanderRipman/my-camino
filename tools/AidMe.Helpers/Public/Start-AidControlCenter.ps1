function Start-AidControlCenter {
  [CmdletBinding()]
  param([string]$Root = "C:\Dev\my-camino",[string]$ChatKey = "dev-platform-v1")
  if (-not $script:AidTranscriptActive) { Start-AidLogging -Root $Root }
  while ($true) {
    Clear-Host
    Write-Host "=== Aid Control Center ===" -ForegroundColor Cyan
    Write-Host "[1] Snapshot"
    Write-Host "[2] Audit ZIP'er"
    Write-Host "[3] AutoPush (dev)"
    Write-Host "[4] Open PR (dev→main)"
    Write-Host "[5] Netlify (admin/site/deploy)"
    Write-Host "[6] Write Note (#handover/#dev-plan/#todo)"
    Write-Host "[7] Repo Health (Analyzer + Pester)"
    Write-Host "[M] Migration (URL/Bulk/Note/New/Smart/Import MD)"
    Write-Host "[F] New Feature (module/script/workflow)"
    Write-Host "[G] Generate (.gitignore, .gitattributes, workflows)"
    Write-Host "[S] Status (zip/index/git)"
    Write-Host "[K] Keywords help"
    Write-Host "[V] Verify setup"
    Write-Host "[L] Stop logging (toggle)"
    Write-Host "[Q] Quit"
    $sel = Read-Host "Choose"
    switch($sel.ToUpper()){
      '1' { New-AidSnapshot -ChatKey $ChatKey -Root $Root; Pause-Aid }
      '2' { Invoke-ZipAudit -Root $Root; Pause-Aid }
      '3' { git add .; git commit -m "chore: autopush ($ChatKey)"; git push -u origin dev; Pause-Aid }
      '4' { if(Get-Command gh -ea 0){ gh pr create --base main --head dev --fill; gh pr view --web } else { Write-Warning "gh CLI not installed" }; Pause-Aid }
      '5' { if(Get-Command netlify -ea 0){
              Write-Host "[A]dmin, [S]ite, [D]eploy" -ForegroundColor Cyan
              switch((Read-Host "Velg").ToUpper()){
                'A' { netlify open --admin }
                'S' { netlify open --site }
                'D' { netlify open --deploy }
                default { netlify status }
              }
            } else { Write-Warning "netlify CLI not installed" }
            Pause-Aid }
      '6' { $p = Join-Path $Root "handover\$ChatKey-notes.md"; $note = Read-Host "Notat"; Write-AidNote -Path $p -Content $note; Pause-Aid }
      '7' { Invoke-AidRepoHealth -Root $Root; Pause-Aid }
      'M' { Start-AidMigration -Root $Root -DefaultKey $ChatKey }
      'F' { $t = Read-Host "Type (module-fn|script|workflow)"; $n = Read-Host "Navn"; if($t -and $n){ New-AidFeature -Type $t -Name $n -Root $Root }; Pause-Aid }
      'G' { Invoke-AidScaffoldRepo -Root $Root; Pause-Aid }
      'S' { Show-AidStatus -Root $Root -ChatKey $ChatKey; Pause-Aid }
      'K' { Invoke-AidWriteGuides -Root $Root; Get-Content (Join-Path $Root 'AidMe-Control-Keywords.md') | Out-Host; Pause-Aid }
      'V' { Verify-AidSetup -Root $Root -ChatKey $ChatKey; Test-AidModule; Pause-Aid }
      'L' { if ($script:AidTranscriptActive) { Stop-AidLogging } else { Start-AidLogging -Root $Root }; Pause-Aid }
      'Q' { if ($script:AidTranscriptActive) { Stop-AidLogging }; return }
      default { }
    }
  }
}
