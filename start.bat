@echo off
title OneStop Multi-Service Launcher
color 0A

echo ========================================================
echo        OneStop - AI Career ^& Academic Navigator
echo        Starting MERN + FastAPI + LangGraph Services
echo ========================================================
echo.

:: Setup Path to Node.js and Python on this machine
set "NODE_PATH=C:\Users\ASUS\AppData\Local\pi-node\current"
set "PY_PATH=C:\Program Files\PostgreSQL\18\pgAdmin 4\python"
set "PATH=%NODE_PATH%;%PY_PATH%;%PY_PATH%\Scripts;%PATH%"

cd /d "%~dp0"

echo [1/3] Launching Backend (Express on Port 5000)...
start "OneStop Backend (Port 5000)" cmd /k "set PATH=%NODE_PATH%;%PY_PATH%;%%PATH%% && cd /d "%~dp0backend" && echo Installing/Checking dependencies... && npm install && echo Starting Backend... && npm run dev"

echo [2/3] Launching AI Service (FastAPI on Port 8000)...
start "OneStop AI Service (Port 8000)" cmd /k "set PATH=%NODE_PATH%;%PY_PATH%;%%PATH%% && cd /d "%~dp0ai_service" && echo Installing/Checking Python packages... && python -m pip install -r requirements.txt && echo Starting FastAPI... && python -m uvicorn main:app --reload --port 8000"

echo [3/3] Launching Frontend (React Vite on Port 3000)...
start "OneStop Frontend (Port 3000)" cmd /k "set PATH=%NODE_PATH%;%PY_PATH%;%%PATH%% && cd /d "%~dp0frontend" && echo Installing/Checking Frontend packages... && npm install && echo Starting Frontend... && npm run dev"

echo.
echo ========================================================
echo Terminals have been launched!
echo Please allow 30-45 seconds on first run for npm/pip
echo packages to download in the open terminal windows.
echo.
echo Once the Frontend terminal shows:
echo   Local: http://localhost:3000/
echo open http://localhost:3000 in your browser!
echo ========================================================
pause
