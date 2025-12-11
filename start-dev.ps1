# Script chạy cả Backend (FastAPI) và Frontend (React) cùng lúc
# Chạy từ thư mục root của project

Write-Host "🚀 Bắt đầu chạy Backend và Frontend..." -ForegroundColor Green

# Activate venv
Write-Host "`n📦 Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Kiểm tra xem frontend đã cài dependencies chưa
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "`n⚠️  Frontend chưa có node_modules. Đang cài đặt..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

# Chạy Backend trong background
Write-Host "`n🔧 Khởi động Backend FastAPI (port 8001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\venv\Scripts\Activate.ps1; uvicorn fastapi_app.main:app --reload --port 8001" -WindowStyle Normal

# Đợi backend khởi động
Start-Sleep -Seconds 3

# Chạy Frontend trong background
Write-Host "`n🎨 Khởi động Frontend React (port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev" -WindowStyle Normal

Write-Host "`n✅ Đã khởi động cả 2 server!" -ForegroundColor Green
Write-Host "`n📍 Truy cập:" -ForegroundColor Yellow
Write-Host "   - Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   - Backend API: http://127.0.0.1:8001" -ForegroundColor White
Write-Host "   - API Docs: http://127.0.0.1:8001/docs" -ForegroundColor White
Write-Host "`n💡 Để dừng server, đóng các cửa sổ PowerShell đã mở" -ForegroundColor Gray



