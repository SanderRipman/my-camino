function Invoke-AidSuggestChatKey {
  [CmdletBinding()]
  param([Parameter(Mandatory)][string]$Text,[string]$Root="C:\Dev\my-camino")
  $index = Join-Path $Root 'AidMe-Index.md'
  $existing = @()
  if (Test-Path $index) {
    $existing = (Select-String -Path $index -Pattern '^\|\s*([^\|]+)\s*\|' -AllMatches).Matches |
      ForEach-Object { ($_ -split '\|')[1].Trim() } | Sort-Object -Unique
  }
  $map = [ordered]@{
    'dev-platform'      = @('powershell','ps7','script','workflow','ci','github','netlify','deploy','module','aidme.helpers','feature','action')
    'product-roadmap'   = @('roadmap','feature map','milestone','priorit','product')
    'ideer-lab'         = @('idé','ideer','prototype','skisse','brainstorm')
    'pilot-studier'     = @('pilot','bruke','testgruppe','feedback','beta')
    'partner-tilskudd'  = @('partner','tilskudd','grant','finansier','støtte')
    'turplan-camino'    = @('camino','reise','rute','etappe','logistikk')
    'forskning-studier' = @('studie','forskning','evidence','paper','kilde','review')
  }
  $scores=@{}; $lc=$Text.ToLower()
  foreach($k in $map.Keys){ $scores[$k]=($map[$k] | % { ($lc -split '\W+') -contains $_ }).Where({$_}).Count }
  $top = $scores.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 2
  $suggest = $top | % { $_.Key }
  $final=@(); foreach($s in $suggest){ $hit = $existing | ? { $_ -like "$s*" } | Select-Object -First 1; $final += ($hit ?? $s) }
  ,($final | Select-Object -Unique)
}
