# Script setup database và seed data
# Chạy: .\scripts\setup-database.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Bắt đầu setup database..." -ForegroundColor Green

# Đường dẫn PostgreSQL (thay đổi nếu cần)
$psqlPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
if (-not (Test-Path $psqlPath)) {
    $psqlPath = "psql.exe"
}

$dbName = "elearning"
$dbUser = "elearn"
$projectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "`n📦 Bước 1: Seed courses và teachers..." -ForegroundColor Yellow
& $psqlPath -U $dbUser -d $dbName -f "$projectRoot\database\seed_programming_courses_fixed_utf8.sql"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Lỗi khi seed courses!" -ForegroundColor Red
    exit 1
}

Write-Host "`n👥 Bước 2: Seed admin và students..." -ForegroundColor Yellow
& $psqlPath -U $dbUser -d $dbName -f "$projectRoot\database\seed_users.sql"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Lỗi khi seed users!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Hoàn thành! Database đã được seed data." -ForegroundColor Green
Write-Host "`n📝 Tài khoản test:" -ForegroundColor Cyan
Write-Host "  - Admin: admin@example.com / admin123"
Write-Host "  - Teacher: teacher1@example.com / teacher123"
Write-Host "  - Student: student@example.com / student123"

