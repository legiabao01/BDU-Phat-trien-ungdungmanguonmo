# Script để chạy migrations trên Render Database từ máy local
# Yêu cầu: External Database URL từ Render Dashboard

param(
    [Parameter(Mandatory=$true)]
    [string]$DatabaseUrl
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CHẠY MIGRATIONS TRÊN RENDER DATABASE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra psql
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
if (-not (Test-Path $psqlPath)) {
    $psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
    if (-not (Test-Path $psqlPath)) {
        Write-Host "❌ ERROR: Không tìm thấy psql.exe" -ForegroundColor Red
        Write-Host "   Vui lòng cài đặt PostgreSQL hoặc sử dụng Render Shell" -ForegroundColor Yellow
        exit 1
    }
}

# Chuyển đổi URL nếu cần (postgresql+psycopg:// -> postgresql://)
if ($DatabaseUrl -match "postgresql\+psycopg://") {
    $DatabaseUrl = $DatabaseUrl -replace "postgresql\+psycopg://", "postgresql://"
}

Write-Host "📦 Đang kết nối với database..." -ForegroundColor Yellow
Write-Host "   URL: $($DatabaseUrl -replace ':[^:@]+@', ':****@')" -ForegroundColor Gray
Write-Host ""

# Test connection
Write-Host "🔄 Kiểm tra kết nối..." -ForegroundColor Yellow
$testResult = & $psqlPath $DatabaseUrl -c "SELECT version();" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Không thể kết nối với database!" -ForegroundColor Red
    Write-Host $testResult -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Gợi ý:" -ForegroundColor Yellow
    Write-Host "   1. Kiểm tra External Database URL trong Render Dashboard" -ForegroundColor White
    Write-Host "   2. Đảm bảo External Access đã được bật" -ForegroundColor White
    Write-Host "   3. Hoặc sử dụng Render Shell (khuyến nghị)" -ForegroundColor White
    exit 1
}

Write-Host "✅ Kết nối thành công!" -ForegroundColor Green
Write-Host ""

# Danh sách migrations
$migrations = @(
    "database/schema_pg.sql",
    "database/create_enrollment_table.sql",
    "database/create_notifications_table.sql",
    "database/create_payments_table.sql",
    "database/add_tai_lieu_to_lessons.sql",
    "database/add_diem_toi_da_to_assignments.sql",
    "database/create_deposit_transactions.sql",
    "database/add_deposit_fields.sql",
    "database/add_user_balance.sql"
)

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$successCount = 0
$failedCount = 0

Write-Host "🔄 Bắt đầu chạy migrations..." -ForegroundColor Cyan
Write-Host ""

foreach ($migration in $migrations) {
    $fullPath = Join-Path $projectRoot $migration
    
    if (-not (Test-Path $fullPath)) {
        Write-Host "⚠️  SKIP: $migration (file not found)" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "📄 Running: $migration..." -ForegroundColor Yellow
    
    # Chạy migration
    $result = & $psqlPath $DatabaseUrl -f $fullPath 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Completed: $migration" -ForegroundColor Green
        $successCount++
    } else {
        # Kiểm tra xem có phải lỗi "already exists" không
        $errorText = $result -join " "
        if ($errorText -match "already exists" -or $errorText -match "duplicate") {
            Write-Host "   ⚠️  Skipped (already exists): $migration" -ForegroundColor Yellow
            $successCount++
        } else {
            Write-Host "   ❌ ERROR in $migration" -ForegroundColor Red
            Write-Host $result -ForegroundColor Red
            $failedCount++
        }
    }
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 Migration Summary:" -ForegroundColor Cyan
Write-Host "   ✅ Success: $successCount" -ForegroundColor Green
Write-Host "   ❌ Failed: $failedCount" -ForegroundColor $(if ($failedCount -gt 0) { "Red" } else { "Green" })
Write-Host "========================================" -ForegroundColor Cyan

if ($failedCount -gt 0) {
    Write-Host ""
    Write-Host "⚠️  Một số migrations thất bại. Vui lòng kiểm tra lỗi ở trên." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host ""
    Write-Host "🎉 Tất cả migrations đã hoàn thành thành công!" -ForegroundColor Green
    exit 0
}

