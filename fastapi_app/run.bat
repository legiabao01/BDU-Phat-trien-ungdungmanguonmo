@echo off
cd /d %~dp0\..
call venv\Scripts\activate.bat
uvicorn fastapi_app.main:app --reload --port 8001



