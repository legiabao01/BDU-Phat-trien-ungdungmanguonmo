# Script test tính năng tài liệu và resources
# Usage: .\scripts\test-resources.ps1

Write-Host "🧪 Test Tính năng Tài liệu và Resources" -ForegroundColor Cyan
Write-Host ""

# Bước 1: Chạy migration
Write-Host "📄 Bước 1: Chạy migration SQL..." -ForegroundColor Yellow
.\scripts\run-sql.ps1 -File "database\add_lesson_resources.sql"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Lỗi khi chạy migration!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Bước 2: Seed dữ liệu mẫu (tùy chọn)
$seed = Read-Host "Bạn có muốn seed dữ liệu mẫu? (y/n)"
if ($seed -eq "y" -or $seed -eq "Y") {
    Write-Host "📦 Seed dữ liệu mẫu..." -ForegroundColor Yellow
    .\scripts\run-sql.ps1 -File "database\seed_lesson_resources.sql"
}

Write-Host ""
Write-Host "✅ Hoàn thành!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Hướng dẫn test:" -ForegroundColor Cyan
Write-Host "1. Khởi động backend: cd fastapi_app && python -m uvicorn main:app --reload --port 8001"
Write-Host "2. Truy cập Swagger UI: http://127.0.0.1:8001/docs"
Write-Host "3. Đăng nhập để lấy token"
Write-Host "4. Test API PUT /api/lessons/{lesson_id} với tài liệu"
Write-Host "5. Xem chi tiết tại: docs/TEST_RESOURCES.md"
Write-Host ""

