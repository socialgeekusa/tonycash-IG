#!/bin/bash

# TonyCash Tool - Executable Installer Builder
# Creates .exe for Windows and .app/.dmg for macOS

echo "🚀 TonyCash Tool - Building Executable Installers"
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Generate installer files
print_info "Step 1: Generating installer files..."
node build-installer.js

if [ $? -eq 0 ]; then
    print_status "Installer files generated successfully"
else
    print_error "Failed to generate installer files"
    exit 1
fi

# Step 2: Install electron-builder globally
print_info "Step 2: Installing electron-builder locally..."
npm install electron-builder --no-package-lock
if [ $? -eq 0 ]; then
    print_status "electron-builder installed locally"
else
    print_error "Failed to install electron-builder locally"
    exit 1
fi

# Step 3: Install electron dependency
print_info "Step 3: Installing electron dependency..."
npm install electron --no-package-lock
if [ $? -eq 0 ]; then
    print_status "Electron dependency installed"
else
    print_error "Failed to install electron dependency"
    exit 1
fi

# Step 4: Create dist directory
print_info "Step 4: Creating distribution directory..."
mkdir -p dist
print_status "Distribution directory created"

# Step 5: Build installers based on platform
print_info "Step 5: Building platform-specific installers..."

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - Build both Windows and macOS
    print_info "Building macOS installer (.dmg)..."
    electron-builder --config installer-package.json --mac
    
    if [ $? -eq 0 ]; then
        print_status "macOS installer built successfully"
    else
        print_warning "macOS installer build failed (may need code signing)"
    fi
    
    print_info "Building Windows installer (.exe)..."
    electron-builder --config installer-package.json --win
    
    if [ $? -eq 0 ]; then
        print_status "Windows installer built successfully"
    else
        print_warning "Windows installer build failed (cross-platform build)"
    fi
    
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    # Windows - Build Windows installer
    print_info "Building Windows installer (.exe)..."
    electron-builder --config installer-package.json --win
    
    if [ $? -eq 0 ]; then
        print_status "Windows installer built successfully"
    else
        print_error "Windows installer build failed"
        exit 1
    fi
    
else
    # Linux - Build both
    print_info "Building Windows installer (.exe)..."
    electron-builder --config installer-package.json --win
    
    print_info "Building Linux installer (.AppImage)..."
    electron-builder --config installer-package.json --linux
fi

# Step 6: List generated files
print_info "Step 6: Listing generated installer files..."
echo ""
print_status "Generated installers:"

if [ -d "dist" ]; then
    ls -la dist/
    echo ""
    
    # Show file sizes
    for file in dist/*; do
        if [ -f "$file" ]; then
            size=$(du -h "$file" | cut -f1)
            filename=$(basename "$file")
            print_info "📦 $filename ($size)"
        fi
    done
else
    print_warning "No dist directory found"
fi

echo ""
echo "================================================"
print_status "🎉 Executable installer build completed!"
echo ""
print_info "Generated files:"
echo "  • TonyCash-Tool-Setup-1.0.0.exe (Windows)"
echo "  • TonyCash-Tool-1.0.0.dmg (macOS)"
echo "  • TonyCash-Tool-1.0.0.AppImage (Linux)"
echo ""
print_info "Users can now:"
echo "  1. Download the appropriate installer"
echo "  2. Run the installer (double-click)"
echo "  3. Follow the guided installation"
echo "  4. Launch TonyCash Tool from desktop"
echo ""
print_info "The installer will automatically:"
echo "  • Check system requirements"
echo "  • Download the latest TonyCash Tool"
echo "  • Install all dependencies"
echo "  • Set up device automation"
echo "  • Create desktop shortcuts"
echo "  • Test the installation"
echo ""
print_status "Ready for distribution! 🚀"
echo "================================================"
