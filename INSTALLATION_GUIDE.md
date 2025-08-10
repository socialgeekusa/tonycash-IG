# TonyCash Tool - Complete Installation & Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Download & Install
```bash
# Clone or download the project
git clone <your-repo-url>
cd tonycash-tool

# Install dependencies
npm install

# Start the application
npm run dev
```

### Step 2: Access the Application
- Open your browser and go to: **http://localhost:8000**
- You should see the TonyCash Tool dashboard

### Step 3: Configure API Keys
1. Go to **Settings** → **API Keys**
2. Your OpenAI key is already pre-configured
3. Test the connection by clicking "Test"

## 📱 Device Setup (iOS/Android)

### For iOS Devices:
1. **Enable Developer Mode**:
   - Go to Settings → Privacy & Security → Developer Mode
   - Toggle on Developer Mode
   - Restart your iPhone

2. **Trust Your Computer**:
   - Connect iPhone via USB
   - When prompted, tap "Trust This Computer"
   - Enter your passcode

3. **Install iOS App Installer** (if needed):
   ```bash
   # Install ios-deploy for device communication
   npm install -g ios-deploy
   ```

### For Android Devices:
1. **Enable Developer Options**:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → Developer Options

2. **Enable USB Debugging**:
   - In Developer Options, enable "USB Debugging"
   - Connect via USB and allow debugging

3. **Install ADB** (Android Debug Bridge):
   ```bash
   # On macOS
   brew install android-platform-tools
   
   # On Windows
   # Download ADB from Android Developer website
   ```

## 🔧 Complete Setup Process

### 1. Environment Configuration
Create a `.env.local` file in the root directory:
```env
# AI Configuration
OPENAI_API_KEY=
CLAUDE_API_KEY=

# Device Configuration
DEVICE_TIMEOUT=30000
MAX_RETRY_ATTEMPTS=3

# Safety Limits
MAX_LIKES_PER_HOUR=60
MAX_COMMENTS_PER_HOUR=15
MAX_FOLLOWS_PER_HOUR=25
MAX_DMS_PER_HOUR=20

# Proxy Configuration (Optional)
PROXY_URL=your_proxy_url_here
ENABLE_PROXY_ROTATION=false
```

### 2. Device Automation Setup

#### Install Device Control Dependencies:
```bash
# For iOS device control
npm install node-simctl ios-device-lib

# For Android device control  
npm install adbkit android-tools

# For computer vision (screenshot analysis)
npm install opencv4nodejs tesseract.js

# For advanced automation
npm install puppeteer playwright
```

#### Test Device Connection:
```bash
# Test iOS device
xcrun simctl list devices

# Test Android device
adb devices
```

### 3. Instagram Account Preparation

#### Account Safety Setup:
1. **Use a Secondary Account** (recommended for testing)
2. **Enable Two-Factor Authentication**
3. **Warm Up New Accounts**:
   - Manual activity for 1-2 weeks before automation
   - Gradually increase activity levels

#### Instagram App Setup:
1. **Install Instagram** on your connected device
2. **Log in** to your account
3. **Allow notifications** for better automation
4. **Disable auto-lock** during automation sessions

### 4. Proxy Configuration (Optional but Recommended)

#### Mobile Proxy Setup:
```javascript
// In Settings → Proxy Settings
{
  "proxyUrl": "http://username:password@proxy.example.com:8080",
  "rotationInterval": 30, // minutes
  "enableRotation": true,
  "proxyType": "mobile"
}
```

#### IP Rotation Setup:
1. Go to **Settings** → **Proxy Settings**
2. Enter your mobile proxy URL
3. Set rotation interval (30 minutes recommended)
4. Test connection

## 🎯 First Automation Setup

### 1. Configure Safety Limits
```javascript
// Go to Settings → Safety Limits
{
  "likesPerHour": 50,        // Start conservative
  "commentsPerHour": 10,     // Very conservative
  "followsPerHour": 20,      // Moderate
  "dmsPerHour": 15,          // Conservative
  "enableRandomDelays": true,
  "pauseOnWeekends": false,
  "nightPause": true         // 11 PM - 7 AM
}
```

### 2. Set Up Your First Campaign

#### Target List Setup:
1. Go to **Targeting** → **Follow Targeting**
2. Add competitor accounts:
   ```
   @competitor1, @competitor2, @influencer1
   ```
3. Set quality filters:
   - Min followers: 1000
   - Max followers: 100000
   - Skip private accounts: Yes
   - Active only: Yes

#### DM Campaign Setup:
1. Go to **DM Campaigns** → **Create Campaign**
2. Import target list (CSV format):
   ```csv
   username,fullName,followers
   entrepreneur_mike,Mike Johnson,15000
   fitness_sarah,Sarah Wilson,8500
   ```
3. Create message template:
   ```
   Hi {name}! I love your content about {niche}. 
   I'd love to connect and share some insights. 
   Are you open to a quick chat?
   ```

### 3. Enable Smart Engagement
1. Go to **Smart Engagement**
2. Configure Auto Like:
   - Likes per hour: 50
   - Target hashtags: #entrepreneur #business #success
   - Also like stories: Yes
3. Save settings and click "Start"

## 🔍 Testing & Verification

### 1. Test Device Connection
```bash
# In the TonyCash Tool dashboard
1. Go to Dashboard
2. Check "Devices: X Connected" status
3. Click "Refresh Devices"
4. Verify your device appears
```

### 2. Test AI Features
```bash
# Test AI Bio Generator
curl -X POST http://localhost:8000/api/automation \
  -H "Content-Type: application/json" \
  -d '{
    "feature": "ai_bio",
    "action": "start",
    "parameters": {
      "currentBio": "Entrepreneur and business owner",
      "niche": "business",
      "tone": "professional"
    }
  }'
```

### 3. Test Automation API
```bash
# Test Like Campaign
curl -X POST http://localhost:8000/api/automation \
  -H "Content-Type: application/json" \
  -d '{
    "feature": "like",
    "action": "start",
    "parameters": {
      "targets": ["@testuser1", "@testuser2"],
      "delay": 30000
    }
  }'
```

## 📊 Monitoring & Analytics

### 1. Real-Time Monitoring
- **Dashboard**: Live metrics and device status
- **Recent Activity**: Last 50 automation actions
- **Analytics**: Growth tracking and performance

### 2. Log Monitoring
```bash
# View logs in real-time
tail -f logs/automation.log

# Check error logs
grep "ERROR" logs/automation.log
```

### 3. Safety Monitoring
- Monitor account health daily
- Check for unusual activity warnings
- Adjust limits based on account response

## 🚨 Troubleshooting

### Common Issues:

#### Device Not Connecting:
```bash
# iOS: Reset trust settings
# Android: Revoke and re-enable USB debugging
# Check USB cable and ports
```

#### API Errors:
```bash
# Check API key validity
# Verify network connection
# Check rate limits
```

#### Instagram Blocks:
```bash
# Reduce automation speed
# Add more random delays
# Use different IP addresses
# Take breaks between sessions
```

### Emergency Stops:
```bash
# Stop all automation immediately
curl -X POST http://localhost:8000/api/automation \
  -H "Content-Type: application/json" \
  -d '{"feature": "all", "action": "stop"}'
```

## 🎉 You're Ready!

### Final Checklist:
- ✅ Application running at http://localhost:8000
- ✅ Device connected and recognized
- ✅ API keys configured and tested
- ✅ Safety limits set appropriately
- ✅ First campaign configured
- ✅ Monitoring dashboard active

### Next Steps:
1. **Start Small**: Begin with 1-2 automation features
2. **Monitor Closely**: Watch for 24-48 hours
3. **Scale Gradually**: Increase limits slowly
4. **Optimize**: Adjust based on results

## 📞 Support

If you encounter any issues:
1. Check the logs in the dashboard
2. Review the troubleshooting section
3. Test with minimal settings first
4. Ensure device permissions are correct

**Your TonyCash Tool is now fully operational! 🚀**
