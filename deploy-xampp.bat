@echo off
echo ========================================
echo    Pwani Love - XAMPP Deployment
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

REM Check if XAMPP is installed
if not exist "C:\xampp\xampp-control.exe" (
    echo ERROR: XAMPP is not installed!
    echo Please install XAMPP from https://www.apachefriends.org/
    pause
    exit /b 1
)
echo ✓ XAMPP is installed

echo.
echo ========================================
echo    Step 1: Starting XAMPP Services
echo ========================================
echo.

REM Start XAMPP services
echo Starting Apache and MySQL...
start "" "C:\xampp\xampp-control.exe"

echo.
echo Please start Apache and MySQL in the XAMPP Control Panel
echo Then press any key to continue...
pause

echo.
echo ========================================
echo    Step 2: Deploying Backend
echo ========================================
echo.

REM Create directory for the API
if not exist "C:\xampp\htdocs\pwani-love-api" (
    mkdir "C:\xampp\htdocs\pwani-love-api"
    echo Created directory: C:\xampp\htdocs\pwani-love-api
)

REM Copy server files
echo Copying server files...
xcopy "server\*" "C:\xampp\htdocs\pwani-love-api\" /E /I /Y

echo.
echo ========================================
echo    Step 3: Installing Dependencies
echo ========================================
echo.

REM Install backend dependencies
echo Installing backend dependencies...
cd "C:\xampp\htdocs\pwani-love-api"
call npm install

if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies!
    pause
    exit /b 1
)

echo ✓ Backend dependencies installed

REM Install frontend dependencies
echo Installing frontend dependencies...
cd "%~dp0client"
call npm install

if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies!
    pause
    exit /b 1
)

echo ✓ Frontend dependencies installed

echo.
echo ========================================
echo    Step 4: Environment Setup
echo ========================================
echo.

REM Check if .env file exists
if not exist "C:\xampp\htdocs\pwani-love-api\.env" (
    echo Creating .env file...
    copy "%~dp0.env.example" "C:\xampp\htdocs\pwani-love-api\.env"
    echo.
    echo IMPORTANT: Please edit the .env file with your actual credentials:
    echo C:\xampp\htdocs\pwani-love-api\.env
    echo.
    echo Required services to configure:
    echo - Firebase (Authentication, Firestore, Realtime Database)
    echo - Cloudinary (Media storage)
    echo - Google Maps API
    echo.
    pause
)

echo.
echo ========================================
echo    Step 5: Starting Services
echo ========================================
echo.

REM Start backend server
echo Starting backend server...
start "Pwani Love Backend" cmd /k "cd C:\xampp\htdocs\pwani-love-api && npm start"

echo Backend server starting on http://localhost:3000
echo.

REM Start frontend
echo Starting React Native development server...
start "Pwani Love Frontend" cmd /k "cd %~dp0client && npx expo start"

echo.
echo ========================================
echo    Deployment Complete!
echo ========================================
echo.
echo Your Pwani Love app is now running:
echo.
echo Backend API: http://localhost:3000
echo Frontend Web: http://localhost:19006 (press 'w' in Expo)
echo.
echo To test the API, visit: http://localhost:3000/api/health
echo.
echo Next steps:
echo 1. Configure your .env file with real credentials
echo 2. Set up Firebase project and download service account key
echo 3. Configure Cloudinary for media uploads
echo 4. Set up Google Maps API key
echo 5. Test the app functionality
echo.
echo Press any key to exit...
pause
