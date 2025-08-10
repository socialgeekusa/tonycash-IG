@echo off
title TonyCash Tool - Automated Setup
color 0A

echo.
echo ========================================
echo   TonyCash Tool - Automated Setup
echo ========================================
echo.

REM Check if Node.js is installed
echo [INFO] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo [INFO] Please install Node.js 18+ from: https://nodejs.org/
    pause
    exit /b 1
) else (
    echo [SUCCESS] Node.js is installed
    node --version
)

REM Check if npm is installed
echo [INFO] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed!
    pause
    exit /b 1
) else (
    echo [SUCCESS] npm is installed
    npm --version
)

echo.
echo [INFO] Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies!
    pause
    exit /b 1
)
echo [SUCCESS] Dependencies installed successfully

echo.
echo [INFO] Installing automation dependencies...
call npm install --save-optional node-simctl ios-device-lib adbkit android-tools tesseract.js
echo [SUCCESS] Automation dependencies installed

echo.
echo [INFO] Creating environment configuration...
if not exist ".env.local" (
    (
    echo # TonyCash Tool Configuration
    echo # Generated on %date% %time%
    echo.
    echo # AI Configuration
    echo OPENAI_API_KEY=your_openai_api_key_here
    echo NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
    echo CLAUDE_API_KEY=
    echo.
    echo # Device Configuration
    echo DEVICE_TIMEOUT=30000
    echo MAX_RETRY_ATTEMPTS=3
    echo.
    echo # Safety Limits ^(Conservative defaults^)
    echo MAX_LIKES_PER_HOUR=50
    echo MAX_COMMENTS_PER_HOUR=10
    echo MAX_FOLLOWS_PER_HOUR=20
    echo MAX_DMS_PER_HOUR=15
    echo.
    echo # Proxy Configuration ^(Optional^)
    echo PROXY_URL=
    echo ENABLE_PROXY_ROTATION=false
    echo.
    echo # Application Settings
    echo PORT=8000
    echo NODE_ENV=development
    ) > .env.local
    echo [SUCCESS] Environment file created ^(.env.local^)
) else (
    echo [WARNING] Environment file already exists, skipping...
)

echo.
echo [INFO] Creating logs directory...
if not exist "logs" mkdir logs
echo [SUCCESS] Logs directory created

echo.
echo [INFO] Creating desktop shortcut...
(
echo @echo off
echo title TonyCash Tool
echo cd /d "%~dp0"
echo echo Starting TonyCash Tool...
echo npm run dev
echo pause
) > "TonyCash Tool.bat"
echo [SUCCESS] Desktop shortcut created: TonyCash Tool.bat

echo.
echo [INFO] Testing application startup...
echo [INFO] Starting development server...
start /b npm run dev
timeout /t 8 /nobreak >nul

REM Test if server is responding
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:8000' -UseBasicParsing | Out-Null; Write-Host '[SUCCESS] Application is running successfully!' } catch { Write-Host '[ERROR] Application failed to start properly' }"

echo.
echo ========================================
echo   Setup Completed Successfully!
echo ========================================
echo.
echo Next steps:
echo   1. Double-click "TonyCash Tool.bat" to start
echo   2. Open: http://localhost:8000
echo   3. Connect your iOS/Android device
echo   4. Go to Settings - API Keys to verify
echo   5. Start with Smart Engagement - Auto Like
echo.
echo For detailed instructions, see: INSTALLATION_GUIDE.md
echo ========================================
echo.
pause
