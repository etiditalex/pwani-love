@echo off
echo ========================================
echo    Pwani Love - Quick Test
echo ========================================
echo.

echo Testing Backend API...
curl -s http://localhost:3000/api/health
if %errorlevel% equ 0 (
    echo.
    echo ✅ Backend is working!
) else (
    echo.
    echo ❌ Backend not responding
)

echo.
echo Testing Frontend...
curl -s -I http://localhost:19006 | findstr "HTTP"
if %errorlevel% equ 0 (
    echo.
    echo ✅ Frontend is working!
) else (
    echo.
    echo ❌ Frontend not responding
)

echo.
echo ========================================
echo    Access Your App:
echo ========================================
echo.
echo 🌐 Frontend: http://localhost:19006
echo 🔧 Backend: http://localhost:3000/api/health
echo.
pause
