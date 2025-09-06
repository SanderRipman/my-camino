# === Run-Everything.ps1 ===
$ErrorActionPreference = 'Stop'

# 0) Miljø
if (-not $env:AIDME_ROOT) { $env:AIDME_ROOT = 'C:\Dev\my-camino' }
$Root = $env:AIDME_ROOT
Write-Host "AIDME_ROOT = $Root" -ForegroundColor Cyan

# 1) Valg (interaktivt)
function Ask($q, $def) {
  $ans = Read-Host "$q [$def]"
  if ([string]::IsNullOrWhiteSpace($ans)) { return $def }
  return $ans
}
$mode  = Ask "Kjøringsmodus: Preview eller DoIt" "Preview"
$ping  = Ask "Sende akutt-meldinger og ping? yes/no" "yes"
$backup= Ask "Ta ZIP-backup av \handover først? yes/no" "yes"

$Preview   = ($mode -match 'preview')
$DoIt      = ($mode -match 'doit')
$SendPings = ($ping -match 'yes')
$SkipBackup= (-not ($backup -match 'yes'))

# 2) Hent alt-i-ett-funksjonen (inline for enkelhet)
$script = @'
param([switch]$Preview,[switch]$DoIt,[switch]$SendPings,[switch]$SkipBackup)
$ErrorActionPreference='Stop'
$Root=if($env:AIDME_ROOT){$env:AIDME_ROOT}else{'C:\Dev\my-camino'}
$handover=Join-Path $Root 'handover'
$idxPath =Join-Path $Root 'AidMe-Index.md'
$opsCk='ops-workflow'; $devCk='dev-platform'
$capOps=Join-Path $handover "captures\$opsCk"
$outOps=Join-Path $handover "outbox\$opsCk"
$appOps=Join-Path $handover "approve\$opsCk"
$zipOps=Join-Path $handover "$opsCk-handover.zip"
$null=New-Item -ItemType Directory -Force -Path $capOps,$outOps,$appOps|Out-Null
$stamp=(Get-Date).ToString('yyyyMMdd-HHmmss')

function Say([string]$m,[string]$lvl='i'){ $c= switch($lvl){'ok'{'Green'}'warn'{'Yellow'}'err'{'Red'}default{'Cyan'}}; Write-Host $m -ForegroundColor $c }

# 0) Backup
if(-not $SkipBackup){
  $bak=Join-Path $Root ("handover-backup-{0}.zip" -f $stamp)
  if($Preview){ Say "PREVIEW: Backup -> $bak" 'warn' } else {
    try{ Compress-Archive -Path (Join-Path $handover '*') -DestinationPath $bak -Force; Say "✅ Backup: $bak" 'ok' }catch{ Say "⚠️ Backup feilet: $($_.Exception.Message)" 'warn' }
  }
}

# 1) Continuity Report (dev-platform)
function New-Cont {
  $devCap=Join-Path $handover "captures\$devCk"; $null=New-Item -ItemType Directory -Force -Path $devCap|Out-Null
  $rep=Join-Path $devCap "continuity-report-$stamp.md"
  $z=@(); $z+=Get-ChildItem $handover -File -Filter 'dev-platform-handover*.zip' -ea SilentlyContinue
  $z+=Get-ChildItem $handover -File -Filter 'dev-platform-v1-handover*.zip' -ea SilentlyContinue
  $z=$z|Sort-Object LastWriteTime -desc
  $cur=$z|?{$_.Name -like 'dev-platform-handover*.zip'}|select -First 1
  $v1 =$z|?{$_.Name -like 'dev-platform-v1-handover*.zip'}|select -First 1
  $tmp=Join-Path $env:TEMP ("aidme-devplatform-$stamp"); if(Test-Path $tmp){Remove-Item $tmp -Recurse -Force}
  $curDir=if($cur){Join-Path $tmp 'current'} else {$null}
  $v1Dir =if($v1 ){Join-Path $tmp 'v1'} else {$null}
  if($cur){ Add-Type -AssemblyName System.IO.Compression.FileSystem; [IO.Compression.ZipFile]::ExtractToDirectory($cur.FullName,$curDir) }
  if($v1 ){ Add-Type -AssemblyName System.IO.Compression.FileSystem; [IO.Compression.ZipFile]::ExtractToDirectory($v1.FullName,$v1Dir)  }
  function Man($r){ if(-not $r -or -not (Test-Path $r)){return @()} Get-ChildItem $r -Recurse -File | % { [pscustomobject]@{Rel=$_.FullName.Substring($r.Length).TrimStart('\','/');Size=$_.Length} } }
  $curMan=Man $curDir; $v1Man=Man $v1Dir
  $missing= if($v1Man.Count -gt 0 -and $curMan.Count -gt 0){ ($v1Man.Rel | ? { $_ -notin $curMan.Rel }) } else { @() }
  function Find($root,$pat){ $hits=@(); if(-not (Test-Path $root)){return $hits}
    Get-ChildItem $root -Recurse -File | %{
      if($_.Extension.ToLower() -in @('.ts','.tsx','.js','.jsx','.json','.html','.md','.ps1','.yml','.yaml','.css')){
        try{$c=Get-Content $_.FullName -Raw -Encoding UTF8}catch{$c=$null}
        if($c){ foreach($p in $pat){ if($c -match [regex]::Escape($p)){ $hits+=[pscustomobject]@{File=$_.FullName.Substring($root.Length).TrimStart('\','/'); Pattern=$p} } }
      }
    }; $hits }
  $mk=@('Camino Measures','v5.6.1'); $hit=Find $curDir $mk
  $wfs=Get-ChildItem -Path (Join-Path $curDir '.github\workflows') -File -Recurse -ea SilentlyContinue
  $build=@('package.json','pnpm-lock.yaml','yarn.lock','package-lock.json')|%{Get-ChildItem -Path $curDir -Filter $_ -Recurse -ea SilentlyContinue}
  $netlf=Get-ChildItem -Path $curDir -Filter 'netlify.toml' -Recurse -ea SilentlyContinue
  $ok=@{Cur=($null -ne $cur); CurFiles=($curMan.Count -gt 0); WF=($wfs.Count -gt 0); Build=($build.Count -gt 0); V561=(($hit|?{$_.Pattern -eq 'v5.6.1'}).Count -ge 1); Title=(($hit|?{$_.Pattern -eq 'Camino Measures'}).Count -ge 1); Netlify=($netlf -ne $null -and $netlf.Count -ge 1); Missing=$missing.Count}
  $sb=[Text.StringBuilder]::new()
  $null=$sb.AppendLine("# Dev-Platform Continuity Report ($stamp)")
  $null=$sb.AppendLine("- Current: " + (if($cur){$cur.Name}else{"(not found)"}))
  $null=$sb.AppendLine("- v1     : " + (if($v1){$v1.Name}else{"(not found)"}))
  function P($b,$t){ (if($b){"✅"}else{"⚠️"}) + " " + $t }
  $null=$sb.AppendLine(""); $null=$sb.AppendLine(P $ok.Cur      "Current ZIP present")
  $null=$sb.AppendLine(P $ok.CurFiles "Current ZIP extracted & has files")
  $null=$sb.AppendLine(P $ok.WF       ".github/workflows present")
  $null=$sb.AppendLine(P $ok.Build    "Build files present (package.json/lockfiles)")
  $null=$sb.AppendLine(P $ok.V561     "Version marker 'v5.6.1' found")
  $null=$sb.AppendLine(P $ok.Title    "Project marker 'Camino Measures' found")
  $null=$sb.AppendLine(P $ok.Netlify  "netlify.toml present (optional)")
  if($v1){ $null=$sb.AppendLine( (if($ok.Missing -eq 0){"✅"}else{"⚠️"}) + " Missing vs v1: " + $ok.Missing )
    if($ok.Missing -gt 0){ $null=$sb.AppendLine("First 20 missing:"); ($missing|select -First 20)|%{ $null=$sb.AppendLine("- "+$_) } }
  }
  [IO.File]::WriteAllText( (Join-Path $devCap "continuity-report-$stamp.md"), $sb.ToString(), [Text.Encoding]::UTF8 )
  return @{Ok=$ok}
}
$cont=New-Cont; Write-Host "✅ Continuity sjekk ferdig." -ForegroundColor Green

# 2) Archive gamle ZIPs (v1 + gamle ops-workflow)
function Archive-Zips{
  $archDev=Join-Path $handover "archive\dev-platform-v1\$stamp"
  $archOps=Join-Path $handover "archive\ops-workflow\$stamp"
  $null=New-Item -ItemType Directory -Force -Path $archDev,$archOps|Out-Null
  $z1=Get-ChildItem $handover -File -Filter 'dev-platform-v1-handover*.zip' -ea SilentlyContinue
  $z2=Get-ChildItem $handover -File -Filter 'ops-workflow-handover*.zip' -ea SilentlyContinue
  foreach($z in $z1){ $dst=Join-Path $archDev $z.Name; if($Preview){Say "PREVIEW: $($z.Name) -> $dst" 'warn'} elseif($DoIt){ Move-Item $z.FullName $dst -Force; Say "MOVED: $($z.Name) -> archive/dev-platform-v1" 'ok' } }
  foreach($z in $z2){ $dst=Join-Path $archOps $z.Name; if($Preview){Say "PREVIEW: $($z.Name) -> $dst" 'warn'} elseif($DoIt){ Move-Item $z.FullName $dst -Force; Say "MOVED: $($z.Name) -> archive/ops-workflow" 'ok' } }
}
Archive-Zips

# 3) Normalize Index (fjern v1, behold siste per ChatKey)
function Normalize-Index{
  if(-not (Test-Path $idxPath)){
    $tbl=@("# AidMe – Handover-oversikt","| ChatKey | Sist oppdatert | ZIP-sti |","|---------|-----------------|---------|")
    if($DoIt){ ($tbl -join "`r`n")|Set-Content $idxPath -Encoding UTF8 } else { Say "PREVIEW: ville initialisert index." 'warn' }
    return
  }
  $raw=Get-Content $idxPath -Raw -Encoding UTF8
  $rows = ($raw -split "`r?`n") | ? { $_ -match '^\|\s*\S' -and $_ -notmatch '^\|[- ]+\|' }
  $rows = $rows | ? { $_ -notmatch '^\|\s*dev-platform-v1\s*\|' }
  $map=@{}
  foreach($r in $rows){
    $p=($r -split '\|').ForEach({$_.Trim()})|?{$_}; if($p.Count -lt 3){continue}
    $k,$ts=$p[0],$p[1]
    if(-not $map.ContainsKey($k)){$map[$k]=$r}else{
      $prev=($map[$k] -split '\|').ForEach({$_.Trim()})|?{$_}
      if([datetime]::Parse($ts) -ge [datetime]::Parse($prev[1])){$map[$k]=$r}
    }
  }
  $out=@("# AidMe – Handover-oversikt","| ChatKey | Sist oppdatert | ZIP-sti |","|---------|-----------------|---------|")
  $out += $map.GetEnumerator()|Sort-Object Name|%{$_.Value}
  if($Preview){ Say "PREVIEW: ville skrevet normalisert index (rader: $($out.Count-3))." 'warn' }
  if($DoIt){ ($out -join "`r`n")|Set-Content $idxPath -Encoding UTF8; Say "✅ Index normalisert." 'ok' }
}
Normalize-Index

# 4) Snapshot + Index for ops-workflow
function Snapshot-Ops{
  $note=Join-Path $capOps "snapshot-$stamp.md"
  if($Preview){ Say "PREVIEW: ville laget snapshot ($note) og zip $zipOps" 'warn' }
  if($DoIt){
    "# Snapshot – $opsCk ($stamp)`n- Arkiv/rydd & ren baseline`n- Reply-flyt aktiv" | Set-Content $note -Encoding UTF8
    if(Test-Path $zipOps){ Remove-Item $zipOps -Force }
    Compress-Archive -Path $capOps,$outOps,$appOps -DestinationPath $zipOps -Force
    $ts=(Get-Date).ToString('yyyy-MM-dd HH:mm'); $row="| $opsCk | $ts | $zipOps |"
    if(!(Test-Path $idxPath)){ ("# AidMe – Handover-oversikt","| ChatKey | Sist oppdatert | ZIP-sti |","|---------|-----------------|---------|",$row) -join "`r`n" | Set-Content $idxPath -Encoding UTF8 }
    else{ $raw=Get-Content $idxPath -Raw; $l=$raw -split "`r?`n"
      $hit=$l|Select-String "^\|\s*$([regex]::Escape($opsCk))\s*\|"|Select -First 1
      if($hit){ $l[$hit.LineNumber-1]=$row } else { $l += $row }
      ($l -join "`r`n")|Set-Content $idxPath -Encoding UTF8
    }
    Say "✅ Snapshot & index oppdatert (ops-workflow)." 'ok'
  }
}
Snapshot-Ops

# 5) Outbox-utkast + (ev.) send
function Ensure-Approve{ if(Get-Command Approve-AidReply -ea SilentlyContinue){$true}else{ Say "⚠️ Approve-AidReply ikke funnet. Skriver kun utkast." 'warn'; $false } }
function Write-Drafts{
  $d1=Join-Path $outOps 'draft-dev-platform-status.md'
  $d2=Join-Path $outOps 'draft-product-roadmap-sync.md'
  $d3=Join-Path $outOps 'draft-turplan-camino-avklaringer.md'
@"
## Ops → dev-platform : kort status og kapasitet
- Bekreft at dere ser siste autosplit (minst ~13 filer i captures).
- Oppgi om dere har kapasitet til 1–2 små oppgaver fra *ideer-lab* denne uken.
- List ev. avhengigheter (data, design, beslutning).
"@ | Set-Content $d1 -Encoding UTF8
@"
## Ops → product-roadmap : synk m/ dev-platform
- Foreslå 2–3 kandidater fra *ideer-lab* som kan merkes **Ready for Dev**.
- Koble hver kandidat til en milepæl/epic og legg tentativ sprint-slot.
"@ | Set-Content $d2 -Encoding UTF8
@"
## Ops → turplan-camino : påvirkning på partner-tilskudd
- Har siste reiseplan-endringer konsekvens for frister/innsendelser i *partner-tilskudd*?
- Hvis ja, noter hva som flyttes og forslag til oppdatert tidslinje.
"@ | Set-Content $d3 -Encoding UTF8
  Say "✅ Utkast skrevet i $outOps" 'ok'
  @{D1=$d1;D2=$d2;D3=$d3}
}
$drafts=Write-Drafts
if($SendPings -and $DoIt){
  if(Ensure-Approve){
    Approve-AidReply -DraftPath $drafts.D1 -TargetChatKey 'dev-platform'   -Title 'ops-forespørsel-kapasitet'
    Approve-AidReply -DraftPath $drafts.D2 -TargetChatKey 'product-roadmap' -Title 'ops-sync-roadmap-dev'
    Approve-AidReply -DraftPath $drafts.D3 -TargetChatKey 'turplan-camino'  -Title 'ops-avklaringer-tilskudd'
    $ping=Join-Path $outOps 'draft-test-ping.md'
    "# Ops → dev-platform: ping ($stamp)"|Set-Content $ping -Encoding UTF8
    Approve-AidReply -DraftPath $ping -TargetChatKey 'dev-platform' -Title 'ops-ping'
    Say "📡 Akutt-meldinger + ping sendt." 'ok'
  }
} else { Say "ℹ️ Utkast klare. Sendes når du velger DoIt + SendPings=yes." 'warn' }

# 6) Sluttstatus
Say "=== Sluttstatus ==="
Say ("v5.6.1-markør funnet: {0}" -f $cont.Ok.V561) (if($cont.Ok.V561){'ok'}else{'warn'})
Say ("Workflows funnet: {0}"      -f $cont.Ok.WF)   (if($cont.Ok.WF){'ok'}else{'warn'})
'@

# 3) Kjør alt-i-ett (med valgene dine)
Invoke-Command -ScriptBlock ([ScriptBlock]::Create($script)) -ArgumentList @($Preview,$DoIt,$SendPings,$SkipBackup)
