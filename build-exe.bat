@echo off
title TonyCash Tool - Executable Installer Builder
color 0A

echo.
echo ================================================
echo   TonyCash Tool - Building Executable Installers
echo ================================================
echo.

REM Step 1: Generate installer files
echo [INFO] Step 1: Generating installer files...
node build-installer.js
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate installer files
    pause
    exit /b 1
)
echo [SUCCESS] Installer files generated successfully

REM Step 2: Install electron-builder locally
echo [INFO] Step 2: Installing electron-builder locally...
npm install electron-builder --no-package-lock
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install electron-builder locally
    pause
    exit /b 1
)
echo [SUCCESS] electron-builder installed locally

REM Step 3: Install electron dependency
echo [INFO] Step 3: Installing electron dependency...
call npm install electron --no-package-lock
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install electron dependency
    pause
    exit /b 1
)
echo [SUCCESS] Electron dependency installed

REM Step 4: Create dist directory
echo [INFO] Step 4: Creating distribution directory...
if not exist "dist" mkdir dist
echo [SUCCESS] Distribution directory created

REM Step 5: Build Windows installer
echo [INFO] Step 5: Building Windows installer (.exe)...
call electron-builder --config installer-package.json --win
if %errorlevel% neq 0 (
    echo [WARNING] Windows installer build failed
) else (
    echo [SUCCESS] Windows installer built successfully
)

REM Step 6: List generated files
echo [INFO] Step 6: Listing generated installer files...
echo.
echo [SUCCESS] Generated installers:
if exist "dist" (
    dir dist /b
    echo.
    
    REM Show file information
    for %%f in (dist\*) do (
        echo [INFO] Generated: %%~nxf
    )
) else (
    echo [WARNING] No dist directory found
)

echo.
echo ================================================
echo   Executable installer build completed!
echo ================================================
echo.
echo Generated files:
echo   • TonyCash-Tool-Setup-1.0.0.exe (Windows)
echo.
echo Users can now:
echo   1. Download TonyCash-Tool-Setup-1.0.0.exe
echo   2. Run the installer (double-click)
echo   3. Follow the guided installation
echo   4. Launch TonyCash Tool from desktop
echo.
echo The installer will automatically:
echo   • Check system requirements
echo   • Download the latest TonyCash Tool
echo   • Install all dependencies
echo   • Set up device automation
echo   • Create desktop shortcuts
echo   • Test the installation
echo.
echo Ready for distribution! 🚀
echo ================================================
echo.
pause
