# AidMe Cheatsheet – lastes av \C:\Users\Sander\Documents\PowerShell\Microsoft.PowerShell_profile.ps1
function aid:logpath {
  param([string] \ = 'C:\Dev\my-camino\handover\logs\ps')
  Get-ChildItem -LiteralPath \ -Filter 'ps7-*.log' -File -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1
}
function aid:lastlog {
  param(
    [string] \ = 'C:\Dev\my-camino\handover\logs\ps',
    [int]    \   = 400
  )
  \ = aid:logpath -Folder \
  if (-not \) { Write-Host 'Ingen ps7-*.log funnet.' -ForegroundColor Yellow; return }
  \ = Get-Content -LiteralPath \.FullName -Tail \ -ErrorAction SilentlyContinue
  # Plukk ut feil/varsler og de 3 linjene før (for kontekst)
  \ = for (\=0; \ -lt \.Count; \++) {
    if (\[\] -match '(?i)\b(ERROR|Exception|Failed|WARNING)\b') {
      \ = [Math]::Max(0, \-3); \ = [Math]::Min(\.Count-1, \+2)
      (\[\..\] + '---')
    }
  }
  if (-not \) { Write-Host "✅ Ingen feil/varsler i siste ~\ linjer av \" -ForegroundColor Green; return }
  \  = "# AidMe – siste feil/varsler ($(Get-Date -Format 'yyyy-MM-dd HH:mm'))

"
  \ += "**Logg:** \

```
" + (\ -join [Environment]::NewLine) + "
```
"
  \ = Join-Path \ 'lastlog-summary.md'
  Set-Content -LiteralPath \ -Value \ -Encoding UTF8 -Force
  Write-Host "⚠️ Utdrag skrevet til: \" -ForegroundColor Yellow
  \
}
function aid:kode {
  Write-Host @'
  Hurtigkommandoer (AidMe)
  ------------------------
  aid:lastlog     -> Oppsummer siste feil/varsler + lagrer lastlog-summary.md
  aid:logpath     -> Viser sti til siste ps7-*.log
  sos             -> Åpner målmappe/FAQ (hvis definert i prosjektet)
  snap            -> Kjapp snapshot/index (hvis definert i prosjektet)
  ctrl            -> Starter Aid Control Center (PS7)
'@
}
# Alias/forwardere (hvis Cheatsheet ikke har definert dem fra før)
if (-not (Get-Command ctrl  -ErrorAction SilentlyContinue)) { function ctrl  { & 'C:\Dev\my-camino\tools\ops\AidControlCenter.ps1' } }
if (-not (Get-Command sos   -ErrorAction SilentlyContinue)) { function sos   { Write-Host 'sos: legg inn i Cheatsheet for prosjektspesifikk navigasjon.' -ForegroundColor Yellow } }
if (-not (Get-Command snap  -ErrorAction SilentlyContinue)) { function snap  { Write-Host 'snap: legg inn snapshot-kortvei i Cheatsheet.' -ForegroundColor Yellow } }
