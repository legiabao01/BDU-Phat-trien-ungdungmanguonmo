# Script để commit thư mục Webhoctructuyen lên GitHub
# Repository: https://github.com/hangtr29/Web-vnl.git

# Chuyển vào thư mục Webhoctructuyen
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Green

# Kiểm tra Git identity
$userName = git config --global user.name 2>$null
$userEmail = git config --global user.email 2>$null

if (-not $userName -or -not $userEmail) {
    Write-Host "`n⚠️  Git identity chưa được cấu hình!" -ForegroundColor Red
    Write-Host "Vui lòng chạy các lệnh sau trước:" -ForegroundColor Yellow
    Write-Host "  git config --global user.name `"Tên của bạn`"" -ForegroundColor Cyan
    Write-Host "  git config --global user.email `"email@example.com`"" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Hoặc chỉ cho repository này:" -ForegroundColor Yellow
    Write-Host "  git config user.name `"Tên của bạn`"" -ForegroundColor Cyan
    Write-Host "  git config user.email `"email@example.com`"" -ForegroundColor Cyan
    Write-Host ""
    exit 1
} else {
    Write-Host "Git identity: $userName <$userEmail>" -ForegroundColor Green
    Write-Host ""
}

# Kiểm tra xem đã có git repository chưa
if (-not (Test-Path .git)) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
}

# Kiểm tra remote origin
$remoteUrl = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Adding remote origin..." -ForegroundColor Yellow
    git remote add origin https://github.com/hangtr29/Web-vnl.git
} else {
    Write-Host "Remote origin already exists: $remoteUrl" -ForegroundColor Cyan
    # Cập nhật URL nếu cần
    git remote set-url origin https://github.com/hangtr29/Web-vnl.git
}

# Thêm tất cả file vào staging
Write-Host "Adding files to staging..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "Committing changes..." -ForegroundColor Yellow
$commitMessage = "Add Webhoctructuyen project"
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n⚠️  Lỗi khi commit!" -ForegroundColor Red
    Write-Host "Có thể không có thay đổi nào để commit hoặc đã commit rồi." -ForegroundColor Yellow
    Write-Host "Kiểm tra: git status" -ForegroundColor Cyan
} else {
    Write-Host "✅ Commit thành công!" -ForegroundColor Green
}

# Kiểm tra xem có commit nào không
$commitCount = (git log --oneline 2>$null | Measure-Object -Line).Lines
if ($commitCount -eq 0) {
    Write-Host "`n⚠️  Chưa có commit nào! Không thể push." -ForegroundColor Red
    Write-Host "Vui lòng commit trước khi push." -ForegroundColor Yellow
    exit 1
}

# Kiểm tra branch hiện tại
$currentBranch = git branch --show-current
if (-not $currentBranch) {
    Write-Host "Creating main branch..." -ForegroundColor Yellow
    git branch -M main
    $currentBranch = "main"
} elseif ($currentBranch -ne "main") {
    Write-Host "Renaming branch to main..." -ForegroundColor Yellow
    git branch -M main
    $currentBranch = "main"
}

# Push lên GitHub
Write-Host "`nPushing to GitHub..." -ForegroundColor Yellow
Write-Host "Branch: $currentBranch" -ForegroundColor Cyan
git push -u origin $currentBranch

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Done! Check your repository at: https://github.com/hangtr29/Web-vnl" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Push thất bại!" -ForegroundColor Red
    Write-Host "Có thể repository trên GitHub đã có code." -ForegroundColor Yellow
    Write-Host "Thử chạy:" -ForegroundColor Cyan
    Write-Host "  git pull origin main --allow-unrelated-histories" -ForegroundColor White
    Write-Host "  git push -u origin main" -ForegroundColor White
}

