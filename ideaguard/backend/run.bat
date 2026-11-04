@echo off
cd /d %~dp0
if not exist .env (
  echo Create a file named .env first. Copy .env.example and paste your key.
  pause
  exit /b
)
if not exist venv (
  python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt
echo.
echo Starting IdeaGuard at http://localhost:8000
uvicorn main:app --port 8000
pause
