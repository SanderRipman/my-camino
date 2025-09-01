param([Parameter(Mandatory)][string]$Src,[string]$OutDir="public",[string]$Theme="#0F2F2E",[string]$Bg="#0F2F2E")
if (!(Test-Path $Src)) { throw "Fant ikke kildebildet: $Src" }
New-Item -ItemType Directory -Path $OutDir -ErrorAction SilentlyContinue | Out-Null
magick "$Src" -resize 512x512 "$OutDir\favicon-512.png"
magick "$Src" -resize 192x192 "$OutDir\favicon-192.png"
magick "$Src" -resize 180x180 "$OutDir\apple-touch-icon.png"
magick "$Src" -resize 32x32   "$OutDir\favicon-32.png"
magick "$Src" -resize 16x16   "$OutDir\favicon-16.png"
magick "$Src" -background none -alpha on `
  ( "$OutDir\favicon-16.png", "$OutDir\favicon-32.png", "$OutDir\apple-touch-icon.png" ) `
  -colors 256 -depth 8 "$OutDir\favicon.ico"
@"
{
  "name":"AidMe",
  "short_name":"AidMe",
  "icons":[
    { "src": "/favicon-192.png","sizes":"192x192","type":"image/png"},
    { "src": "/favicon-512.png","sizes":"512x512","type":"image/png"}
  ],
  "theme_color":"$Theme",
  "background_color":"$Bg",
  "display":"standalone"
}
"@ | Set-Content -Encoding utf8 "$OutDir\site.webmanifest"
Write-Host "✅ Favicons og manifest generert i .\public" -ForegroundColor Green
