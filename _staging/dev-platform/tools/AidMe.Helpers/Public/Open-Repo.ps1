function Open-Repo {
  [CmdletBinding()] param()
  Set-Location "C:\Dev\my-camino"
  git status | Out-Host
}
