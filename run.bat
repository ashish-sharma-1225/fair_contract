@echo off
title ClauseLens Launcher
cd /d "%~dp0"

echo ===================================================
echo       ClauseLens - Local AI Contract Flagger
echo ===================================================
echo.

:: 1. Clean up any previous dangling processes on port 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo Freeing port 8000 (PID %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

:: 2. Launch Backend (FastAPI + Local Qwen2.5-1.5B LLM)
echo [1/2] Starting ClauseLens Backend on http://localhost:8000 ...
start "ClauseLens Backend (Qwen Local AI)" cmd /k "cd /d "%~dp0backend" && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

:: 3. Launch Frontend (React + Vite)
echo [2/2] Starting ClauseLens Frontend on http://localhost:5173 ...
start "ClauseLens Frontend (React UI)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

:: 4. Wait for services to initialize
echo.
echo Waiting 3 seconds for servers to initialize...
timeout /t 3 /nobreak >nul

:: 5. Open browser automatically
echo Opening ClauseLens in your browser...
start http://localhost:5173

echo.
echo ===================================================
echo   ClauseLens is running!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo ===================================================
echo.
echo Keep the backend and frontend terminal windows open.
echo To stop everything, simply close the opened windows.
pause
