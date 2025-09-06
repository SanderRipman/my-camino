function New-AidFeature {
  [CmdletBinding()]
  param([ValidateSet('module-fn','script','workflow')] [string]$Type,[Parameter(Mandatory)][string]$Name,[string]$Root="C:\Dev\my-camino")
  switch($Type){
    'module-fn' {
      $path = Join-Path $Root "tools\AidMe.Helpers\Public\$Name.ps1"
@"
function $Name {
  [CmdletBinding()]
  param()
  Write-Host '$Name running...' -ForegroundColor Cyan
}
"@ | Set-Content $path -Encoding UTF8
      Write-Host "Created module function: $path" -ForegroundColor Green
      Import-Module (Join-Path $Root 'tools\AidMe.Helpers') -Force
      Get-Command $Name | Format-List
    }
    'script' {
      $dir = Join-Path $Root 'scripts'; if(-not(Test-Path $dir)){New-Item -ItemType Directory -Force -Path $dir | Out-Null}
      $path = Join-Path $dir "$Name.ps1"
@"
param()
Write-Host 'Script $Name' -ForegroundColor Cyan
"@ | Set-Content $path -Encoding UTF8
      Write-Host "Created script: $path" -ForegroundColor Green
    }
    'workflow' {
      $dir = Join-Path $Root '.github\workflows'; if(-not(Test-Path $dir)){New-Item -ItemType Directory -Force -Path $dir | Out-Null}
      $path = Join-Path $dir "$($Name.ToLower()).yml"
@"
name: $Name
on: { workflow_dispatch: {} }
jobs:
  $($Name.ToLower()):
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo 'Hello from $Name'
"@ | Set-Content $path -Encoding UTF8
      Write-Host "Created workflow: $path" -ForegroundColor Green
    }
  }
}
