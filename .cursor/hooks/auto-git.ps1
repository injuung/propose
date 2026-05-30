# =============================================================================
# auto-git.ps1
# Cursor hook: 변경사항이 있으면 자동 git commit & push
#   -Immediate  : 에이전트 작업 완료(stop) 시 즉시 커밋
#   -Debounced  : 파일 수정(afterFileEdit) 후 8초 뒤 커밋 (연속 수정은 한 번에)
# =============================================================================
param(
    [switch]$Immediate,
    [switch]$Debounced
)

if (-not $Immediate -and -not $Debounced) { $Immediate = $true }

$git = Get-Command git -ErrorAction SilentlyContinue
if (-not $git) { exit 0 }

$root = & git rev-parse --show-toplevel 2>$null
if (-not $root) { exit 0 }

Set-Location $root

$hooksDir  = Join-Path $root '.cursor\hooks'
$tickFile  = Join-Path $hooksDir '.auto-git-tick'
$worker    = Join-Path $hooksDir 'auto-git-worker.ps1'

if (-not (Test-Path $hooksDir)) {
    New-Item -ItemType Directory -Path $hooksDir -Force | Out-Null
}

if ($Debounced) {
    $tick = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    Set-Content -Path $tickFile -Value $tick -NoNewline

    Start-Process powershell.exe -WindowStyle Hidden -ArgumentList @(
        '-NoProfile', '-ExecutionPolicy', 'Bypass',
        '-File', $worker,
        '-ProjectRoot', $root,
        '-PendingTick', $tick
    ) | Out-Null
    exit 0
}

function Invoke-AutoGitCommit {
    $status = & git status --porcelain 2>$null
    if (-not $status) { return }

    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
    & git add -A

    # 민감 파일은 스테이징에서 제외
    foreach ($secret in @('.env', '.env.local', 'credentials.json', 'secrets.json')) {
        if (Test-Path (Join-Path $root $secret)) {
            & git reset HEAD -- $secret 2>$null
        }
    }

    $staged = & git diff --cached --name-only 2>$null
    if (-not $staged) { return }

    $summary = ($staged | Select-Object -First 3) -join ', '
    if ($staged.Count -gt 3) {
        $summary += " (+$($staged.Count - 3) more)"
    }

    $msg = "auto: save $summary ($timestamp)"
    & git commit -m $msg 2>$null
    if ($LASTEXITCODE -ne 0) { return }

    & git push 2>$null
}

Invoke-AutoGitCommit
exit 0
