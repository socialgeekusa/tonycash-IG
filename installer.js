
const { app, BrowserWindow, dialog, shell } = require('electron');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');

class TonyCashInstaller {
  constructor() {
    this.installDir = path.join(os.homedir(), 'TonyCash-Tool');
    this.steps = [
      'Checking system requirements',
      'Downloading TonyCash Tool',
      'Installing Node.js dependencies',
      'Setting up device automation',
      'Configuring environment',
      'Creating desktop shortcuts',
      'Testing installation'
    ];
    this.currentStep = 0;
    this.window = null;
  }

  async createWindow() {
    this.window = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      icon: path.join(__dirname, 'assets', 'icon.png'),
      title: 'TonyCash Tool Installer',
      resizable: false,
      center: true
    });

    // Create installer HTML
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>TonyCash Tool Installer</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.1);
          padding: 40px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        .logo {
          width: 80px;
          height: 80px;
          background: #fff;
          border-radius: 50%;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }
        h1 {
          margin: 0 0 10px;
          font-size: 32px;
        }
        .subtitle {
          opacity: 0.8;
          margin-bottom: 40px;
          font-size: 18px;
        }
        .progress-container {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          padding: 20px;
          margin: 30px 0;
        }
        .progress-bar {
          background: rgba(255, 255, 255, 0.3);
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
          margin: 20px 0;
        }
        .progress-fill {
          background: #4CAF50;
          height: 100%;
          width: 0%;
          transition: width 0.3s ease;
        }
        .step {
          text-align: left;
          margin: 10px 0;
          opacity: 0.6;
        }
        .step.active {
          opacity: 1;
          font-weight: bold;
        }
        .step.completed {
          opacity: 0.8;
          color: #4CAF50;
        }
        .button {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          margin: 10px;
          transition: background 0.3s;
        }
        .button:hover {
          background: #45a049;
        }
        .button:disabled {
          background: #666;
          cursor: not-allowed;
        }
        .log {
          background: rgba(0, 0, 0, 0.3);
          padding: 20px;
          border-radius: 8px;
          text-align: left;
          font-family: monospace;
          font-size: 12px;
          max-height: 200px;
          overflow-y: auto;
          margin: 20px 0;
          display: none;
        }
        .success {
          color: #4CAF50;
        }
        .error {
          color: #f44336;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">TC</div>
        <h1>TonyCash Tool</h1>
        <div class="subtitle">Instagram Growth Automation</div>
        
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" id="progressFill"></div>
          </div>
          <div id="currentStep">Ready to install</div>
        </div>

        <div id="steps">
          <!-- Steps will be populated by JavaScript -->
        </div>

        <div class="log" id="log"></div>

        <div>
          <button class="button" id="installBtn" onclick="startInstallation()">
            Install TonyCash Tool
          </button>
          <button class="button" id="openBtn" onclick="openApplication()" style="display:none;">
            Open TonyCash Tool
          </button>
        </div>
      </div>

      <script>
        const { ipcRenderer } = require('electron');
        
        const steps = [
          'Checking system requirements',
          'Downloading TonyCash Tool',
          'Installing Node.js dependencies',
          'Setting up device automation',
          'Configuring environment',
          'Creating desktop shortcuts',
          'Testing installation'
        ];

        function updateSteps() {
          const stepsContainer = document.getElementById('steps');
          stepsContainer.innerHTML = steps.map((step, index) => 
            `<div class="step" id="step-${index}">${step}</div>`
          ).join('');
        }

        function updateProgress(stepIndex, message) {
          const progress = ((stepIndex + 1) / steps.length) * 100;
          document.getElementById('progressFill').style.width = progress + '%';
          document.getElementById('currentStep').textContent = message || steps[stepIndex];
          
          // Update step status
          steps.forEach((_, index) => {
            const stepEl = document.getElementById(`step-${index}`);
            if (index < stepIndex) {
              stepEl.className = 'step completed';
            } else if (index === stepIndex) {
              stepEl.className = 'step active';
            } else {
              stepEl.className = 'step';
            }
          });
        }

        function logMessage(message, type = 'info') {
          const log = document.getElementById('log');
          log.style.display = 'block';
          const timestamp = new Date().toLocaleTimeString();
          const className = type === 'error' ? 'error' : type === 'success' ? 'success' : '';
          log.innerHTML += `<div class="${className}">[${timestamp}] ${message}</div>`;
          log.scrollTop = log.scrollHeight;
        }

        function startInstallation() {
          document.getElementById('installBtn').disabled = true;
          document.getElementById('installBtn').textContent = 'Installing...';
          ipcRenderer.send('start-installation');
        }

        function openApplication() {
          ipcRenderer.send('open-application');
        }

        // IPC listeners
        ipcRenderer.on('installation-progress', (event, stepIndex, message) => {
          updateProgress(stepIndex, message);
        });

        ipcRenderer.on('installation-log', (event, message, type) => {
          logMessage(message, type);
        });

        ipcRenderer.on('installation-complete', (event, success) => {
          if (success) {
            document.getElementById('installBtn').style.display = 'none';
            document.getElementById('openBtn').style.display = 'inline-block';
            logMessage('Installation completed successfully!', 'success');
          } else {
            document.getElementById('installBtn').disabled = false;
            document.getElementById('installBtn').textContent = 'Retry Installation';
            logMessage('Installation failed. Please try again.', 'error');
          }
        });

        // Initialize
        updateSteps();
      </script>
    </body>
    </html>
    `;

    this.window.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  }

  async checkSystemRequirements() {
    this.updateProgress(0, 'Checking system requirements...');
    
    try {
      // Check Node.js
      try {
        const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
        this.log(`Node.js found: ${nodeVersion}`, 'success');
        
        const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
        if (majorVersion < 18) {
          throw new Error('Node.js 18+ required');
        }
      } catch (error) {
        this.log('Node.js not found or outdated. Please install Node.js 18+ first.', 'error');
        throw error;
      }

      // Check npm
      try {
        const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
        this.log(`npm found: ${npmVersion}`, 'success');
      } catch (error) {
        this.log('npm not found. Please install npm.', 'error');
        throw error;
      }

      // Check git
      try {
        const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
        this.log(`Git found: ${gitVersion}`, 'success');
      } catch (error) {
        this.log('Git not found. Please install Git.', 'error');
        throw error;
      }

      this.log('System requirements check passed!', 'success');
      return true;
    } catch (error) {
      this.log(`System requirements check failed: ${error.message}`, 'error');
      return false;
    }
  }

  async downloadTonyCashTool() {
    this.updateProgress(1, 'Downloading TonyCash Tool...');
    
    try {
      // Create installation directory
      if (!fs.existsSync(this.installDir)) {
        fs.mkdirSync(this.installDir, { recursive: true });
      }

      // Clone repository
      this.log('Cloning repository...', 'info');
      execSync(`git clone https://github.com/socialgeekusa/tonycash-tool-ig.git "${this.installDir}"`, { 
        stdio: 'pipe',
        cwd: path.dirname(this.installDir)
      });

      this.log('Repository cloned successfully!', 'success');
      return true;
    } catch (error) {
      this.log(`Download failed: ${error.message}`, 'error');
      return false;
    }
  }

  async installDependencies() {
    this.updateProgress(2, 'Installing Node.js dependencies...');
    
    try {
      this.log('Installing npm packages...', 'info');
      execSync('npm install', { 
        cwd: this.installDir,
        stdio: 'pipe'
      });

      this.log('Installing automation dependencies...', 'info');
      execSync('npm install --save-optional node-simctl ios-device-lib adbkit android-tools tesseract.js', {
        cwd: this.installDir,
        stdio: 'pipe'
      });

      this.log('Dependencies installed successfully!', 'success');
      return true;
    } catch (error) {
      this.log(`Dependency installation failed: ${error.message}`, 'error');
      return false;
    }
  }

  async setupDeviceAutomation() {
    this.updateProgress(3, 'Setting up device automation...');
    
    try {
      // Check for device tools
      if (process.platform === 'darwin') {
        try {
          execSync('xcrun simctl list devices', { stdio: 'pipe' });
          this.log('iOS development tools found', 'success');
        } catch {
          this.log('iOS development tools not found (Xcode required for iOS automation)', 'warning');
        }
      }

      try {
        execSync('adb version', { stdio: 'pipe' });
        this.log('Android Debug Bridge found', 'success');
      } catch {
        this.log('ADB not found. Install Android SDK Platform Tools for Android automation', 'warning');
      }

      this.log('Device automation setup completed', 'success');
      return true;
    } catch (error) {
      this.log(`Device automation setup failed: ${error.message}`, 'error');
      return false;
    }
  }

  async configureEnvironment() {
    this.updateProgress(4, 'Configuring environment...');
    
    try {
      // Create .env.local file
      const envContent = `# TonyCash Tool Configuration
# Generated on ${new Date().toISOString()}

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
`;

      fs.writeFileSync(path.join(this.installDir, '.env.local'), envContent);
      
      // Create logs directory
      const logsDir = path.join(this.installDir, 'logs');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
      }

      this.log('Environment configured successfully!', 'success');
      return true;
    } catch (error) {
      this.log(`Environment configuration failed: ${error.message}`, 'error');
      return false;
    }
  }

  async createDesktopShortcuts() {
    this.updateProgress(5, 'Creating desktop shortcuts...');
    
    try {
      const desktopPath = path.join(os.homedir(), 'Desktop');
      
      if (process.platform === 'win32') {
        // Windows batch file
        const batchContent = `@echo off
title TonyCash Tool
cd /d "${this.installDir}"
echo Starting TonyCash Tool...
npm run dev
pause`;
        
        fs.writeFileSync(path.join(desktopPath, 'TonyCash Tool.bat'), batchContent);
        this.log('Windows desktop shortcut created', 'success');
        
      } else if (process.platform === 'darwin') {
        // macOS command file
        const commandContent = `#!/bin/bash
cd "${this.installDir}"
npm run dev`;
        
        const commandPath = path.join(desktopPath, 'TonyCash Tool.command');
        fs.writeFileSync(commandPath, commandContent);
        fs.chmodSync(commandPath, '755');
        this.log('macOS desktop shortcut created', 'success');
      }

      return true;
    } catch (error) {
      this.log(`Desktop shortcut creation failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testInstallation() {
    this.updateProgress(6, 'Testing installation...');
    
    try {
      this.log('Starting test server...', 'info');
      
      // Start dev server in background
      const server = spawn('npm', ['run', 'dev'], {
        cwd: this.installDir,
        detached: true,
        stdio: 'pipe'
      });

      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 8000));

      // Test if server is responding
      const http = require('http');
      const testRequest = new Promise((resolve, reject) => {
        const req = http.get('http://localhost:8000', (res) => {
          if (res.statusCode === 200) {
            resolve(true);
          } else {
            reject(new Error(`Server returned status ${res.statusCode}`));
          }
        });
        req.on('error', reject);
        req.setTimeout(5000, () => reject(new Error('Request timeout')));
      });

      await testRequest;
      
      // Stop test server
      server.kill();
      
      this.log('Installation test passed!', 'success');
      return true;
    } catch (error) {
      this.log(`Installation test failed: ${error.message}`, 'error');
      return false;
    }
  }

  updateProgress(stepIndex, message) {
    this.currentStep = stepIndex;
    if (this.window) {
      this.window.webContents.send('installation-progress', stepIndex, message);
    }
  }

  log(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    if (this.window) {
      this.window.webContents.send('installation-log', message, type);
    }
  }

  async runInstallation() {
    try {
      const steps = [
        () => this.checkSystemRequirements(),
        () => this.downloadTonyCashTool(),
        () => this.installDependencies(),
        () => this.setupDeviceAutomation(),
        () => this.configureEnvironment(),
        () => this.createDesktopShortcuts(),
        () => this.testInstallation()
      ];

      for (let i = 0; i < steps.length; i++) {
        const success = await steps[i]();
        if (!success) {
          throw new Error(`Step ${i + 1} failed`);
        }
      }

      this.updateProgress(steps.length - 1, 'Installation completed successfully!');
      this.window.webContents.send('installation-complete', true);
      
    } catch (error) {
      this.log(`Installation failed: ${error.message}`, 'error');
      this.window.webContents.send('installation-complete', false);
    }
  }

  openApplication() {
    const url = 'http://localhost:8000';
    
    // Start the application
    spawn('npm', ['run', 'dev'], {
      cwd: this.installDir,
      detached: true,
      stdio: 'ignore'
    });

    // Wait a moment then open browser
    setTimeout(() => {
      shell.openExternal(url);
    }, 3000);
  }
}

// Electron app setup
app.whenReady().then(() => {
  const installer = new TonyCashInstaller();
  installer.createWindow();

  // IPC handlers
  const { ipcMain } = require('electron');
  
  ipcMain.on('start-installation', () => {
    installer.runInstallation();
  });

  ipcMain.on('open-application', () => {
    installer.openApplication();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
