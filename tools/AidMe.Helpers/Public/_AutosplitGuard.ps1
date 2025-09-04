function ConvertTo-AidSafeChatKey {
  param([string]$Suggested)
  if (-not $Suggested) { return 'inbox' }
  $clean = ($Suggested -replace '[^\w\-]','-').ToLower()
  # Ta kun første "ord" hvis flere ble limt sammen
  if ($clean -match '^([a-z0-9\-]+)') { $clean = $Matches[1] }
  if ($global:AidAllowedChatKeys -contains $clean) { return $clean }
  return 'inbox'
}
