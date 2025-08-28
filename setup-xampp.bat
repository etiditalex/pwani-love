@echo off
echo ========================================
echo Pwani Love - XAMPP Setup Script
echo ========================================
echo.

echo Checking prerequisites...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed!
    pause
    exit /b 1
)
echo ✓ npm is installed

REM Check if XAMPP is installed
if not exist "C:\xampp\xampp-control.exe" (
    echo WARNING: XAMPP is not installed or not in default location
    echo Please install XAMPP from https://www.apachefriends.org/
    echo.
)

echo.
echo Installing dependencies...
echo.

REM Install backend dependencies
echo Installing backend dependencies...
call npm run install-all
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo Setting up environment files...
echo.

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    copy ".env.example" ".env" >nul 2>&1
    if %errorlevel% neq 0 (
        echo Creating basic .env file...
        echo PORT=5000 > .env
        echo NODE_ENV=development >> .env
        echo CLIENT_URL=http://pwani-love.local >> .env
        echo JWT_SECRET=your-super-secret-jwt-key-here >> .env
        echo SOCKET_CORS_ORIGIN=http://pwani-love.local >> .env
    )
)

REM Create client .env file if it doesn't exist
if not exist "client\.env" (
    echo Creating client .env file...
    echo EXPO_PUBLIC_API_URL=http://pwani-love.local/api > client\.env
    echo EXPO_PUBLIC_SOCKET_URL=http://pwani-love.local >> client\.env
)

echo.
echo Building frontend for web...
echo.

REM Build the frontend for web
cd client
call npm run build:web
if %errorlevel% neq 0 (
    echo WARNING: Failed to build frontend for web
    echo You can still run the development server
)
cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Copy httpd-nodejs.conf to C:\xampp\apache\conf\extra\
echo 2. Update C:\xampp\apache\conf\httpd.conf to include the config
echo 3. Add "127.0.0.1 pwani-love.local" to your hosts file
echo 4. Start XAMPP Apache and MySQL services
echo 5. Run "npm run dev" to start the backend
echo 6. Run "cd client && npm start" to start the frontend
echo.
echo For detailed instructions, see xampp-setup.md
echo.
pause
