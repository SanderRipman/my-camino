function Convert-AidNoteContent {
  param([string]$Content)
  if ($Content -match '^#\s*handover\b'){ return "#### Handover`r`n- Snapshot kjørt/planlagt`r`n- ZIP: (fyll inn hvis kjent)`r`n- Kommentar: " }
  if ($Content -match '^#\s*dev-plan\b'){ return "#### Dev-plan`r`n- Mål:`r`n- Milepæler:`r`n- Risiko:`r`n- Neste steg:" }
  if ($Content -match '^#\s*todo\b'){ return "#### TODO`r`n- [ ] Oppgave 1`r`n- [ ] Oppgave 2`r`n- [ ] Oppgave 3" }
  return $Content
}
