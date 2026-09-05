@echo off
echo Starting Backend Server...
call .\venv\Scripts\Activate.ps1
.\venv\Scripts\uvicorn.exe backend.main:app --reload
pause
