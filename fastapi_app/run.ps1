# Chạy FastAPI server từ thư mục root
Set-Location $PSScriptRoot\..
& .\venv\Scripts\Activate.ps1
uvicorn fastapi_app.main:app --reload --port 8001



