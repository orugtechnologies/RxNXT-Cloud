$ErrorActionPreference = 'Stop'
$ppt = New-Object -ComObject PowerPoint.Application
$pres = $ppt.Presentations.Open('C:\Users\orugt\Desktop\RxNXT_50L_Funding_Pitch_Presentation.pptx', -1, 0, 0)
$outDir = 'C:\Users\orugt\.gemini\antigravity\brain\6756907e-7d00-41fe-8828-530536a8dd20'

for ($i = 1; $i -le $pres.Slides.Count; $i++) {
    $outPath = Join-Path $outDir "slide_$i.png"
    $pres.Slides.Item($i).Export($outPath, 'PNG', 1920, 1080)
    Write-Host "Exported Slide $i to $outPath"
}

$pres.Close()
$ppt.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
Write-Host "ALL SLIDES EXPORTED SUCCESSFULLY"
