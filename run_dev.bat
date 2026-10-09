@echo off
echo ========================================================
echo   SafeRoute - Crisis Communication for Tourists
echo   IIITDM Kancheepuram 24-Hour Web Development Hackathon
echo ========================================================
echo.

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "SafeRoute Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting Vite Frontend on http://127.0.0.1:5173 ...
start "SafeRoute Frontend" cmd /k "cd /d %~dp0frontend && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo Both servers are launching!
echo Access the web application at: http://127.0.0.1:5173
echo API Docs (Swagger):            http://127.0.0.1:8000/docs
echo.
pause
