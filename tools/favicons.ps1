param([Parameter(Mandatory=$true)][string]$Src)
$OutDir="public"; $Index="index.html"; $Theme="#0F2F2E"; $Bg="#0F2F2E"
New-Item -ItemType Directory -Path $OutDir -ErrorAction SilentlyContinue | Out-Null
magick "$Src" -resize 512x512 "$OutDir\favicon-512.png"
magick "$Src" -resize 192x192 "$OutDir\favicon-192.png"
