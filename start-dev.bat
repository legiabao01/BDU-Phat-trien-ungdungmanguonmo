@echo off
REM Script chạy cả Backend (FastAPI) và Frontend (React) cùng lúc
REM Chạy từ thư mục root của project

echo 🚀 Bắt đầu chạy Backend và Frontend...

REM Activate venv và chạy Backend
echo.
echo 🔧 Khởi động Backend FastAPI (port 8001)...
start "FastAPI Backend" cmd /k "venv\Scripts\activate.bat && uvicorn fastapi_app.main:app --reload --port 8001"

REM Đợi backend khởi động
timeout /t 3 /nobreak >nul

REM Chạy Frontend
echo.
echo 🎨 Khởi động Frontend React (port 3000)...
cd frontend
start "React Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ✅ Đã khởi động cả 2 server!
echo.
echo 📍 Truy cập:
echo    - Frontend: http://localhost:3000
echo    - Backend API: http://127.0.0.1:8001
echo    - API Docs: http://127.0.0.1:8001/docs
echo.
echo 💡 Để dừng server, đóng các cửa sổ CMD đã mở
pause



