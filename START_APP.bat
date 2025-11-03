@echo off
title MiniHelpDesk - Starting Application
echo ========================================
echo   MiniHelpDesk - Starting Application
echo ========================================
echo.

echo [Step 1] Checking dependencies...
cd client
if not exist node_modules (
    echo Installing client dependencies...
    call npm install --legacy-peer-deps
)

echo.
echo [Step 2] Starting React dev server...
echo Please wait, this may take a moment...
echo.
echo The app will open at: http://localhost:3000
echo.
npm start

pause

