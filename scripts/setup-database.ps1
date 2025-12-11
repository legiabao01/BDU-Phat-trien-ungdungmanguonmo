# Script setup database va seed data
# Chay: .\scripts\setup-database.ps1

$ErrorActionPreference = "Stop"

Write-Host "Bat dau setup database..." -ForegroundColor Green

# Tim duong dan PostgreSQL
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

# Neu khong tim thay, thu tim trong PATH
if (-not $psqlPath) {
    $psqlInPath = Get-Command psql.exe -ErrorAction SilentlyContinue
    if ($psqlInPath) {
        $psqlPath = $psqlInPath.Source
    }
}

# Neu van khong tim thay, bao loi
if (-not $psqlPath) {
    Write-Host "Khong tim thay psql.exe!" -ForegroundColor Red
    Write-Host "Vui long:" -ForegroundColor Yellow
    Write-Host "  1. Them PostgreSQL bin vao PATH, hoac" -ForegroundColor Yellow
    Write-Host "  2. Sua duong dan trong script nay" -ForegroundColor Yellow
    exit 1
}

Write-Host "Tim thay psql tai: $psqlPath" -ForegroundColor Green

$dbName = "elearning"
$dbUser = "elearn"
$projectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "`nBuoc 1: Seed courses va teachers..." -ForegroundColor Yellow
Write-Host "  (Se hoi password cho user $dbUser)" -ForegroundColor Gray
& $psqlPath -U $dbUser -d $dbName -f "$projectRoot\database\seed_programming_courses_fixed_utf8.sql"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Loi khi seed courses!" -ForegroundColor Red
    exit 1
}

Write-Host "`nBuoc 2: Seed admin va students..." -ForegroundColor Yellow
& $psqlPath -U $dbUser -d $dbName -f "$projectRoot\database\seed_users.sql"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Loi khi seed users!" -ForegroundColor Red
    exit 1
}

Write-Host "`nHoan thanh! Database da duoc seed data." -ForegroundColor Green
Write-Host "`nTai khoan test:" -ForegroundColor Cyan
Write-Host "  - Admin: admin@example.com / admin123"
Write-Host "  - Teacher: teacher1@example.com / teacher123"
Write-Host "  - Student: student@example.com / student123"

