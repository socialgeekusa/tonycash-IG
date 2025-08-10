@echo off
title TonyCash Tool - Real-Time System Deployment
color 0A

echo.
echo ========================================
echo   TonyCash Tool - Real-Time Deployment
echo ========================================
echo.

echo [1/6] Checking prerequisites...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js found

REM Check if ADB is installed
adb version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ADB not found! Please install Android Platform Tools
    echo    Download from: https://developer.android.com/studio/releases/platform-tools
    echo    Extract to C:\adb\ and add to PATH
    pause
    exit /b 1
)
echo ✅ ADB found

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git not found! Please install Git from https://git-scm.com/
    pause
    exit /b 1
)
echo ✅ Git found

echo.
echo [2/6] Installing dependencies...
echo.
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo [3/6] Checking for connected Android devices...
echo.
adb devices
echo.
adb devices | find "device" >nul
if %errorlevel% neq 0 (
    echo ⚠️  No Android devices detected
    echo    Please connect your Android device via USB and enable USB debugging
    echo    Then run this script again
    echo.
    echo    Quick setup:
    echo    1. Go to Settings → About Phone
    echo    2. Tap Build Number 7 times
    echo    3. Go to Settings → Developer Options
    echo    4. Enable USB Debugging
    echo    5. Connect via USB and allow debugging
    echo.
    pause
    exit /b 1
)
echo ✅ Android device(s) connected

echo.
echo [4/6] Creating environment configuration...
echo.
if not exist .env.local (
    echo NEXT_PUBLIC_APP_URL=http://localhost:8000 > .env.local
    echo # Add your API keys here >> .env.local
    echo # OPENAI_API_KEY=your_key_here >> .env.local
    echo ✅ Environment file created (.env.local)
) else (
    echo ✅ Environment file already exists
)

echo.
echo [5/6] Starting the real-time system...
echo.
echo 🚀 Launching TonyCash Tool with real-time monitoring...
echo.
echo ┌─────────────────────────────────────────────────────────────┐
echo │                                                             │
echo │  🌐 Dashboard: http://localhost:8000                        │
echo │  📊 Live Terminal: http://localhost:8000/dashboard/live     │
echo │                                                             │
echo │  📱 Connected Devices: Check the live dashboard             │
echo │  🔄 Real-time Logs: Streaming automatically                │
echo │                                                             │
echo └─────────────────────────────────────────────────────────────┘
echo.
echo [6/6] System ready! Opening dashboard...
echo.

REM Start the development server
start /b npm run dev

REM Wait for server to start
echo Waiting for server to start...
timeout /t 5 /nobreak >nul

REM Open the live dashboard
start http://localhost:8000/dashboard/live

echo.
echo ========================================
echo   🎉 Real-Time System Active!
echo ========================================
echo.
echo ✅ TonyCash Tool is running
echo ✅ Real-time monitoring active
echo ✅ Live dashboard accessible
echo ✅ Android device(s) connected
echo.
echo 📋 Next Steps:
echo    1. The live dashboard should open automatically
echo    2. Verify your Android device appears in the device list
echo    3. Test device actions (Screenshot, Open Instagram, etc.)
echo    4. Watch real-time logs in the terminal
echo    5. Set up GitHub webhook for auto-deployment
echo.
echo 🔧 Troubleshooting:
echo    - If dashboard doesn't load: Check http://localhost:8000
echo    - If device not detected: Run 'adb devices' to verify connection
echo    - If logs not streaming: Refresh the dashboard page
echo.
echo 📖 Documentation:
echo    - Setup Guide: REAL_TIME_DEPLOYMENT_GUIDE.md
echo    - GitHub Integration: GITHUB_DEPLOYMENT.md
echo    - Quick Start: QUICK_START.md
echo.
echo Press any key to view system status...
pause >nul

echo.
echo ========================================
echo   📊 System Status
echo ========================================
echo.

echo 🖥️  Server Status:
netstat -ano | findstr :8000 >nul
if %errorlevel% equ 0 (
    echo    ✅ Development server running on port 8000
) else (
    echo    ❌ Development server not responding
)

echo.
echo 📱 Connected Devices:
adb devices

echo.
echo 🔄 Node.js Processes:
tasklist | findstr node.exe

echo.
echo 🌐 Access Points:
echo    • Main Dashboard: http://localhost:8000
echo    • Live Terminal: http://localhost:8000/dashboard/live
echo    • Device API: http://localhost:8000/api/devices
echo    • Deployment Webhook: http://localhost:8000/api/deployment
echo.

echo ========================================
echo   System is ready for real-time monitoring!
echo   Keep this window open to maintain the connection.
echo ========================================
echo.
echo Press Ctrl+C to stop the system
pause
