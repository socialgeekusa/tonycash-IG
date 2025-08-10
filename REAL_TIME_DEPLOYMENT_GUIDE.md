# 🚀 TonyCash Tool - Real-Time System Deployment Guide

## 🌟 Overview

The TonyCash Tool now includes a sophisticated real-time monitoring system that allows you to:

- **Monitor live device actions** from connected Android phones in real-time
- **Debug issues immediately** through a cloud-based dashboard accessible from your sandbox environment
- **Automatically deploy updates** from GitHub to your Windows PC
- **View real-time logs** of every ADB command, device action, and system event
- **Push fixes and test them instantly** without stopping the automation process

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Your Sandbox  │    │   GitHub Repo    │    │   Windows PC    │
│   Environment   │◄──►│                  │◄──►│                 │
│                 │    │                  │    │ ┌─────────────┐ │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ │Android Phone│ │
│ │Live Terminal│ │    │ │   Webhook    │ │    │ │   (USB)     │ │
│ │  Dashboard  │ │    │ │   Endpoint   │ │    │ └─────────────┘ │
│ └─────────────┘ │    │ └──────────────┘ │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         └────────── Real-time Logs & Commands ────────────┘
```

## 📋 Prerequisites

- **GitHub Repository**: Your TonyCash Tool repository
- **Windows PC**: With GitHub Desktop installed
- **Android Device**: With USB debugging enabled
- **ADB Tools**: Android Debug Bridge installed
- **Node.js 18+**: For running the application
- **Sandbox Environment**: For accessing the live dashboard

## 🔧 Step 1: Windows PC Setup

### 1.1 Install Required Software

```batch
# Download and install:
# - GitHub Desktop: https://desktop.github.com/
# - Node.js 18+: https://nodejs.org/
# - ADB Platform Tools: https://developer.android.com/studio/releases/platform-tools
```

### 1.2 Setup ADB

```batch
# Extract ADB tools to C:\adb\
# Add C:\adb\ to your system PATH
# Verify installation:
adb version
```

### 1.3 Clone Repository

```batch
# Using GitHub Desktop:
# 1. Sign in to GitHub Desktop
# 2. Clone your repository
# 3. Enable automatic sync

# Or using command line:
git clone https://github.com/socialgeekusa/tonycash-IG.git
cd tonycash-IG
```

### 1.4 Install Dependencies

```batch
npm install
```

### 1.5 Create Environment File

Create `.env.local`:
```env
NEXT_PUBLIC_APP_URL=http://localhost:8000
OPENAI_API_KEY=your_openai_key_here
```

## 📱 Step 2: Android Device Setup

### 2.1 Enable Developer Options

1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times
3. Developer Options will appear in Settings

### 2.2 Enable USB Debugging

1. Go to **Settings** → **Developer Options**
2. Enable **USB Debugging**
3. Enable **Stay Awake** (recommended)
4. Enable **USB Debugging (Security Settings)** if available

### 2.3 Connect Device

1. Connect Android device via USB cable
2. Allow USB debugging when prompted on device
3. Verify connection:

```batch
adb devices
# Should show your device listed
```

## 🌐 Step 3: Start the Real-Time System

### 3.1 Launch the Application

```batch
npm run dev
```

The application will be available at `http://localhost:8000`

### 3.2 Access Live Dashboard

1. Open browser and navigate to: `http://localhost:8000/dashboard/live`
2. Your connected Android device should appear in the device list
3. The live terminal will start showing real-time logs immediately

### 3.3 Test Device Connection

1. Click on your device in the device list
2. Try the "Screenshot" action
3. Watch the live terminal for real-time ADB commands and results
4. Try "Open Instagram" to see the full automation flow

## 🔄 Step 4: GitHub Webhook Setup

### 4.1 Expose Local Server (Development)

For testing webhooks locally, use ngrok:

```batch
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 8000

# Copy the https URL (e.g., https://abc123.ngrok.io)
```

### 4.2 Configure GitHub Webhook

1. Go to your GitHub repository
2. Navigate to **Settings** → **Webhooks**
3. Click **Add webhook**
4. Configure:
   - **Payload URL**: `https://abc123.ngrok.io/api/deployment`
   - **Content type**: `application/json`
   - **Events**: Select "Push events"
   - **Active**: ✅ Checked

### 4.3 Test Webhook

1. Make a small change to your code
2. Commit and push to GitHub
3. Check the live dashboard - you should see deployment events in real-time

## 🖥️ Step 5: Access Live Dashboard from Sandbox

### 5.1 Dashboard Features

The live dashboard at `http://localhost:8000/dashboard/live` provides:

**Real-Time Terminal**
- Live streaming of all device actions
- ADB command execution logs
- Instagram automation events
- System notifications
- Deployment status updates

**Device Management**
- Connected device overview
- Device status monitoring
- Action execution controls
- Screenshot capabilities

**Advanced Filtering**
- Filter by log level (info, warn, error, debug)
- Filter by category (device, automation, api, scheduler)
- Filter by specific device
- Search through log messages
- Export logs for analysis

### 5.2 Live Debugging Workflow

1. **Monitor Actions**: Watch real-time logs as actions execute
2. **Identify Issues**: Filter by error level to see problems
3. **Fix Code**: Make changes in your IDE
4. **Push Updates**: Commit and push to GitHub
5. **Auto-Deploy**: GitHub Desktop pulls changes automatically
6. **Test Immediately**: New code is active instantly
7. **Verify Fix**: Watch live logs to confirm resolution

## 🔍 Step 6: Real-Time Debugging Examples

### 6.1 Device Action Monitoring

When you execute a device action, you'll see logs like:

```
[14:32:15] [INFO] [device123] API Request: open_instagram - started
[14:32:15] [INFO] [device123] open_instagram - started (step: wake_device)
[14:32:16] [INFO] [device123] ADB: input keyevent KEYCODE_WAKEUP
[14:32:17] [INFO] [device123] open_instagram - started (step: unlock_device)
[14:32:17] [INFO] [device123] ADB: input swipe 500 1500 500 500
[14:32:18] [INFO] [device123] open_instagram - started (step: launch_app)
[14:32:19] [INFO] [device123] ADB: monkey -p com.instagram.android -c android.intent.category.LAUNCHER 1
[14:32:22] [INFO] [device123] open_instagram - success (duration: 7234ms)
```

### 6.2 Error Detection and Fixing

If an action fails, you'll see:

```
[14:35:20] [ERROR] [device123] tap - error (coordinates: 400,600, error: Device not responding)
```

You can then:
1. Identify the issue (device not responding)
2. Fix the code (add retry logic)
3. Push the fix to GitHub
4. Test immediately on the same device

### 6.3 Instagram Automation Monitoring

Instagram-specific actions show detailed logs:

```
[14:40:10] [INFO] [device123] Instagram: like_post on @username - success
[14:40:15] [INFO] [device123] Instagram: comment_post on @username - started
[14:40:16] [INFO] [device123] ADB: input tap 350 750
[14:40:17] [INFO] [device123] ADB: input text "Great post! 👍"
[14:40:18] [INFO] [device123] Instagram: comment_post on @username - success
```

## 🚀 Step 7: Automated Deployment Flow

### 7.1 Development Workflow

1. **Code Changes**: Make improvements in your IDE
2. **Commit & Push**: Push changes to GitHub
3. **Webhook Trigger**: GitHub sends webhook to `/api/deployment`
4. **Real-Time Logging**: Deployment events appear in live dashboard
5. **Auto-Pull**: GitHub Desktop pulls latest changes
6. **Server Restart**: Development server restarts automatically
7. **Immediate Testing**: Test fixes on connected devices

### 7.2 Deployment Events in Live Dashboard

You'll see deployment logs like:

```
[15:10:30] [INFO] Deployment: GitHub webhook received: push - started
[15:10:31] [INFO] Deployment: Push to main branch - started
[15:10:32] [INFO] Deployment: Starting deployment process - started
[15:10:34] [INFO] Deployment: Deployment step: Pulling latest code from GitHub - started
[15:10:36] [INFO] Deployment: Deployment step completed: Pulling latest code from GitHub - success
[15:10:37] [INFO] Deployment: Deployment step: Installing dependencies - started
[15:10:40] [INFO] Deployment: Deployment step completed: Installing dependencies - success
[15:10:41] [INFO] Deployment: Deployment completed successfully - success
```

## 🛠️ Step 8: Advanced Configuration

### 8.1 Custom Deployment Scripts

Create `deploy.bat` for manual deployment:

```batch
@echo off
echo [DEPLOY] Pulling latest changes...
git pull origin main

echo [DEPLOY] Installing dependencies...
npm install

echo [DEPLOY] Restarting development server...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul
start /b npm run dev

echo [DEPLOY] Deployment complete! Server starting...
echo [DEPLOY] Access dashboard at: http://localhost:8000/dashboard/live
pause
```

### 8.2 Multi-Device Support

Connect multiple Android devices:

1. Connect additional devices via USB
2. Enable USB debugging on each device
3. Verify with `adb devices`
4. All devices will appear in the live dashboard
5. Execute actions on specific devices
6. Monitor all devices simultaneously

### 8.3 Custom Actions

Add custom device actions by extending the API:

```typescript
// In src/app/api/devices/action/route.ts
case 'custom_scroll_and_like':
  result = await customScrollAndLike(deviceId, execAsync, parameters)
  break
```

## 🔐 Step 9: Security & Best Practices

### 9.1 Webhook Security

For production, implement webhook signature verification:

```typescript
// In src/app/api/deployment/route.ts
const crypto = require('crypto')
const signature = request.headers.get('x-hub-signature-256')
const payload = await request.text()
const secret = process.env.GITHUB_WEBHOOK_SECRET

const expectedSignature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex')

if (signature !== `sha256=${expectedSignature}`) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
}
```

### 9.2 Device Security

- Only connect trusted Android devices
- Use secure USB connections
- Regularly update ADB tools
- Monitor device permissions in live dashboard

### 9.3 Network Security

- Use HTTPS for production webhooks
- Implement rate limiting on API endpoints
- Monitor for suspicious activity
- Regular security updates

## 🚨 Step 10: Troubleshooting

### 10.1 Common Issues

**Device Not Detected**
```batch
# Check ADB connection
adb devices

# Restart ADB server
adb kill-server
adb start-server

# Check USB debugging is enabled on device
```

**Live Dashboard Not Loading**
- Verify development server is running on port 8000
- Check browser console for JavaScript errors
- Clear browser cache and cookies
- Ensure no firewall blocking port 8000

**Webhook Not Working**
- Verify ngrok is running and URL is correct
- Check GitHub webhook delivery logs
- Ensure webhook endpoint is accessible
- Test with curl: `curl -X POST http://localhost:8000/api/deployment`

**Real-Time Logs Not Streaming**
- Check browser console for EventSource errors
- Verify Server-Sent Events are supported
- Try refreshing the dashboard page
- Check network connectivity

### 10.2 Debug Commands

```batch
# Check running Node.js processes
tasklist | findstr node

# Kill all Node.js processes
taskkill /f /im node.exe

# Check port 8000 usage
netstat -ano | findstr :8000

# Test ADB connection
adb shell echo "Connection test"

# Check Git status
git status
git log --oneline -5

# Test webhook endpoint
curl -X POST http://localhost:8000/api/deployment -H "Content-Type: application/json" -d "{\"test\": true}"
```

## 📊 Step 11: Monitoring & Analytics

### 11.1 Live Dashboard Metrics

The dashboard provides real-time metrics:

- **Total Actions**: Count of all device actions performed
- **Success Rate**: Percentage of successful actions
- **Error Count**: Number of failed actions
- **Active Devices**: Currently connected devices
- **Average Duration**: Average time per action

### 11.2 Log Analysis

Export logs for detailed analysis:

1. Click "Export Logs" in the live dashboard
2. Analyze patterns in device behavior
3. Identify optimization opportunities
4. Track automation performance over time

### 11.3 Performance Monitoring

Monitor system performance:

- Memory usage of Node.js process
- API response times
- Device connection stability
- Deployment frequency and success rate

## 🎯 Step 12: Advanced Features

### 12.1 Remote Dashboard Access

For production deployment, set up remote access:

1. Deploy to a cloud service (Vercel, Netlify, etc.)
2. Configure environment variables
3. Set up proper authentication
4. Access dashboard from anywhere

### 12.2 Collaborative Debugging

Multiple team members can:

1. Access the same live dashboard
2. Monitor device actions simultaneously
3. Share log exports for analysis
4. Collaborate on fixes in real-time

### 12.3 Custom Automation Workflows

Create complex automation sequences:

```typescript
// Example: Custom Instagram engagement workflow
const workflow = [
  { action: 'open_instagram', delay: 2000 },
  { action: 'search_hashtag', params: { hashtag: '#fitness' }, delay: 3000 },
  { action: 'like_posts', params: { count: 5 }, delay: 1000 },
  { action: 'follow_users', params: { count: 3 }, delay: 2000 }
]
```

## 🎉 You're All Set!

Your TonyCash Tool is now configured with a complete real-time monitoring and deployment system:

✅ **Real-time device monitoring** - See every action as it happens
✅ **Live dashboard debugging** - Debug from your sandbox environment  
✅ **Automatic GitHub deployment** - Push fixes and test immediately
✅ **Comprehensive logging system** - Track everything in detail
✅ **Multi-device support** - Monitor multiple Android devices
✅ **Advanced filtering** - Find specific logs quickly
✅ **Export capabilities** - Analyze logs offline
✅ **Webhook integration** - Automated deployment pipeline

## 🚀 Next Steps

1. **Connect your Android device** and verify it appears in the dashboard
2. **Test basic actions** like screenshot and Instagram opening
3. **Set up GitHub webhook** for automated deployments
4. **Make a test change** and push to GitHub to verify the deployment flow
5. **Start monitoring** your Instagram automation in real-time

Visit the live dashboard at: `http://localhost:8000/dashboard/live`

**Happy automating! 🤖📱**
