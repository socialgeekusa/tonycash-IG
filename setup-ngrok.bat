@echo off
echo Starting ngrok tunnel for TonyCash Tool...
echo.

REM Check if ngrok exists in current directory
if exist "ngrok.exe" (
    echo Found ngrok.exe in current directory
    goto :run_ngrok_local
)

REM Check if ngrok is in PATH
where ngrok.exe >nul 2>&1
if %errorlevel% == 0 (
    echo Found ngrok in system PATH
    goto :run_ngrok_path
)

REM Check if ngrok is installed via Windows Apps
if exist "%LOCALAPPDATA%\Microsoft\WindowsApps\ngrok.exe" (
    echo Found ngrok installed via Windows Apps
    goto :run_ngrok_apps
)

echo ngrok not found. Please install ngrok:
echo.
echo Option 1: Install from Microsoft Store or Windows Apps
echo Option 2: Download from https://ngrok.com/download
echo Option 3: Extract ngrok.exe to this folder: %CD%
echo.
echo After installation, run this script again.
echo.
pause
exit /b 1

:run_ngrok_local
echo This will expose your local TonyCash Tool (port 8000) to the internet
echo Press Ctrl+C to stop the tunnel
echo.
echo Starting ngrok tunnel (bypassing browser warning)...
echo.
ngrok.exe http 8000 --config ngrok.yml --host-header=rewrite
goto :end

:run_ngrok_path
echo This will expose your local TonyCash Tool (port 8000) to the internet
echo Press Ctrl+C to stop the tunnel
echo.
echo Starting ngrok tunnel (bypassing browser warning)...
echo.
ngrok.exe http 8000 --config ngrok.yml --host-header=rewrite
goto :end

:run_ngrok_apps
echo This will expose your local TonyCash Tool (port 8000) to the internet
echo Press Ctrl+C to stop the tunnel
echo.
echo Starting ngrok tunnel (bypassing browser warning)...
echo.
"%LOCALAPPDATA%\Microsoft\WindowsApps\ngrok.exe" http 8000 --config ngrok.yml --host-header=rewrite
goto :end

:end
pause
