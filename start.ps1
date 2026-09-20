# Start PattaPe Backend & Frontend in separate windows
Write-Host "Starting PattaPe Backend and Frontend..." -ForegroundColor Green

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "PattaPe launched!" -ForegroundColor Cyan
Write-Host "Frontend URL: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Backend API:  http://localhost:8000" -ForegroundColor Yellow
