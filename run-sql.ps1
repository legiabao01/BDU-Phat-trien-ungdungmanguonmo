# Script chạy SQL file với PostgreSQL
# Usage: .\run-sql.ps1 database\create_enrollment_table.sql

param(
    [Parameter(Mandatory=$true)]
    [string]$SqlFile
)

$psqlPath = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
$dbUser = "elearn"
$dbName = "elearning"

Write-Host "Chạy SQL file: $SqlFile" -ForegroundColor Yellow
Write-Host "Database: $dbName" -ForegroundColor Yellow
Write-Host "User: $dbUser" -ForegroundColor Yellow
Write-Host ""

# Kiểm tra file tồn tại
if (-not (Test-Path $SqlFile)) {
    Write-Host "❌ File không tồn tại: $SqlFile" -ForegroundColor Red
    exit 1
}

# Chạy psql
& $psqlPath -U $dbUser -d $dbName -f $SqlFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Chạy thành công!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Có lỗi xảy ra!" -ForegroundColor Red
}



