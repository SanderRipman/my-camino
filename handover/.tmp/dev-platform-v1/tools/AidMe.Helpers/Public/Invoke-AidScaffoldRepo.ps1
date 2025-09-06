function Invoke-AidScaffoldRepo {
  param([string]$Root="C:\Dev\my-camino")
  $gi = Join-Path $Root '.gitignore'
  if (-not (Test-Path $gi)) {
@"
# AidMe
handover\*.zip
handover\logs\
*-report.json

# Node/Netlify
node_modules/
"@ | Set-Content $gi -Encoding UTF8
    Write-Host "Created .gitignore" -ForegroundColor Green
  }
  $ga = Join-Path $Root '.gitattributes'
  if (-not (Test-Path $ga)) {
@"
* text=auto eol=lf
*.zip binary
"@ | Set-Content $ga -Encoding UTF8
    Write-Host "Created .gitattributes" -ForegroundColor Green
  }
  $wf = Join-Path $Root '.github\workflows'; New-Item -ItemType Directory -Force -Path $wf | Out-Null
  $psci = Join-Path $wf 'ps-ci.yml'
  if (-not (Test-Path $psci)) {
@"
name: ps-ci
on:
  push: { branches: [ dev, main ] }
  pull_request: { branches: [ dev, main ] }
jobs:
  ci:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup PowerShell
        uses: PowerShell/PowerShell@v1
        with: { version: "7.4.x" }
      - name: Install PSScriptAnalyzer
        shell: pwsh
        run: |
          Install-Module PSScriptAnalyzer -Scope CurrentUser -Force
          Invoke-ScriptAnalyzer -Path tools/AidMe.Helpers -Recurse -Severity Warning,Error
      - name: Pester tests
        shell: pwsh
        run: |
          Install-Module Pester -Scope CurrentUser -Force
          if (Test-Path tests) { Invoke-Pester -CI } else { Write-Host "No tests folder" }
"@ | Set-Content $psci -Encoding UTF8
    Write-Host "Created ps-ci.yml" -ForegroundColor Green
  }
  $pack = Join-Path $wf 'handover-pack.yml'
  if (-not (Test-Path $pack)) {
@"
name: handover-pack
on:
  workflow_dispatch:
  push:
    branches: [ dev ]
    paths:
      - "tools/**"
      - ".github/workflows/**"
      - "scripts/**"
jobs:
  pack:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup PowerShell
        uses: PowerShell/PowerShell@v1
        with: { version: "7.4.x" }
      - name: Build handover zip
        shell: pwsh
        run: |
          if (-not (Test-Path .\handover)) { New-Item -ItemType Directory -Force -Path .\handover | Out-Null }
          $paths = @('.\tools','.\scripts','.\.github\workflows','.\README.md') | ? { Test-Path $_ }
          Compress-Archive -Path $paths -DestinationPath .\handover\dev-platform-v1-handover.zip -Force
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: dev-platform-v1-handover
          path: handover/dev-platform-v1-handover.zip
"@ | Set-Content $pack -Encoding UTF8
    Write-Host "Created handover-pack.yml" -ForegroundColor Green
  }
}
