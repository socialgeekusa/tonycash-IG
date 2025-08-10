@echo off
REM === CONFIGURATION ===
set REPO_PATH="C:\Users\XO Social Boost\Desktop\TonyCash-Tool"
set BRANCH=main
set INTERVAL=20

REM Change to your repo folder
cd /d %REPO_PATH%

REM Make sure Git is available
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed or not in PATH.
    pause
    exit /b
)

:loop
    echo.
    echo [ %date% %time% ] Checking for updates...
    git fetch origin %BRANCH% --quiet

    REM Compare local and remote
    for /f "delims=" %%i in ('git rev-parse @') do set LOCAL=%%i
    for /f "delims=" %%i in ('git rev-parse @{u}') do set REMOTE=%%i
    for /f "delims=" %%i in ('git merge-base @ @{u}') do set BASE=%%i

    if "%LOCAL%"=="%REMOTE%" (
        echo Already up-to-date.
    ) else if "%LOCAL%"=="%BASE%" (
        echo New commits found — pulling...
        git pull --ff-only --quiet
        echo Pulled latest changes successfully.
    ) else if "%REMOTE%"=="%BASE%" (
        echo Local ahead of remote — no pull needed.
    ) else (
        echo WARNING: Local and remote have diverged — manual resolution required!
    )

    timeout /t %INTERVAL% >nul
goto loop
