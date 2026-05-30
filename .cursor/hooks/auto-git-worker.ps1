# =============================================================================
# auto-git-worker.ps1
# Debounced auto-git: 마지막 파일 수정 후 8초 뒤 커밋
# =============================================================================
param(
    [Parameter(Mandatory = $true)][string]$ProjectRoot,
    [Parameter(Mandatory = $true)][string]$PendingTick
)

Start-Sleep -Seconds 8

$tickFile = Join-Path $ProjectRoot '.cursor\hooks\.auto-git-tick'
if (-not (Test-Path $tickFile)) { exit 0 }

$current = Get-Content -Path $tickFile -Raw
if ($current.Trim() -ne $PendingTick.Trim()) { exit 0 }

Set-Location $ProjectRoot
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $ProjectRoot '.cursor\hooks\auto-git.ps1') -Immediate
exit 0
