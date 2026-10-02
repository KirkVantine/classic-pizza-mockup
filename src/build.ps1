# Inlines the food photo and Big Holler prices into a single shareable HTML file.
Add-Type -AssemblyName System.Drawing
$root = Split-Path $PSScriptRoot -Parent
$src  = Join-Path $PSScriptRoot 'mockup.html'
$out  = Join-Path $root 'classic-pizza-mockup.html'
$assets = Join-Path $PSScriptRoot 'assets'
New-Item -ItemType Directory -Force $assets | Out-Null

foreach ($f in @(@('slide-1.jpg','img/slideshow/slide-1.jpg'))) {
  $p = Join-Path $assets $f[0]
  if (-not (Test-Path $p)) { curl.exe -sL -o $p "https://www.eatclassicpizza.com/$($f[1])" }
}

function Get-JpegDataUri($path, $maxW, $quality) {
  $img = [System.Drawing.Image]::FromFile($path)
  $w = [Math]::Min($maxW, $img.Width); $h = [int]($img.Height * $w / $img.Width)
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.DrawImage($img, 0, 0, $w, $h)
  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
  $ep = New-Object System.Drawing.Imaging.EncoderParameters 1
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]$quality)
  $ms = New-Object System.IO.MemoryStream
  $bmp.Save($ms, $codec, $ep)
  $g.Dispose(); $bmp.Dispose(); $img.Dispose()
  'data:image/jpeg;base64,' + [Convert]::ToBase64String($ms.ToArray())
}

$html = [IO.File]::ReadAllText($src)
# Menu rendered to plain HTML (works even where scripts are blocked), priced from data/menu-prices.json
$OutputEncoding = [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding $false
$json = node (Join-Path $PSScriptRoot 'render-menu.mjs')
if ($LASTEXITCODE -ne 0) { throw 'render-menu.mjs failed' }
$fragments = ($json -join "`n") | ConvertFrom-Json
foreach ($p in $fragments.PSObject.Properties) { $html = $html.Replace("{{$($p.Name)}}", $p.Value) }
$html = $html.Replace('{{PHOTO}}', (Get-JpegDataUri (Join-Path $assets 'slide-1.jpg') 1200 72))
if ($html -match '\{\{[A-Z_]+\}\}') { throw "Unfilled placeholder: $($Matches[0])" }
[IO.File]::WriteAllText($out, $html, (New-Object System.Text.UTF8Encoding $false))
# GitHub Pages serves index.html at the site root
[IO.File]::WriteAllText((Join-Path $root 'index.html'), $html, (New-Object System.Text.UTF8Encoding $false))
"Wrote $out ($([Math]::Round((Get-Item $out).Length/1KB)) KB)"
