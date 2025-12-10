# Script setup database - Tạo bảng và seed data
# Chạy: .\setup-database.ps1

$psqlPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
$dbUser = "elearn"
$dbName = "elearning"

Write-Host "🚀 Bắt đầu setup database..." -ForegroundColor Green
Write-Host ""

# Bước 1: Tạo bảng enrollment
Write-Host "📋 Bước 1: Tạo bảng enrollment..." -ForegroundColor Yellow
& $psqlPath -U $dbUser -d $dbName -f database\create_enrollment_table.sql

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Lỗi khi tạo bảng enrollment" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Đã tạo bảng enrollment" -ForegroundColor Green
Write-Host ""

# Bước 2: Seed dữ liệu
Write-Host "📊 Bước 2: Seed dữ liệu khóa học..." -ForegroundColor Yellow
& $psqlPath -U $dbUser -d $dbName -f database\seed_programming_courses_fixed_utf8.sql

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Lỗi khi seed dữ liệu" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Đã seed dữ liệu" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 Hoàn thành setup database!" -ForegroundColor Green
Write-Host ""
Write-Host "Kiểm tra dữ liệu:" -ForegroundColor Cyan
Write-Host "  psql -U elearn -d elearning"
Write-Host "  SELECT * FROM khoa_hoc;"

