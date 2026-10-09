#!/usr/bin/env bash
echo "========================================================"
echo "  SafeRoute - Crisis Communication for Tourists"
echo "  IIITDM Kancheepuram 24-Hour Web Development Hackathon"
echo "========================================================"

# Start backend
cd "$(dirname "$0")/backend" || exit
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Start frontend
cd "../frontend" || exit
npm run dev -- --host 127.0.0.1 --port 5173 &
FRONTEND_PID=$!

echo "SafeRoute servers started!"
echo "Frontend: http://127.0.0.1:5173"
echo "Backend:  http://127.0.0.1:8000/docs"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
