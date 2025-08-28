# Pwani Love - XAMPP Setup Script (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Pwani Love - XAMPP Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✓ npm is installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: npm is not installed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check XAMPP
if (Test-Path "C:\xampp\xampp-control.exe") {
    Write-Host "✓ XAMPP is installed" -ForegroundColor Green
} else {
    Write-Host "⚠ WARNING: XAMPP is not installed or not in default location" -ForegroundColor Yellow
    Write-Host "Please install XAMPP from https://www.apachefriends.org/" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host ""

# Install dependencies
try {
    Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
    npm run install-all
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install dependencies"
    }
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Failed to install dependencies!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Setting up environment files..." -ForegroundColor Yellow
Write-Host ""

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Cyan
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✓ .env file created from .env.example" -ForegroundColor Green
    } else {
        @"
PORT=5000
NODE_ENV=development
CLIENT_URL=http://pwani-love.local
JWT_SECRET=your-super-secret-jwt-key-here
SOCKET_CORS_ORIGIN=http://pwani-love.local
"@ | Out-File -FilePath ".env" -Encoding UTF8
        Write-Host "✓ Basic .env file created" -ForegroundColor Green
    }
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}

# Create client .env file if it doesn't exist
if (-not (Test-Path "client\.env")) {
    Write-Host "Creating client .env file..." -ForegroundColor Cyan
    @"
EXPO_PUBLIC_API_URL=http://pwani-love.local/api
EXPO_PUBLIC_SOCKET_URL=http://pwani-love.local
"@ | Out-File -FilePath "client\.env" -Encoding UTF8
    Write-Host "✓ Client .env file created" -ForegroundColor Green
} else {
    Write-Host "✓ Client .env file already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "Building frontend for web..." -ForegroundColor Yellow
Write-Host ""

# Build frontend for web
try {
    Set-Location "client"
    npm run build:web
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠ WARNING: Failed to build frontend for web" -ForegroundColor Yellow
        Write-Host "You can still run the development server" -ForegroundColor Yellow
    } else {
        Write-Host "✓ Frontend built successfully" -ForegroundColor Green
    }
    Set-Location ".."
} catch {
    Write-Host "⚠ WARNING: Failed to build frontend for web" -ForegroundColor Yellow
    Write-Host "You can still run the development server" -ForegroundColor Yellow
    Set-Location ".."
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Copy httpd-nodejs.conf to C:\xampp\apache\conf\extra\" -ForegroundColor White
Write-Host "2. Update C:\xampp\apache\conf\httpd.conf to include the config" -ForegroundColor White
Write-Host "3. Add '127.0.0.1 pwani-love.local' to your hosts file" -ForegroundColor White
Write-Host "4. Start XAMPP Apache and MySQL services" -ForegroundColor White
Write-Host "5. Run 'npm run dev' to start the backend" -ForegroundColor White
Write-Host "6. Run 'cd client && npm start' to start the frontend" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see xampp-setup.md" -ForegroundColor Cyan
Write-Host ""

# Offer to copy the Apache config file
$copyConfig = Read-Host "Would you like to copy the Apache config file to XAMPP? (y/n)"
if ($copyConfig -eq "y" -or $copyConfig -eq "Y") {
    try {
        if (Test-Path "C:\xampp\apache\conf\extra\") {
            Copy-Item "httpd-nodejs.conf" "C:\xampp\apache\conf\extra\"
            Write-Host "✓ Apache config file copied to XAMPP" -ForegroundColor Green
        } else {
            Write-Host "⚠ XAMPP Apache directory not found" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠ Failed to copy Apache config file" -ForegroundColor Yellow
    }
}

Read-Host "Press Enter to exit"
