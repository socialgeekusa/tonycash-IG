@echo off
echo Installing ngrok for TonyCash Tool...
echo.

REM Download using PowerShell with progress suppressed
echo Downloading ngrok...
powershell -Command "$ProgressPreference = 'SilentlyContinue'; try { Invoke-WebRequest -Uri 'https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip' -OutFile 'ngrok.zip' -UseBasicParsing; Write-Host 'Download completed' } catch { Write-Host 'Download failed' }"

if not exist "ngrok.zip" (
    echo Failed to download ngrok. Please check your internet connection.
    pause
    exit /b 1
)

REM Extract using PowerShell
echo Extracting ngrok...
powershell -Command "try { Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('ngrok.zip', '.'); Write-Host 'Extraction completed' } catch { Write-Host 'Extraction failed' }"

REM Clean up
if exist "ngrok.zip" del "ngrok.zip"

REM Verify installation
if exist "ngrok.exe" (
    echo.
    echo SUCCESS: ngrok.exe has been installed successfully!
    echo You can now run setup-ngrok.bat to start the tunnel.
    echo.
) else (
    echo.
    echo ERROR: ngrok.exe was not found after extraction.
    echo Please try downloading ngrok manually from https://ngrok.com/download
    echo.
)

pause
