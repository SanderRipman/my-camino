# Auto-generert: start ACC i egen pwsh
param()
$here = Split-Path -Parent $(\System.Management.Automation.InvocationInfo.MyCommand.Path)
$root = if ($env:AIDME_ROOT) { $env:AIDME_ROOT } else { 'C:\Dev\my-camino' }
if (-not (Test-Path $root)) { throw "Ugyldig Root: $root" }
$acc  = Join-Path 'C:\Dev\my-camino\tools\ops' 'AidControlCenter.ps1'
pwsh -NoExit -ExecutionPolicy Bypass -File ""
