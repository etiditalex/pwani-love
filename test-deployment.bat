@echo off
echo ========================================
echo    Pwani Love - Deployment Test
echo ========================================
echo.

echo Testing backend API...
echo.

REM Test backend health endpoint
echo Testing: http://localhost:3000/api/health
curl -s http://localhost:3000/api/health
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Backend API is not responding!
    echo Please ensure the backend server is running on port 3000
    echo.
) else (
    echo.
    echo ✓ Backend API is working
)

echo.
echo Testing frontend...
echo.

REM Test frontend web endpoint
echo Testing: http://localhost:19006
curl -s -I http://localhost:19006 | findstr "HTTP"
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Frontend web server is not responding!
    echo Please ensure Expo is running and press 'w' to open in web browser
    echo.
) else (
    echo.
    echo ✓ Frontend web server is working
)

echo.
echo ========================================
echo    Test Results
echo ========================================
echo.
echo If both tests passed, your deployment is working correctly!
echo.
echo You can now:
echo 1. Open http://localhost:19006 in your browser
echo 2. Register a new account
echo 3. Test the dating app features
echo.
echo If tests failed, check:
echo - Backend server is running (npm start in server directory)
echo - Frontend is running (npx expo start in client directory)
echo - Ports 3000 and 19006 are not blocked by firewall
echo.
pause
