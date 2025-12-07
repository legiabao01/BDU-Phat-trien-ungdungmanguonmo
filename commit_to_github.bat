@echo off
chcp 65001 >nul
echo ========================================
echo Commit Webhoctructuyen to GitHub
echo Repository: https://github.com/hangtr29/Web-vnl.git
echo ========================================
echo.

REM Chuyển vào thư mục chứa script
cd /d "%~dp0"
echo Current directory: %CD%
echo.

REM Kiểm tra Git identity
git config --global user.name >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git identity chua duoc cau hinh!
    echo.
    echo Vui long chay cac lenh sau truoc:
    echo   git config --global user.name "Ten cua ban"
    echo   git config --global user.email "email@example.com"
    echo.
    echo Hoac chi cho repository nay:
    echo   git config user.name "Ten cua ban"
    echo   git config user.email "email@example.com"
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('git config --global user.name') do set GIT_USER_NAME=%%i
for /f "tokens=*" %%i in ('git config --global user.email') do set GIT_USER_EMAIL=%%i
echo Git identity: %GIT_USER_NAME% ^<%GIT_USER_EMAIL%^>
echo.

REM Kiểm tra xem đã có git repository chưa
if not exist ".git" (
    echo Initializing Git repository...
    git init
    echo.
)

REM Kiểm tra và thêm remote origin
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo Adding remote origin...
    git remote add origin https://github.com/hangtr29/Web-vnl.git
) else (
    echo Updating remote origin...
    git remote set-url origin https://github.com/hangtr29/Web-vnl.git
)
echo.

REM Thêm tất cả file vào staging
echo Adding files to staging...
git add .
echo.

REM Commit
echo Committing changes...
git commit -m "Add Webhoctructuyen project"
echo.

REM Kiểm tra branch
git branch --show-current >nul 2>&1
if errorlevel 1 (
    echo Creating main branch...
    git branch -M main
)
echo.

REM Push lên GitHub
echo Pushing to GitHub...
echo.
git push -u origin main

echo.
echo ========================================
echo Done! Check your repository at:
echo https://github.com/hangtr29/Web-vnl
echo ========================================
pause

