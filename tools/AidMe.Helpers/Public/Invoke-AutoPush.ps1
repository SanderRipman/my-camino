function Invoke-AutoPush {
  [CmdletBinding()] param([string]$Branch='dev')
  & "C:\Dev\my-camino\tools\auto-push.ps1" -Branch $Branch
}
