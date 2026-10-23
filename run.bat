@echo off
echo Starting ClauseLens Backend and Frontend...
start "ClauseLens Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
start "ClauseLens Frontend" cmd /k "cd frontend && npm run dev"
echo Both servers started!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
