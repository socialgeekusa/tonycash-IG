@echo off
echo Starting ngrok tunnel for TonyCash Tool...
echo.
echo This will expose your local TonyCash Tool (port 8000) to the internet
echo Press Ctrl+C to stop the tunnel
echo.

REM Start ngrok HTTP tunnel on port 8000
ngrok.exe http 8000

pause
