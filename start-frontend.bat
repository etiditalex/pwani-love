@echo off
echo ========================================
echo    Pwani Love - Frontend Display
echo ========================================
echo.

echo Starting React Native development server...
echo.

cd client

echo Available display options:
echo.
echo 1. Web Browser (Recommended for laptop display)
echo    - Press 'w' when Expo starts
echo    - Opens at http://localhost:19006
echo.
echo 2. Android Emulator
echo    - Press 'a' when Expo starts
echo    - Requires Android Studio
echo.
echo 3. Physical Device
echo    - Install Expo Go app
echo    - Scan QR code with phone camera
echo.
echo 4. iOS Simulator (Mac only)
echo    - Press 'i' when Expo starts
echo    - Requires Xcode
echo.

echo Starting Expo development server...
echo.

npx expo start

echo.
echo If the server doesn't start automatically, run:
echo npx expo start --web
echo.
pause
