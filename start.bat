@echo off
echo ========================================================
echo Starting PattaPe (Backend + Frontend)
echo ========================================================

start "PattaPe Backend (FastAPI)" cmd /k "cd backend && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
start "PattaPe Frontend (Vite)" cmd /k "npm run dev"

echo.
echo Servers are launching:
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:8000
echo ========================================================
