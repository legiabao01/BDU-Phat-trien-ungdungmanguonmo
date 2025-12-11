# Script chạy migration cho tài liệu và resources
# Usage: .\scripts\run-migration-resources.ps1

Write-Host "📄 Đang chạy migration cho tài liệu và resources..." -ForegroundColor Yellow

# Tìm psql.exe
$psqlPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
if (-not (Test-Path $psqlPath)) {
    $psqlPath = "C:\Program Files\PostgreSQL\15\bin\psql.exe"
}
if (-not (Test-Path $psqlPath)) {
    $psqlPath = "C:\Program Files\PostgreSQL\14\bin\psql.exe"
}
if (-not (Test-Path $psqlPath)) {
    $psqlPath = "psql.exe"
}

$dbName = "elearning"
$dbUser = "elearn"
$sqlFile = "database\add_lesson_resources.sql"

Write-Host "Chạy lệnh: $psqlPath -U $dbUser -d $dbName -f $sqlFile" -ForegroundColor Cyan
Write-Host "Nhập mật khẩu PostgreSQL khi được yêu cầu..." -ForegroundColor Yellow
Write-Host ""

& $psqlPath -U $dbUser -d $dbName -f $sqlFile

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Migration thành công!" -ForegroundColor Green
    
    $seed = Read-Host "Bạn có muốn seed dữ liệu mẫu? (y/n)"
    if ($seed -eq "y" -or $seed -eq "Y") {
        Write-Host "📦 Đang seed dữ liệu mẫu..." -ForegroundColor Yellow
        & $psqlPath -U $dbUser -d $dbName -f "database\seed_lesson_resources.sql"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Seed dữ liệu thành công!" -ForegroundColor Green
        }
    }
} else {
    Write-Host ""
    Write-Host "❌ Có lỗi xảy ra!" -ForegroundColor Red
    Write-Host "Kiểm tra lại mật khẩu và kết nối database." -ForegroundColor Yellow
}

