# PowerShell script to set up PostgreSQL database
# This script helps set up the database if psql is not in PATH

Write-Host "Patient Portal - Database Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Common PostgreSQL installation paths on Windows
$psqlPaths = @(
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files\PostgreSQL\13\bin\psql.exe",
    "C:\Program Files\PostgreSQL\12\bin\psql.exe"
)

$psqlPath = $null

# Try to find psql
foreach ($path in $psqlPaths) {
    if (Test-Path $path) {
        $psqlPath = $path
        Write-Host "Found PostgreSQL at: $psqlPath" -ForegroundColor Green
        break
    }
}

# If not found, try to find it in PATH
if (-not $psqlPath) {
    $psqlInPath = Get-Command psql -ErrorAction SilentlyContinue
    if ($psqlInPath) {
        $psqlPath = $psqlInPath.Source
        Write-Host "Found PostgreSQL in PATH: $psqlPath" -ForegroundColor Green
    }
}

if (-not $psqlPath) {
    Write-Host "ERROR: PostgreSQL (psql) not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please do one of the following:" -ForegroundColor Yellow
    Write-Host "1. Install PostgreSQL from https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "2. Add PostgreSQL bin directory to your PATH environment variable" -ForegroundColor Yellow
    Write-Host "3. Or manually run the SQL commands using pgAdmin or another PostgreSQL client" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common PostgreSQL installation path:" -ForegroundColor Yellow
    Write-Host "   C:\Program Files\PostgreSQL\16\bin\" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To add to PATH temporarily in this session:" -ForegroundColor Yellow
    Write-Host '   $env:Path += ";C:\Program Files\PostgreSQL\16\bin"' -ForegroundColor Cyan
    exit 1
}

# Get database credentials
Write-Host ""
Write-Host "Enter PostgreSQL connection details:" -ForegroundColor Cyan
$dbUser = Read-Host "Database User (default: postgres)"
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "postgres" }

$dbPassword = Read-Host "Database Password" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
)

$dbHost = Read-Host "Database Host (default: localhost)"
if ([string]::IsNullOrWhiteSpace($dbHost)) { $dbHost = "localhost" }

$dbPort = Read-Host "Database Port (default: 5432)"
if ([string]::IsNullOrWhiteSpace($dbPort)) { $dbPort = "5432" }

$dbName = "patient_portal"

Write-Host ""
Write-Host "Creating database '$dbName'..." -ForegroundColor Cyan

# Set PGPASSWORD environment variable for psql
$env:PGPASSWORD = $dbPasswordPlain

# Create database
$createDbCmd = "CREATE DATABASE $dbName;"
$createDbResult = & $psqlPath -U $dbUser -h $dbHost -p $dbPort -d postgres -c $createDbCmd 2>&1

if ($LASTEXITCODE -eq 0 -or $createDbResult -match "already exists") {
    Write-Host "Database '$dbName' is ready." -ForegroundColor Green
} else {
    Write-Host "Warning: Could not create database. It may already exist." -ForegroundColor Yellow
    Write-Host $createDbResult -ForegroundColor Yellow
}

# Read and execute schema
Write-Host ""
Write-Host "Initializing database schema..." -ForegroundColor Cyan

$schemaPath = Join-Path $PSScriptRoot "database\schema.sql"
if (Test-Path $schemaPath) {
    $schemaContent = Get-Content $schemaPath -Raw
    $schemaResult = & $psqlPath -U $dbUser -h $dbHost -p $dbPort -d $dbName -c $schemaContent 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database schema initialized successfully!" -ForegroundColor Green
    } else {
        Write-Host "Warning: Schema initialization had issues:" -ForegroundColor Yellow
        Write-Host $schemaResult -ForegroundColor Yellow
    }
} else {
    Write-Host "ERROR: Schema file not found at: $schemaPath" -ForegroundColor Red
}

# Clear password from environment
$env:PGPASSWORD = $null

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update backend/.env with your database credentials" -ForegroundColor Yellow
Write-Host "2. Run 'npm install' in the backend directory" -ForegroundColor Yellow
Write-Host "3. Start the backend server with 'npm start'" -ForegroundColor Yellow

