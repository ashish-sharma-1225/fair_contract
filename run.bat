@echo off
setlocal
cd /d "%~dp0"

echo ===================================================
echo       ClauseLens - Local AI Contract Flagger
echo ===================================================
echo.

echo Checking ports 8000 and 5173...
powershell -Command "Get-Process -Id (Get-NetTCPConnection -LocalPort 8000, 5173 -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue" >nul 2>&1

echo Starting Backend on http://localhost:8000 ...
start "ClauseLens Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo Starting Frontend on http://localhost:5173 ...
start "ClauseLens Frontend" cmd /k "cd frontend && npm run dev"

echo Waiting 3 seconds for servers to initialize...
timeout /t 3 /nobreak >nul

echo Launching browser...
start http://localhost:5173

echo.
echo All services launched successfully!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
echo.
pause
