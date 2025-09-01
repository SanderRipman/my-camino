# Dot-source alle public-funksjoner
Get-ChildItem -Path (Join-Path $PSScriptRoot "Public") -Filter *.ps1 | ForEach-Object { . $_.FullName }
Export-ModuleMember -Function * -Alias *

Get-ChildItem -Path $PSScriptRoot/Public/*.ps1 | ForEach-Object { . $_.FullName }
