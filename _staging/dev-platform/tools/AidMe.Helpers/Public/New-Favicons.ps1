function New-Favicons {
  [CmdletBinding()] param([Parameter(Mandatory)][string]$Src,[string]$OutDir="public")
  & "C:\Dev\my-camino\tools\favicons.ps1" -Src $Src -OutDir $OutDir
}
