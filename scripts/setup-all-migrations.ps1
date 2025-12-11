# Script chạy TẤT CẢ migrations (bắt buộc)
# Chạy: .\scripts\setup-all-migrations.ps1

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  SETUP DATABASE MIGRATIONS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Tìm đường dẫn PostgreSQL
$psqlPath = $null
$possiblePaths = @(
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files\PostgreSQL\13\bin\psql.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $psqlPath = $path
        break
    }
}

# Nếu không tìm thấy, thử tìm trong PATH
if (-not $psqlPath) {
    $psqlInPath = Get-Command psql.exe -ErrorAction SilentlyContinue
    if ($psqlInPath) {
        $psqlPath = $psqlInPath.Source
    }
}

# Nếu vẫn không tìm thấy, báo lỗi
if (-not $psqlPath) {
    Write-Host "❌ Không tìm thấy psql.exe!" -ForegroundColor Red
    Write-Host "Vui lòng:" -ForegroundColor Yellow
    Write-Host "  1. Thêm PostgreSQL bin vào PATH, hoặc" -ForegroundColor Yellow
    Write-Host "  2. Sửa đường dẫn trong script này" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Tìm thấy psql tại: $psqlPath" -ForegroundColor Green

$dbName = "elearning"
$dbUser = "elearn"
$projectRoot = Split-Path -Parent $PSScriptRoot

# Danh sách các file migration BẮT BUỘC (theo thứ tự)
$migrations = @(
    @{ File = "schema_pg.sql"; Name = "Schema cơ bản (bảng users, khoa_hoc, ...)" },
    @{ File = "create_enrollment_table.sql"; Name = "Bảng đăng ký khóa học" },
    @{ File = "create_notifications_table.sql"; Name = "Bảng thông báo" },
    @{ File = "create_payment_table.sql"; Name = "Bảng thanh toán" },
    @{ File = "add_lesson_resources.sql"; Name = "Thêm cột tài liệu cho bài học" },
    @{ File = "add_diem_toi_da_to_bai_tap.sql"; Name = "Thêm cột điểm tối đa cho bài tập" }
)

Write-Host "`n📋 Sẽ chạy các migrations sau:" -ForegroundColor Yellow
foreach ($migration in $migrations) {
    Write-Host "   - $($migration.Name)" -ForegroundColor Gray
}

$confirm = Read-Host "`nBạn có muốn tiếp tục? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Đã hủy." -ForegroundColor Yellow
    exit 0
}

Write-Host "`n🚀 Bắt đầu chạy migrations...`n" -ForegroundColor Green

foreach ($migration in $migrations) {
    $filePath = Join-Path $projectRoot "database" $migration.File
    
    if (-not (Test-Path $filePath)) {
        Write-Host "⚠️  File không tồn tại: $($migration.File)" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "📄 Đang chạy: $($migration.Name)..." -ForegroundColor Cyan
    Write-Host "   File: $($migration.File)" -ForegroundColor Gray
    
    & $psqlPath -U $dbUser -d $dbName -f $filePath
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Lỗi khi chạy $($migration.File)!" -ForegroundColor Red
        Write-Host "   Vui lòng kiểm tra lại và chạy thủ công." -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "✅ Hoàn thành: $($migration.Name)`n" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  ✅ HOÀN THÀNH TẤT CẢ MIGRATIONS!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "💡 Tiếp theo:" -ForegroundColor Cyan
Write-Host "   - Chạy seed data (tùy chọn): .\scripts\setup-database.ps1" -ForegroundColor White
Write-Host "   - Hoặc xem: docs\DATABASE_SETUP.md" -ForegroundColor White
Write-Host ""

