@echo off
echo ========================================
echo    Pwani Love - Quick Start
echo ========================================
echo.

echo Starting Backend Server...
start "Backend" cmd /k "cd server && set PORT=3000 && node index.js"

echo.
echo Starting Frontend...
start "Frontend" cmd /k "cd client && npx expo start --web"

echo.
echo ========================================
echo    Your App is Starting!
echo ========================================
echo.
echo 🌐 Frontend: http://localhost:19006
echo 🔧 Backend: http://localhost:3000/api/health
echo.
echo Wait 30 seconds for both servers to start...
echo.
pause
