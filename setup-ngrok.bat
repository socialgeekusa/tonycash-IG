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

echo ngrok not found. Downloading ngrok...
echo.
echo Please wait while we download and set up ngrok for you...
echo.

REM Download ngrok directly to current directory
echo Downloading ngrok for Windows (64-bit)...
powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip' -OutFile 'ngrok.zip' -UseBasicParsing"

if not exist "ngrok.zip" (
    echo.
    echo Download failed. Please:
    echo 1. Go to https://ngrok.com/download
    echo 2. Download ngrok for Windows
    echo 3. Extract ngrok.exe to this folder: %CD%
    echo 4. Run this script again
    echo.
    pause
    exit /b 1
)

echo Download completed! Extracting ngrok...
powershell -Command "Expand-Archive -Path 'ngrok.zip' -DestinationPath '.' -Force"

REM Clean up zip file
del ngrok.zip

if not exist "ngrok.exe" (
    echo.
    echo Extraction failed. Please manually extract ngrok.exe from the downloaded zip file.
    echo.
    pause
    exit /b 1
)

echo ngrok setup completed successfully!
echo.

:run_ngrok_local
echo This will expose your local TonyCash Tool (port 8000) to the internet
echo Press Ctrl+C to stop the tunnel
echo.
echo Starting ngrok tunnel...
echo.
ngrok.exe http 8000
goto :end

:run_ngrok_path
echo This will expose your local TonyCash Tool (port 8000) to the internet
echo Press Ctrl+C to stop the tunnel
echo.
echo Starting ngrok tunnel...
echo.
ngrok.exe http 8000
goto :end

:end
pause
