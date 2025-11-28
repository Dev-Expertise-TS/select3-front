# 빌드 스크립트 - baseline-browser-mapping 경고 필터링
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 빌드 실행 및 출력을 실시간으로 필터링
$process = Start-Process -FilePath "pnpm" -ArgumentList "next", "build" -NoNewWindow -Wait -PassThru -RedirectStandardOutput "temp_build_output.txt" -RedirectStandardError "temp_build_error.txt"

# 출력 파일 읽기 및 필터링 (UTF8 인코딩 명시)
$output = Get-Content "temp_build_output.txt" -Encoding UTF8 -ErrorAction SilentlyContinue
$errorOutput = Get-Content "temp_build_error.txt" -Encoding UTF8 -ErrorAction SilentlyContinue

# 경고 메시지 필터링
if ($output) {
    $output | Where-Object { $_ -notmatch 'baseline-browser-mapping' } | ForEach-Object { Write-Host $_ }
}
if ($errorOutput) {
    $errorOutput | Where-Object { $_ -notmatch 'baseline-browser-mapping' } | ForEach-Object { Write-Host $_ -ForegroundColor Red }
}

# 임시 파일 삭제
Remove-Item "temp_build_output.txt" -ErrorAction SilentlyContinue
Remove-Item "temp_build_error.txt" -ErrorAction SilentlyContinue

exit $process.ExitCode

