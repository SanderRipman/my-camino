function Get-AidMeChatKeys {
  param([string]$IndexPath = (Join-Path "C:\Dev\my-camino" "AidMe-Index.md"))
  if (!(Test-Path $IndexPath)) { return @() }
  $lines = Get-Content $IndexPath
  $keys = @()
  foreach ($ln in $lines) {
    if ($ln -match '^\s*\|\s*([a-z0-9\-]+)\s*\|\s*') { $keys += $matches[1] }
  }
  $keys | Sort-Object -Unique
}

function Invoke-MigrationNotepad {
  [CmdletBinding()] param(
    [string]$RepoRoot = "C:\Dev\my-camino"
  )
  $migRoot = Join-Path $RepoRoot "docs\migrations"
  New-Item -ItemType Directory -Path $migRoot -Force | Out-Null

  Write-Host "Notat-migrering: Hver runde åpner Notepad. Skriv/lim inn, lagre og LUKK vinduet." -ForegroundColor Cyan
  Write-Host "Avslutt ved å trykke Enter når du blir spurt om ny runde." -ForegroundColor DarkGray

  while ($true) {
    $tmp = [System.IO.Path]::GetTempFileName()
    # Forhåndstekst som hint
    @"
# Lim inn tekst fra gammel chat her.
# Lagre (Ctrl+S) og lukk Notepad når du er ferdig.
"@ | Out-File $tmp -Encoding UTF8

    Start-Process notepad.exe $tmp -Wait

    $text = (Get-Content $tmp -Raw).Trim()
    Remove-Item $tmp -Force

    if ([string]::IsNullOrWhiteSpace($text)) {
      $again = Read-Host "Tomt notat. Ny runde? (Enter = ja, n = nei)"
      if ($again -eq 'n') { break } else { continue }
    }

    # Heuristikk for forslag til chatkey
    $t = $text.ToLowerInvariant()
    $guess =
      if ($t -match 'git|workflow|action|branch|powershell|ps7|build|deploy') { 'dev-platform' }
      elseif ($t -match 'roadmap|feature|prioriter|mål|backlog')              { 'product-roadmap' }
      elseif ($t -match 'idé|hypotes|inspirasjon|research|utforsk')           { 'ideer-lab' }
      elseif ($t -match 'pilot|studieopplegg|evaluering|testgruppe')          { 'pilot-studier' }
      elseif ($t -match 'tilskudd|søknad|prosjektmidler|fakturer')            { 'partner-tilskudd' }
      elseif ($t -match 'tur|rute|camino|domeneinnsikt|felt')                 { 'turplan-camino' }
      elseif ($t -match 'forskning|studier|paper|metaanalyse|evidens')        { 'forskning-studier' }
      else                                                                    { '' }

    $available = Get-AidMeChatKeys
    if ($guess -and $available -notcontains $guess) { $guess = '' } # ikke foreslå ukjent

    $ck = Read-Host ("Foreslått chatkey" + ($(if($guess){" = $guess"} else {" (ingen)"})) + ". Skriv ønsket eller Enter")
    if ([string]::IsNullOrWhiteSpace($ck)) { $ck = $guess }
    if ([string]::IsNullOrWhiteSpace($ck)) {
      # som fallback: velg fra liste hvis mulig
      if ($available.Count -gt 0) {
        Write-Host "Velg chatkey fra indeks:" -ForegroundColor Yellow
        $available | ForEach-Object { Write-Host " - $_" }
        $ck = Read-Host "Chatkey"
      }
    }
    if ([string]::IsNullOrWhiteSpace($ck)) { Write-Host "Avbrutt (mangler chatkey)." -ForegroundColor Red; break }

    $destDir = Join-Path $migRoot $ck
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    $stamp   = Get-Date -Format "yyyyMMdd-HHmm"
    $dest    = Join-Path $destDir "$stamp.md"

@"
---
chatkey: $ck
source: notepad
created: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
---

$text
"@ | Out-File $dest -Encoding UTF8

    Write-Host "✅ Lagret migreringsnotat: $dest" -ForegroundColor Green

    $again = Read-Host "Lage et notat til? (Enter = ja, n = nei)"
    if ($again -eq 'n') { break }
  }
}

function Start-AidMeMenuExtended {
  [CmdletBinding()] param([string]$RepoRoot = "C:\Dev\my-camino")
  Set-Location $RepoRoot
  Clear-Host
  Write-Host "AidMe Kontrollsenter – utvidet" -ForegroundColor Cyan
  Write-Host ("Repo: " + (Get-Location))
  Write-Host ""
  Write-Host "M) Migrer fra gammel chat (lim-inn → auto-forslag chatkey)"
  Write-Host "N) Notepad-migrering (lag ett eller flere notater)"
  Write-Host "B) Bulk-migrering fra _migrate\ (.txt filer)"
  Write-Host "Z) Vis ZIP-indeks (AidMe-Index.md)"
  Write-Host "A) SNAPSHOT alle chatkeys"
  Write-Host "C) SNAPSHOT endret (heuristikk – hopper over hvis ingen lokale endringer)"
  Write-Host "Q) Tilbake"
  while ($true) {
    $c = (Read-Host "`nVelg").ToUpper()
    switch ($c) {
      'M' {
        Write-Host "Lim inn migreringstekst (Ctrl+Z + Enter for å avslutte innliming):" -ForegroundColor Yellow
        $buf = @()
        while ($true) {
          $line = Read-Host
          if ($line -eq $null) { break }
          $buf += $line
        }
        $tmp = [System.IO.Path]::GetTempFileName()
        $buf -join "`r`n" | Out-File $tmp -Encoding UTF8
        # Gjenbruk notepad-heuristikken ved å lese filen og kalle Notepad-funksjonen én gang
        Start-Process notepad.exe $tmp -Wait
        $content = Get-Content $tmp -Raw
        Remove-Item $tmp -Force
        if ($content.Trim().Length -gt 0) {
          # legg midlertidig innhold gjennom notepad-funksjonen (som håndterer lagring + forslag)
          $global:__AIDME_TMP = $content
          # mini-shim: skriv til temp og la Invoke-MigrationNotepad plukke det opp
          $t = [System.IO.Path]::GetTempFileName()
          $content | Out-File $t -Encoding UTF8
          Start-Process notepad.exe $t -Wait
          Invoke-MigrationNotepad -RepoRoot $RepoRoot
          Remove-Item $t -Force
        }
      }
      'N' { Invoke-MigrationNotepad -RepoRoot $RepoRoot }
      'B' {
        $dir = Join-Path $RepoRoot "_migrate"
        if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
        Write-Host "Legg .txt-filer i: $dir (første linje = chatkey, resten = innhold). Trykk Enter når klart…"
        Read-Host | Out-Null
        $files = Get-ChildItem $dir -Filter *.txt -File
        if ($files.Count -eq 0) { Write-Host "Ingen .txt funnet." -ForegroundColor Yellow; continue }
        foreach ($f in $files) {
          $all = Get-Content $f.FullName -Raw
          if ($all -match "^(?<ck>[a-z0-9\-]+)\s*\r?\n(?<tx>[\s\S]+)$") {
            $ck = $matches['ck']; $tx = $matches['tx']
            $stamp = Get-Date -Format "yyyyMMdd-HHmm"
            $destDir = Join-Path $RepoRoot ("docs\migrations\" + $ck)
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            $dest = Join-Path $destDir "$stamp.md"
@"
---
chatkey: $ck
source: bulk
created: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
---

$tx
"@ | Out-File $dest -Encoding UTF8
            Write-Host "✅ $($f.Name) → $ck ($dest)" -ForegroundColor Green
          } else {
            Write-Host "⚠ Hopper over (mangler chatkey på første linje): $($f.Name)" -ForegroundColor Yellow
          }
        }
      }
      'Z' {
        $idx = Join-Path $RepoRoot "AidMe-Index.md"
        if (Test-Path $idx) { Start-Process notepad.exe $idx } else { Write-Host "Fant ikke $idx" -ForegroundColor Yellow }
      }
      'A' {
        if (Get-Command New-AidMeHandover -ErrorAction SilentlyContinue) {
          $keys = Get-AidMeChatKeys
          foreach ($k in $keys) { try { New-AidMeHandover -ChatKey $k } catch { Write-Host $_.Exception.Message -ForegroundColor Red } }
        } else { Write-Host "New-AidMeHandover ikke tilgjengelig." -ForegroundColor Yellow }
      }
      'C' {
        # enkel heuristikk: hvis 'git status --porcelain' har endringer, ta snapshot av alle
        $chg = (git -C $RepoRoot status --porcelain) 2>$null
        if ($chg) {
          if (Get-Command New-AidMeHandover -ErrorAction SilentlyContinue) {
            $keys = Get-AidMeChatKeys
            foreach ($k in $keys) { try { New-AidMeHandover -ChatKey $k } catch { Write-Host $_.Exception.Message -ForegroundColor Red } }
          } else { Write-Host "New-AidMeHandover ikke tilgjengelig." -ForegroundColor Yellow }
        } else {
          Write-Host "Ingen lokale endringer oppdaget – hopper over." -ForegroundColor Yellow
        }
      }
      'Q' { break }
      default { }
    }
  }
}
