@echo off
echo Starting ngrok tunnel for TonyCash Tool...
echo.

REM Check if ngrok exists in current directory
if exist "ngrok.exe" (
    echo Found ngrok.exe in current directory
    goto :run_ngrok
)

REM Check if ngrok is in PATH
where ngrok.exe >nul 2>&1
if %errorlevel% == 0 (
    echo Found ngrok in system PATH
    goto :run_ngrok_path
)

echo ngrok not found. Downloading ngrok...
echo.

REM Create ngrok directory if it doesn't exist
if not exist "ngrok" mkdir ngrok
cd ngrok

REM Download ngrok for Windows
echo Downloading ngrok for Windows...
powershell -Command "Invoke-WebRequest -Uri 'https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip' -OutFile 'ngrok.zip'"

if not exist "ngrok.zip" (
    echo Failed to download ngrok. Please download manually from https://ngrok.com/download
    pause
    exit /b 1
)

REM Extract ngrok
echo Extracting ngrok...
powershell -Command "Expand-Archive -Path 'ngrok.zip' -DestinationPath '.' -Force"

REM Clean up zip file
del ngrok.zip

REM Go back to parent directory
cd ..

echo ngrok downloaded and extracted successfully!
echo.

:run_ngrok
echo This will expose your local TonyCash Tool (port 8000) to the internet
echo Press Ctrl+C to stop the tunnel
echo.
echo Starting ngrok tunnel...
ngrok\ngrok.exe http 8000
goto :end

:run_ngrok_path
echo This will expose your local TonyCash Tool (port 8000) to the internet
echo Press Ctrl+C to stop the tunnel
echo.
echo Starting ngrok tunnel...
ngrok.exe http 8000
goto :end

:end
pause
