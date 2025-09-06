function Import-AidMarkdown {
  [CmdletBinding()] param([string]$Root="C:\Dev\my-camino",[string]$ChatKey="dev-platform-v1",[string]$Title)
  $capDir = Join-Path $Root "handover\captures\$ChatKey"; New-Item -ItemType Directory -Force -Path $capDir | Out-Null
  if(-not $Title){ $Title = "dump-{0:yyyyMMdd-HHmmss}" -f (Get-Date) }
  $file = Join-Path $capDir ("$($Title -replace '[^\w\- ]','').md")
  Set-Content -Path $file -Value "# Lim inn fulltekst her`r`n" -Encoding UTF8
  Start-Process notepad.exe $file -Wait
  Write-AidNote -Path (Join-Path $Root "handover\$ChatKey-notes.md") -Content ("#### Import Markdown`r`n- Fil: $([IO.Path]::GetFileName($file))")
  Write-Host "Importert til $file" -ForegroundColor Green
}
