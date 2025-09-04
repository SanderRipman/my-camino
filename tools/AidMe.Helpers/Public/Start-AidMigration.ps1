function Start-AidMigration {
  [CmdletBinding()] param([string]$Root="C:\Dev\my-camino",[string]$DefaultKey="inbox")
  while ($true) {
    Clear-Host
    Write-Host "== Migration Menu ==" -ForegroundColor Cyan
    Write-Host "[1] Importer én offentlig link"
    Write-Host "[2] Bulk-import (flere linker)"
    Write-Host "[3] Notat m/kodeord (#handover/#dev-plan/#todo)"
    Write-Host "[4] Ny ChatKey (+ snapshot)"
    Write-Host "[5] Capture (auto tittel/chatkey/oppsummering/splitt)"
    Write-Host "[I] Importer Markdown (fulltekst dump)"
    Write-Host "[A] AutoSplit siste i en chatkey"
    Write-Host "[Q] Tilbake"
    $sel = Read-Host "Choose"
    switch($sel.ToUpper()){
      'I' {
        $ck = Read-Host "ChatKey (tomt = $DefaultKey)"; if([string]::IsNullOrWhiteSpace($ck)){ $ck=$DefaultKey }
        $t  = Read-Host "Tittel (valgfritt)"
        $file = Import-AidMarkdownQuick -Root $Root -ChatKey $ck -Title $t -ReturnPath
        $ans = Read-Host "Kjør AutoSplit på det du nettopp importerte? (Y/n)"
        if ($ans -notin @('n','N','no','No')) { Invoke-AidAutoSplitCapture -SourceFile $file -Root $Root; Pause-Aid }
      }
      'A' { $ck = Read-Host "ChatKey (tomt = $DefaultKey)"; if([string]::IsNullOrWhiteSpace($ck)){ $ck=$DefaultKey }; Invoke-AidAutoSplitCapture -ChatKey $ck -Root $Root; Pause-Aid }
      '1' { $ck = Read-Host "ChatKey (tomt = $DefaultKey)"; if([string]::IsNullOrWhiteSpace($ck)){ $ck=$DefaultKey }
            $url = Read-Host "Offentlig URL"
            Write-AidNote -Path (Join-Path $Root "handover\$ck-notes.md") -Content ("#handover`r`n#legacy-link`r`n$url")
            Add-AidIndexEntry -ChatKey $ck -ZipPath (Join-Path $Root "handover\$ck-handover.zip"); Pause-Aid }
      '2' { $ck = Read-Host "ChatKey (tomt = $DefaultKey)"; if([string]::IsNullOrWhiteSpace($ck)){ $ck=$DefaultKey }
            Write-Host "Lim inn linker (tom linje avslutter):"
            $lines=@(); while ($true){ $l = Read-Host; if([string]::IsNullOrWhiteSpace($l)){break}; $lines += $l }
            foreach($u in $lines){ Write-AidNote -Path (Join-Path $Root "handover\$ck-notes.md") -Content ("#legacy-link`r`n$u") }
            Add-AidIndexEntry -ChatKey $ck -ZipPath (Join-Path $Root "handover\$ck-handover.zip"); Pause-Aid }
      '3' { $ck = Read-Host "ChatKey (tomt = $DefaultKey)"; if([string]::IsNullOrWhiteSpace($ck)){ $ck=$DefaultKey }
            $note = Read-Host "Notat (støtter #handover #dev-plan #todo)"
            Write-AidNote -Path (Join-Path $Root "handover\$ck-notes.md") -Content $note; Pause-Aid }
      '4' { $ck = Read-Host "Ny ChatKey (eks: research-insights-v1)"; if($ck){ New-AidChatKey -ChatKey $ck -Root $Root -Snapshot }; Pause-Aid }
      '5' { Start-AidSmartCapture -Root $Root -DefaultKey $DefaultKey; Pause-Aid }
      'Q' { return }
      default { return }
    }
  }
}
