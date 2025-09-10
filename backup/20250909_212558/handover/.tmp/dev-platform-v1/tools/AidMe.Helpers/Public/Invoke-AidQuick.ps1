function Invoke-AidQuick {
  [CmdletBinding()]
  param([ValidateSet('SNAPSHOT','MIGRATE','HEALTH','PR','PREVIEW','GEN','FEATURE','STATUS','NOTES','KEYS')]
        [string]$Key,
        [string]$Arg1,
        [string]$Arg2,
        [string]$Root="C:\Dev\my-camino",
        [string]$ChatKey="dev-platform-v1")
  switch($Key){
    'SNAPSHOT' { New-AidSnapshot -ChatKey ($Arg1 ?? $ChatKey) -Root $Root }
    'MIGRATE'  { Start-AidMigration -Root $Root -DefaultKey $ChatKey }
    'HEALTH'   { Invoke-AidRepoHealth -Root $Root }
    'PR'       { if(Get-Command gh -ea 0){ gh pr create --base main --head dev --fill; gh pr view --web } else { Write-Warning "gh CLI not installed" } }
    'PREVIEW'  { if(Get-Command netlify -ea 0){ netlify open --deploy } else { Write-Warning "netlify CLI not installed" } }
    'GEN'      { Invoke-AidScaffoldRepo -Root $Root }
    'FEATURE'  { if(-not $Arg1){Write-Warning "Bruk: Invoke-AidQuick -Key FEATURE -Arg1 module-fn|script|workflow -Arg2 Navn"; break}; New-AidFeature -Type $Arg1 -Name $Arg2 -Root $Root }
    'STATUS'   { Show-AidStatus -Root $Root -ChatKey $ChatKey }
    'NOTES'    { $p = Join-Path $Root "handover\$ChatKey-notes.md"; Write-AidNote -Path $p -Content ($Arg1 ?? "#todo") }
    'KEYS'     { Get-Content (Join-Path $Root 'AidMe-Control-Keywords.md') -ErrorAction SilentlyContinue | Out-Host }
  }
}
