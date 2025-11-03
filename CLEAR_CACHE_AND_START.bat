@echo off
echo ==========================================
echo   Clearing Cache and Starting Server
echo ==========================================
echo.

cd /d "%~dp0client"

echo [1/3] Clearing webpack cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo    Cache cleared successfully!
) else (
    echo    No cache found (already clean)
)

echo.
echo [2/3] Verifying packages...
call npm list framer-motion >nul 2>&1
if errorlevel 1 (
    echo    Installing missing packages...
    call npm install --legacy-peer-deps
) else (
    echo    Packages verified!
)

echo.
echo [3/3] Starting React dev server...
echo    Please wait for compilation...
echo    The app will open at: http://localhost:3000
echo.
echo ==========================================
echo.

call npm start

