@echo off
echo ==========================================
echo   Starting Frontend Server
echo ==========================================
echo.

cd /d "%~dp0client"

echo Clearing cache...
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo Starting React development server...
echo Please wait for compilation...
echo.
echo The app will open at: http://localhost:3000
echo.
echo ==========================================
echo.

call npm start

