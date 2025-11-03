@echo off
echo ==========================================
echo   Installing Dependencies with Fix
echo ==========================================
echo.

cd /d "%~dp0client"

echo [Step 1] Installing packages with legacy peer deps...
call npm install --legacy-peer-deps

echo.
echo [Step 2] Clearing webpack cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo    Cache cleared!
) else (
    echo    No cache found
)

echo.
echo [Step 3] Verifying critical packages...
call npm list framer-motion --depth=0 >nul 2>&1 && echo    framer-motion: OK || echo    framer-motion: MISSING
call npm list react-quill --depth=0 >nul 2>&1 && echo    react-quill: OK || echo    react-quill: MISSING
call npm list socket.io-client --depth=0 >nul 2>&1 && echo    socket.io-client: OK || echo    socket.io-client: MISSING

echo.
echo ==========================================
echo   Installation Complete!
echo ==========================================
echo.
echo Now run: npm start
echo.
pause

