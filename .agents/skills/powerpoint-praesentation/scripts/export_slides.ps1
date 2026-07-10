# Exportiert jede Folie einer .pptx als PNG, per PowerPoint-COM-Automatisierung.
# Nutzung: powershell -File export_slides.ps1 -PptxPath <pfad.pptx> -OutDir <ordner>
#
# Dient der visuellen QA nach dem Bauen der Präsentation: Vergleich der echten
# PowerPoint-Wiedergabe (hier) gegen die Chromium-Referenzbilder (ref-N.png aus
# render_slides.js), um Font-Substitutions-bedingte Verschiebungen zu erkennen.

param(
  [Parameter(Mandatory=$true)][string]$PptxPath,
  [Parameter(Mandatory=$true)][string]$OutDir
)

$PptxPath = (Resolve-Path $PptxPath).Path
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$OutDir = (Resolve-Path $OutDir).Path

$ppt = New-Object -ComObject PowerPoint.Application
try {
  $pres = $ppt.Presentations.Open($PptxPath, $true, $true, $false)
  $pres.SaveAs($OutDir + "\slide", 18)  # 18 = ppSaveAsPNG -> ein Unterordner mit Folie1.PNG, Folie2.PNG, ...
  $pres.Close()
  Write-Output "Exportiert nach: $OutDir"
} finally {
  $ppt.Quit()
}
