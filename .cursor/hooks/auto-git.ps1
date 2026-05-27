# =============================================================================
# auto-git.ps1
# 에이전트 작업 완료 시 자동으로 변경사항을 git에 커밋 & 푸시
# =============================================================================

$git         = "C:\Program Files\Git\cmd\git.exe"
$projectPath = "C:\Users\NICE\Desktop\신규메뉴"

Set-Location $projectPath

# 변경사항이 있는지 확인
$status = & $git status --porcelain 2>$null
if (-not $status) {
    # 변경 없음 → 조용히 종료
    exit 0
}

# 현재 시각으로 커밋 메시지 생성
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"

& $git add .
& $git commit -m "auto: $timestamp 작업 자동 저장"
& $git push

exit 0
