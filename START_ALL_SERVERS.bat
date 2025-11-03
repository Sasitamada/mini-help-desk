@echo off
title MiniHelpDesk - Starting All Servers
echo ==========================================
echo   MiniHelpDesk - Starting All Servers
echo ==========================================
echo.

echo [IMPORTANT] This will start BOTH servers
echo Please keep both terminal windows open!
echo.
pause

echo.
echo [Step 1] Starting Backend Server...
start "MiniHelpDesk Backend" cmd /k "cd /d %~dp0server && npm start"

timeout /t 3 /nobreak >nul

echo.
echo [Step 2] Starting Frontend Server...
start "MiniHelpDesk Frontend" cmd /k "cd /d %~dp0client && rmdir /s /q node_modules\.cache 2>nul && npm start"

echo.
echo ==========================================
echo   Both servers are starting!
echo ==========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Please wait for compilation...
echo ==========================================
echo.
pause


