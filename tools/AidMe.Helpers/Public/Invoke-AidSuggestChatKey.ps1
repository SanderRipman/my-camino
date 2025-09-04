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
    'aidme-core'     = @('feature','funksjon','ui','ux','api','modell','schema','metrics','måling','produkt','versjon','release','camino measures','frontend','backend','design','spesifikasjon')
    'ops-workflow'   = @('ci','cd','pipeline','github','workflow','netlify','deploy','pr','release note','drift','prosess','rutine','runbook','backup','script','ps7','powershell')
    'turplan-camino' = @('camino','etappe','rute','reise','logistikk','booking','kart')
    'product-roadmap'= @('roadmap','priorit','milepæl','milestone','epic')
    'ideer-lab'      = @('idé','ideer','prototype','skisse','brainstorm')
    'pilot-studier'  = @('pilot','testgruppe','feedback','beta')
    'partner-tilskudd'= @('partner','tilskudd','grant','søknad','finansier','støtte')
    'forskning-studier'= @('studie','forskning','paper','kilde','review','evidence')
    'inbox'          = @() # fallback
  }
  $scores=@{}; $lc=$Text.ToLower()
  foreach($k in $map.Keys){ $scores[$k]=($map[$k] | % { ($lc -split '\W+') -contains $_ }).Where({$_}).Count }
  $top = $scores.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 2
  $suggest = $top | % { $_.Key }
  $final=@(); foreach($s in $suggest){ $hit = $existing | ? { $_ -like "$s*" } | Select-Object -First 1; $final += ($hit ?? $s) }
  ,(($final + 'inbox') | Select-Object -Unique)
}
