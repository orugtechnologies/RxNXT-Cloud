Get-ChildItem -Path app\api -Recurse -Filter route.ts | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -notmatch "export const dynamic = 'force-dynamic';") {
        $newContent = "export const dynamic = 'force-dynamic';`n" + $content
        Set-Content -Path $_.FullName -Value $newContent
    }
}
