# Script chạy file SQL
# Usage: .\scripts\run-sql.ps1 -File "database\seed_users.sql"

param(
    [Parameter(Mandatory=$true)]
    [string]$File
)

$ErrorActionPreference = "Stop"

# Đường dẫn PostgreSQL
$psqlPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
if (-not (Test-Path $psqlPath)) {
    $psqlPath = "psql.exe"
}

$dbName = "elearning"
$dbUser = "elearn"
$projectRoot = Split-Path -Parent $PSScriptRoot
$sqlFile = Join-Path $projectRoot $File

if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ File không tồn tại: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "📄 Chạy file: $File" -ForegroundColor Yellow
& $psqlPath -U $dbUser -d $dbName -f $sqlFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Hoàn thành!" -ForegroundColor Green
} else {
    Write-Host "❌ Có lỗi xảy ra!" -ForegroundColor Red
    exit 1
}



