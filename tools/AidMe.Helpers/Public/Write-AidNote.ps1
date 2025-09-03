function Write-AidNote {
  [CmdletBinding()]
  param([Parameter(Mandatory)][string]$Path,[Parameter(Mandatory)][string]$Content)
  $dir = Split-Path -Parent $Path
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $ts = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $block = "`r`n`r`n### $ts`r`n$((Convert-AidNoteContent $Content))`r`n"
  $tmp = "$Path.tmp"
  for($i=1;$i -le 3;$i++){
    try{
      if(Test-Path $Path){
        Get-Content -Raw -LiteralPath $Path | Set-Content -LiteralPath $tmp -Encoding UTF8
        Add-Content -LiteralPath $tmp -Value $block -Encoding UTF8
        Move-Item -Force $tmp $Path
      } else {
        Set-Content -LiteralPath $Path -Value "# Notes ($(Split-Path -LeafBase $Path))" -Encoding UTF8
        Add-Content -LiteralPath $Path -Value $block -Encoding UTF8
      }
      return
    } catch { Start-Sleep -Milliseconds (150*$i); if(Test-Path $tmp){Remove-Item $tmp -Force -ea 0}; if($i -eq 3){ throw } }
  }
}
