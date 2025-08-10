#!/bin/bash

# TonyCash Tool - Automated Setup Script
# This script will set up everything needed to run the Instagram automation tool

echo "🚀 TonyCash Tool - Automated Setup Starting..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
check_nodejs() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js is installed: $NODE_VERSION"
        
        # Check if version is 18 or higher
        NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR_VERSION" -ge 18 ]; then
            print_status "Node.js version is compatible"
        else
            print_error "Node.js version must be 18 or higher. Please upgrade."
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        print_info "Visit: https://nodejs.org/"
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_status "npm is installed: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_info "Installing Node.js dependencies..."
    
    if npm install; then
        print_status "Node.js dependencies installed successfully"
    else
        print_error "Failed to install Node.js dependencies"
        exit 1
    fi
}

# Install additional automation dependencies
install_automation_deps() {
    print_info "Installing automation dependencies..."
    
    # Install device control libraries
    npm install --save-optional node-simctl ios-device-lib adbkit android-tools
    
    # Install computer vision libraries (optional)
    npm install --save-optional tesseract.js
    
    print_status "Automation dependencies installed"
}

# Create environment file
create_env_file() {
    print_info "Creating environment configuration..."
    
    if [ ! -f ".env.local" ]; then
        cat > .env.local << EOF
# TonyCash Tool Configuration
# Generated on $(date)

# AI Configuration
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
CLAUDE_API_KEY=

# Device Configuration
DEVICE_TIMEOUT=30000
MAX_RETRY_ATTEMPTS=3

# Safety Limits (Conservative defaults)
MAX_LIKES_PER_HOUR=50
MAX_COMMENTS_PER_HOUR=10
MAX_FOLLOWS_PER_HOUR=20
MAX_DMS_PER_HOUR=15

# Proxy Configuration (Optional)
PROXY_URL=
ENABLE_PROXY_ROTATION=false

# Application Settings
PORT=8000
NODE_ENV=development
EOF
        print_status "Environment file created (.env.local)"
    else
        print_warning "Environment file already exists, skipping..."
    fi
}

# Create logs directory
create_logs_dir() {
    if [ ! -d "logs" ]; then
        mkdir logs
        print_status "Logs directory created"
    else
        print_status "Logs directory already exists"
    fi
}

# Check for device tools
check_device_tools() {
    print_info "Checking device automation tools..."
    
    # Check for iOS tools
    if command -v xcrun &> /dev/null; then
        print_status "iOS development tools found"
    else
        print_warning "iOS development tools not found (Xcode required for iOS automation)"
    fi
    
    # Check for Android tools
    if command -v adb &> /dev/null; then
        print_status "Android Debug Bridge (ADB) found"
    else
        print_warning "ADB not found. Install Android SDK Platform Tools for Android automation"
        print_info "macOS: brew install android-platform-tools"
        print_info "Windows: Download from Android Developer website"
    fi
}

# Test the application
test_application() {
    print_info "Testing application startup..."
    
    # Start the dev server in background
    npm run dev &
    DEV_PID=$!
    
    # Wait for server to start
    sleep 5
    
    # Test if server is responding
    if curl -s http://localhost:8000 > /dev/null; then
        print_status "Application is running successfully!"
        print_info "Access your TonyCash Tool at: http://localhost:8000"
    else
        print_error "Application failed to start properly"
    fi
    
    # Stop the dev server
    kill $DEV_PID 2>/dev/null
}

# Create desktop shortcut (macOS)
create_macos_shortcut() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        print_info "Creating macOS application shortcut..."
        
        SHORTCUT_PATH="$HOME/Desktop/TonyCash Tool.command"
        cat > "$SHORTCUT_PATH" << EOF
#!/bin/bash
cd "$(pwd)"
npm run dev
EOF
        chmod +x "$SHORTCUT_PATH"
        print_status "Desktop shortcut created: TonyCash Tool.command"
    fi
}

# Create Windows batch file
create_windows_shortcut() {
    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        print_info "Creating Windows batch file..."
        
        cat > "TonyCash Tool.bat" << EOF
@echo off
cd /d "%~dp0"
npm run dev
pause
EOF
        print_status "Windows batch file created: TonyCash Tool.bat"
    fi
}

# Main setup process
main() {
    echo ""
    print_info "Starting TonyCash Tool setup process..."
    echo ""
    
    # Step 1: Check prerequisites
    print_info "Step 1: Checking prerequisites..."
    check_nodejs
    check_npm
    echo ""
    
    # Step 2: Install dependencies
    print_info "Step 2: Installing dependencies..."
    install_dependencies
    install_automation_deps
    echo ""
    
    # Step 3: Create configuration
    print_info "Step 3: Creating configuration..."
    create_env_file
    create_logs_dir
    echo ""
    
    # Step 4: Check device tools
    print_info "Step 4: Checking device tools..."
    check_device_tools
    echo ""
    
    # Step 5: Test application
    print_info "Step 5: Testing application..."
    test_application
    echo ""
    
    # Step 6: Create shortcuts
    print_info "Step 6: Creating shortcuts..."
    create_macos_shortcut
    create_windows_shortcut
    echo ""
    
    # Setup complete
    echo "================================================"
    print_status "🎉 TonyCash Tool setup completed successfully!"
    echo ""
    print_info "Next steps:"
    echo "  1. Run: npm run dev"
    echo "  2. Open: http://localhost:8000"
    echo "  3. Connect your iOS/Android device"
    echo "  4. Go to Settings → API Keys to verify configuration"
    echo "  5. Start with Smart Engagement → Auto Like"
    echo ""
    print_info "For detailed instructions, see: INSTALLATION_GUIDE.md"
    echo "================================================"
}

# Run main function
main
