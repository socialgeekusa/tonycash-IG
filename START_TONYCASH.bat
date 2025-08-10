@echo off
echo ========================================
echo    TonyCash Tool - Instagram Automation
echo ========================================
echo.
echo Starting TonyCash Tool...
echo.

cd /d "%~dp0"

echo Checking if Node.js is installed...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found! Starting the application...
echo.
echo The TonyCash Tool will be available at:
echo http://localhost:8000
echo.
echo Press Ctrl+C to stop the application
echo.

npm run dev

pause
