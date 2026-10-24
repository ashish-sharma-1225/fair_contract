@echo off
title ClauseLens Stopper
cd /d "%~dp0"

echo Stopping ClauseLens Backend and Frontend...

:: Kill processes on port 8000 (Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo Terminating Backend PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

:: Kill processes on port 5173 (Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    echo Terminating Frontend PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo All ClauseLens services stopped successfully!
pause
