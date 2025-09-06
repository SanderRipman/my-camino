function Invoke-AidWriteGuides {
  param([string]$Root="C:\Dev\my-camino")
  @"
# AidMe – Control Keywords (PS7)
- **SNAPSHOT [chatkey]**: lag handover-zip + oppdater index  
- **MIGRATE**: åpner migreringsmenyen  
- **HEALTH**: repo-analyse (PSScriptAnalyzer + Pester)  
- **PR**: opprett PR dev→main og åpne i nettleser  
- **PREVIEW**: åpne Netlify deploy preview  
- **GEN**: generer .gitignore/.gitattributes/workflows (om mangler)  
- **FEATURE <type> <navn>**: scaffold ny funksjon/script/workflow  
- **STATUS**: rask oversikt over git/zip/index  
- **NOTES [tekst]**: skriv note (støtter #handover #dev-plan #todo)
"@ | Set-Content (Join-Path $Root 'AidMe-Control-Keywords.md') -Encoding UTF8

  if (-not (Test-Path (Join-Path $Root 'AidMe-Index.md'))) {
@"
# AidMe – Handover-oversikt
| ChatKey | Sist oppdatert | ZIP-sti |
|---------|-----------------|---------|
"@ | Set-Content (Join-Path $Root 'AidMe-Index.md') -Encoding UTF8
  }
  Write-Host "Guides created/updated." -ForegroundColor Green
}
