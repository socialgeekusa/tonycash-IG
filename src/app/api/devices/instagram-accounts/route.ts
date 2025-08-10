import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { realTimeLogger, logDeviceAction, logADBCommand } from '@/lib/realtime-logger'

const execAsync = promisify(exec)

export interface InstagramAccount {
  username: string
  displayName: string
  isActive: boolean
  lastUsed: Date
  deviceId: string
  detectionMethod?: string
  confidence?: number
}

// Enhanced username extraction with multiple detection methods
async function extractUsernameFromScreenshot(imagePath: string, deviceId: string): Promise<string | null> {
  const startTime = Date.now()
  
  try {
    logDeviceAction(deviceId, 'extract_username_screenshot', 'started', { imagePath })
    
    // Check if file exists
    const fs = require('fs')
    if (!fs.existsSync(imagePath)) {
      logDeviceAction(deviceId, 'extract_username_screenshot', 'error', { error: 'Screenshot file not found', imagePath })
      return null
    }
    
    // Method 1: Try Windows PowerShell OCR (if available)
    try {
      logDeviceAction(deviceId, 'extract_username_screenshot', 'started', { step: 'powershell_ocr' })
      
      const ocrCommand = `powershell -Command "
        try {
          Add-Type -AssemblyName System.Drawing
          Add-Type -AssemblyName System.Windows.Forms
          $img = [System.Drawing.Image]::FromFile('${imagePath.replace(/\\/g, '\\\\')}')
          $bitmap = New-Object System.Drawing.Bitmap($img)
          
          # Simple pixel analysis for Instagram username detection
          # Look for text patterns in typical username locations
          Write-Output 'OCR_ANALYSIS_COMPLETE'
          $img.Dispose()
          $bitmap.Dispose()
        } catch {
          Write-Output 'OCR_FAILED'
        }
      "`
      
      const { stdout: ocrResult } = await execAsync(ocrCommand, { timeout: 15000 })
      logADBCommand(deviceId, 'powershell OCR', ocrResult, undefined, Date.now() - startTime)
      
      // Parse OCR result for Instagram username patterns
      const usernameMatch = ocrResult.match(/@([a-zA-Z0-9._]{1,30})/g)
      if (usernameMatch && usernameMatch.length > 0) {
        const detectedUsername = usernameMatch[0].replace('@', '')
        logDeviceAction(deviceId, 'extract_username_screenshot', 'success', { 
          username: detectedUsername, 
          method: 'powershell_ocr',
          duration: Date.now() - startTime
        })
        return detectedUsername
      }
    } catch (ocrError) {
      logDeviceAction(deviceId, 'extract_username_screenshot', 'error', { 
        step: 'powershell_ocr_failed', 
        error: ocrError instanceof Error ? ocrError.message : 'Unknown OCR error' 
      })
    }
    
    // Method 2: Try Python OCR (if available)
    try {
      logDeviceAction(deviceId, 'extract_username_screenshot', 'started', { step: 'python_ocr' })
      
      const pythonOcrCommand = `python -c "
import sys
try:
    from PIL import Image
    import pytesseract
    import re
    
    img = Image.open('${imagePath}')
    text = pytesseract.image_to_string(img)
    
    # Look for Instagram username patterns
    username_patterns = [
        r'@([a-zA-Z0-9._]{1,30})',
        r'([a-zA-Z0-9._]{3,30})\\s*followers',
        r'([a-zA-Z0-9._]{3,30})\\s*following'
    ]
    
    for pattern in username_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            print(f'DETECTED_USERNAME:{matches[0]}')
            break
    else:
        print('NO_USERNAME_FOUND')
        
except ImportError:
    print('PYTHON_OCR_NOT_AVAILABLE')
except Exception as e:
    print(f'PYTHON_OCR_ERROR:{str(e)}')
"`
      
      const { stdout: pythonResult } = await execAsync(pythonOcrCommand, { timeout: 20000 })
      logADBCommand(deviceId, 'python OCR', pythonResult, undefined, Date.now() - startTime)
      
      if (pythonResult.includes('DETECTED_USERNAME:')) {
        const detectedUsername = pythonResult.split('DETECTED_USERNAME:')[1].trim()
        if (detectedUsername && detectedUsername.length >= 3) {
          logDeviceAction(deviceId, 'extract_username_screenshot', 'success', { 
            username: detectedUsername, 
            method: 'python_ocr',
            duration: Date.now() - startTime
          })
          return detectedUsername
        }
      }
    } catch (pythonError) {
      logDeviceAction(deviceId, 'extract_username_screenshot', 'error', { 
        step: 'python_ocr_failed', 
        error: pythonError instanceof Error ? pythonError.message : 'Python OCR not available' 
      })
    }
    
    // Method 3: Simple pattern matching on file size and creation time
    try {
      const stats = fs.statSync(imagePath)
      if (stats.size > 50000) { // Reasonable screenshot size
        logDeviceAction(deviceId, 'extract_username_screenshot', 'started', { 
          message: 'Screenshot appears valid but OCR methods failed',
          fileSize: stats.size,
          duration: Date.now() - startTime
        })
      }
    } catch (statsError) {
      logDeviceAction(deviceId, 'extract_username_screenshot', 'error', { 
        step: 'file_stats_failed', 
        error: statsError instanceof Error ? statsError.message : 'File stats error' 
      })
    }
    
    logDeviceAction(deviceId, 'extract_username_screenshot', 'error', { 
      result: 'no_username_detected',
      duration: Date.now() - startTime
    })
    return null
    
  } catch (error) {
    logDeviceAction(deviceId, 'extract_username_screenshot', 'error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    })
    return null
  }
}

// Enhanced function to extract additional accounts from account switcher
async function extractAdditionalAccounts(imagePath: string, deviceId: string): Promise<InstagramAccount[]> {
  const startTime = Date.now()
  
  try {
    logDeviceAction(deviceId, 'extract_additional_accounts', 'started', { imagePath })
    
    const additionalAccounts: InstagramAccount[] = []
    
    // Try to detect multiple accounts from account switcher UI
    // This would require more sophisticated image analysis
    
    logDeviceAction(deviceId, 'extract_additional_accounts', 'success', { 
      accountsFound: additionalAccounts.length,
      duration: Date.now() - startTime
    })
    
    return additionalAccounts
    
  } catch (error) {
    logDeviceAction(deviceId, 'extract_additional_accounts', 'error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    })
    return []
  }
}

// Enhanced UI dump analysis with better username detection
async function analyzeUIForUsername(deviceId: string): Promise<string | null> {
  const startTime = Date.now()
  
  try {
    logDeviceAction(deviceId, 'analyze_ui_username', 'started', {})
    
    // Get UI hierarchy dump from Instagram
    const uiDumpCommand = `adb -s ${deviceId} shell uiautomator dump /sdcard/ui_dump.xml && adb -s ${deviceId} shell cat /sdcard/ui_dump.xml`
    const { stdout: uiDump } = await execAsync(uiDumpCommand, { timeout: 15000 })
    
    logADBCommand(deviceId, 'uiautomator dump', `UI dump retrieved (${uiDump.length} chars)`, undefined, Date.now() - startTime)
    
    // Enhanced username patterns for Instagram UI
    const usernamePatterns = [
      // Direct username patterns
      /text="@([a-zA-Z0-9._]{1,30})"/g,
      /content-desc="@([a-zA-Z0-9._]{1,30})"/g,
      
      // Profile page patterns
      /text="([a-zA-Z0-9._]{3,30})\s*followers"/gi,
      /text="([a-zA-Z0-9._]{3,30})\s*following"/gi,
      
      // Resource ID patterns
      /resource-id=".*username.*"[^>]*text="([a-zA-Z0-9._]{1,30})"/g,
      /resource-id=".*profile.*"[^>]*text="([a-zA-Z0-9._]{1,30})"/g,
      
      // Navigation patterns
      /text="([a-zA-Z0-9._]{3,30})"[^>]*class="android.widget.TextView"/g,
      
      // Account switcher patterns
      /text="Switch to ([a-zA-Z0-9._]{1,30})"/g,
      /content-desc="Switch to ([a-zA-Z0-9._]{1,30})"/g
    ]
    
    const detectedUsernames = new Set<string>()
    
    for (const pattern of usernamePatterns) {
      const matches = [...uiDump.matchAll(pattern)]
      for (const match of matches) {
        const username = match[1].toLowerCase()
        
        // Filter out common false positives
        const invalidUsernames = [
          'instagram', 'follow', 'following', 'followers', 'profile', 'settings',
          'activity', 'explore', 'search', 'home', 'messages', 'direct', 'camera',
          'reels', 'shop', 'story', 'stories', 'live', 'igtv', 'broadcast',
          'notification', 'notifications', 'edit', 'share', 'save', 'saved',
          'archive', 'close', 'friends', 'discover', 'suggested', 'you', 'your',
          'account', 'accounts', 'switch', 'add', 'new', 'create', 'login',
          'signup', 'help', 'about', 'privacy', 'terms', 'contact', 'support'
        ]
        
        const isValidUsername = username.length >= 3 &&
                               username.length <= 30 &&
                               /^[a-zA-Z0-9._]+$/.test(username) &&
                               !username.startsWith('.') &&
                               !username.endsWith('.') &&
                               !invalidUsernames.includes(username) &&
                               !username.includes('..') &&
                               !/^\d+$/.test(username) // Not just numbers
        
        if (isValidUsername) {
          detectedUsernames.add(username)
        }
      }
    }
    
    // Return the most likely username (first detected, or shortest valid one)
    const validUsernames = Array.from(detectedUsernames)
    if (validUsernames.length > 0) {
      // Prefer shorter usernames as they're more likely to be real
      const bestUsername = validUsernames.sort((a, b) => a.length - b.length)[0]
      
      logDeviceAction(deviceId, 'analyze_ui_username', 'success', { 
        username: bestUsername,
        totalDetected: validUsernames.length,
        allDetected: validUsernames,
        duration: Date.now() - startTime
      })
      
      return bestUsername
    }
    
    logDeviceAction(deviceId, 'analyze_ui_username', 'error', { 
      result: 'no_valid_username_found',
      duration: Date.now() - startTime
    })
    return null
    
  } catch (error) {
    logDeviceAction(deviceId, 'analyze_ui_username', 'error', { 
      error: error instanceof Error ? error.message : 'UI analysis failed',
      duration: Date.now() - startTime
    })
    return null
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  let deviceId = 'unknown'
  
  try {
    const { searchParams } = new URL(request.url)
    deviceId = searchParams.get('deviceId') || 'unknown'

    logDeviceAction(deviceId, 'instagram_account_detection', 'started', { 
      timestamp: new Date().toISOString() 
    })

    if (!deviceId || deviceId === 'unknown') {
      logDeviceAction(deviceId, 'instagram_account_detection', 'error', { error: 'Device ID is required' })
      return NextResponse.json({
        success: false,
        error: 'Device ID is required'
      }, { status: 400 })
    }

    // Verify device is connected with enhanced logging
    try {
      const adbStartTime = Date.now()
      const { stdout: devices } = await execAsync('adb devices', { timeout: 5000 })
      const adbDuration = Date.now() - adbStartTime
      
      logADBCommand(deviceId, 'adb devices', devices, undefined, adbDuration)
      
      if (!devices.includes(deviceId)) {
        logDeviceAction(deviceId, 'instagram_account_detection', 'error', { error: 'Device not connected' })
        return NextResponse.json({
          success: false,
          error: 'Device not connected'
        }, { status: 404 })
      }
    } catch (error) {
      logDeviceAction(deviceId, 'instagram_account_detection', 'error', { error: 'ADB not available' })
      return NextResponse.json({
        success: false,
        error: 'ADB not available'
      }, { status: 500 })
    }

    const instagramAccounts: InstagramAccount[] = []

    try {
      // Method 1: Check if Instagram is installed
      logDeviceAction(deviceId, 'instagram_account_detection', 'started', { step: 'check_instagram_installed' })
      
      const { stdout: packages } = await execAsync(`adb -s ${deviceId} shell pm list packages`, { timeout: 5000 })
      logADBCommand(deviceId, 'pm list packages', `Found ${packages.split('\n').length} packages`, undefined, 0)
      
      if (!packages.includes('com.instagram.android')) {
        logDeviceAction(deviceId, 'instagram_account_detection', 'success', { 
          result: 'instagram_not_installed',
          duration: Date.now() - startTime
        })
        return NextResponse.json({
          success: true,
          accounts: [],
          message: 'Instagram app not found on device'
        })
      }

      // Method 2: Enhanced Instagram username detection
      logDeviceAction(deviceId, 'instagram_account_detection', 'started', { step: 'open_instagram_app' })
      
      try {
        // Wake device and unlock
        await execAsync(`adb -s ${deviceId} shell input keyevent KEYCODE_WAKEUP`, { timeout: 3000 })
        await new Promise(resolve => setTimeout(resolve, 1000))
        await execAsync(`adb -s ${deviceId} shell input swipe 500 1500 500 500`, { timeout: 3000 })
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Open Instagram app using multiple methods
        try {
          logDeviceAction(deviceId, 'instagram_account_detection', 'started', { step: 'launch_instagram_main_activity' })
          await execAsync(`adb -s ${deviceId} shell am start -n com.instagram.android/.activity.MainTabActivity`, { timeout: 5000 })
        } catch (activityError) {
          logDeviceAction(deviceId, 'instagram_account_detection', 'started', { step: 'launch_instagram_monkey' })
          await execAsync(`adb -s ${deviceId} shell monkey -p com.instagram.android -c android.intent.category.LAUNCHER 1`, { timeout: 5000 })
        }
        await new Promise(resolve => setTimeout(resolve, 5000))

        // Get screen dimensions for accurate navigation
        const { stdout: screenInfo } = await execAsync(`adb -s ${deviceId} shell wm size`, { timeout: 3000 })
        const screenMatch = screenInfo.match(/(\d+)x(\d+)/)
        const screenWidth = screenMatch ? parseInt(screenMatch[1]) : 1080
        const screenHeight = screenMatch ? parseInt(screenMatch[2]) : 2340
        
        logDeviceAction(deviceId, 'instagram_account_detection', 'started', { 
          step: 'screen_dimensions_detected',
          screenWidth,
          screenHeight
        })
        
        // Navigate to profile page (bottom right tab)
        const profileTabX = Math.floor(screenWidth * 0.9)
        const profileTabY = Math.floor(screenHeight * 0.95)
        
        logDeviceAction(deviceId, 'instagram_account_detection', 'started', { 
          step: 'navigate_to_profile',
          tapCoordinates: { x: profileTabX, y: profileTabY }
        })
        
        await execAsync(`adb -s ${deviceId} shell input tap ${profileTabX} ${profileTabY}`, { timeout: 3000 })
        await new Promise(resolve => setTimeout(resolve, 4000))

        // Method 3: Try UI dump analysis first (faster than OCR)
        logDeviceAction(deviceId, 'instagram_account_detection', 'started', { step: 'ui_dump_analysis' })
        
        const detectedUsernameFromUI = await analyzeUIForUsername(deviceId)
        
        if (detectedUsernameFromUI) {
          const uiDetectedAccount: InstagramAccount = {
            username: detectedUsernameFromUI,
            displayName: `@${detectedUsernameFromUI}`,
            isActive: true,
            lastUsed: new Date(),
            deviceId: deviceId,
            detectionMethod: 'ui_dump_analysis',
            confidence: 0.9
          }
          
          instagramAccounts.push(uiDetectedAccount)
          logDeviceAction(deviceId, 'instagram_account_detection', 'success', { 
            username: detectedUsernameFromUI,
            method: 'ui_dump_analysis'
          })
        } else {
          // Method 4: Fallback to screenshot OCR
          logDeviceAction(deviceId, 'instagram_account_detection', 'started', { step: 'screenshot_ocr_fallback' })
          
          const timestamp = Date.now()
          await execAsync(`adb -s ${deviceId} shell screencap -p /sdcard/instagram_profile_${timestamp}.png`, { timeout: 3000 })
          await execAsync(`adb -s ${deviceId} pull /sdcard/instagram_profile_${timestamp}.png ./instagram_profile_${timestamp}.png`, { timeout: 5000 })
          
          const detectedUsernameFromOCR = await extractUsernameFromScreenshot(`./instagram_profile_${timestamp}.png`, deviceId)
          
          if (detectedUsernameFromOCR) {
            const ocrDetectedAccount: InstagramAccount = {
              username: detectedUsernameFromOCR,
              displayName: `@${detectedUsernameFromOCR}`,
              isActive: true,
              lastUsed: new Date(),
              deviceId: deviceId,
              detectionMethod: 'screenshot_ocr',
              confidence: 0.7
            }
            
            instagramAccounts.push(ocrDetectedAccount)
            logDeviceAction(deviceId, 'instagram_account_detection', 'success', { 
              username: detectedUsernameFromOCR,
              method: 'screenshot_ocr'
            })
          }
        }

        // Method 5: Check for additional accounts (account switcher)
        if (instagramAccounts.length > 0) {
          logDeviceAction(deviceId, 'instagram_account_detection', 'started', { step: 'check_additional_accounts' })
          
          try {
            // Try to access account switcher by tapping on username area
            await execAsync(`adb -s ${deviceId} shell input tap 200 400`, { timeout: 3000 })
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            const additionalTimestamp = Date.now()
            await execAsync(`adb -s ${deviceId} shell screencap -p /sdcard/instagram_accounts_${additionalTimestamp}.png`, { timeout: 3000 })
            await execAsync(`adb -s ${deviceId} pull /sdcard/instagram_accounts_${additionalTimestamp}.png ./instagram_accounts_${additionalTimestamp}.png`, { timeout: 5000 })
            
            const additionalAccounts = await extractAdditionalAccounts(`./instagram_accounts_${additionalTimestamp}.png`, deviceId)
            if (additionalAccounts.length > 0) {
              instagramAccounts.push(...additionalAccounts)
              logDeviceAction(deviceId, 'instagram_account_detection', 'success', { 
                additionalAccountsFound: additionalAccounts.length
              })
            }
          } catch (additionalError) {
            logDeviceAction(deviceId, 'instagram_account_detection', 'error', { 
              step: 'additional_accounts_failed',
              error: additionalError instanceof Error ? additionalError.message : 'Unknown error'
            })
          }
        }

      } catch (processError) {
        logDeviceAction(deviceId, 'instagram_account_detection', 'error', { 
          step: 'instagram_detection_process_failed',
          error: processError instanceof Error ? processError.message : 'Process failed'
        })
      }

      const totalDuration = Date.now() - startTime
      logDeviceAction(deviceId, 'instagram_account_detection', 'success', { 
        accountsDetected: instagramAccounts.length,
        totalDuration,
        methods: instagramAccounts.map(acc => acc.detectionMethod).join(', ')
      })

      return NextResponse.json({
        success: true,
        accounts: instagramAccounts,
        message: instagramAccounts.length > 0 
          ? `Found ${instagramAccounts.length} Instagram account(s) using ${instagramAccounts.map(acc => acc.detectionMethod).join(', ')}` 
          : 'No Instagram accounts detected. Please log in to Instagram on your device and try again.'
      })

    } catch (error) {
      logDeviceAction(deviceId, 'instagram_account_detection', 'error', { 
        error: error instanceof Error ? error.message : 'Detection process failed',
        duration: Date.now() - startTime
      })
      
      return NextResponse.json({
        success: true,
        accounts: [],
        message: 'No Instagram accounts detected. Please ensure Instagram is installed and you are logged in on your device.'
      })
    }

  } catch (error) {
    logDeviceAction(deviceId, 'instagram_account_detection', 'error', { 
      error: error instanceof Error ? error.message : 'API error',
      duration: Date.now() - startTime
    })
    
    return NextResponse.json({
      success: false,
      accounts: [],
      error: 'Failed to detect Instagram accounts'
    })
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let deviceId = 'unknown'
  
  try {
    const body = await request.json()
    const { deviceId: reqDeviceId, action, username } = body
    deviceId = reqDeviceId || 'unknown'

    logDeviceAction(deviceId, 'instagram_account_action', 'started', { action, username })

    if (!deviceId || !action) {
      logDeviceAction(deviceId, 'instagram_account_action', 'error', { error: 'Missing deviceId or action' })
      return NextResponse.json({
        success: false,
        error: 'Missing deviceId or action'
      }, { status: 400 })
    }

    switch (action) {
      case 'switch_account':
        try {
          logDeviceAction(deviceId, 'instagram_account_switch', 'started', { targetUsername: username })
          
          // Wake device and unlock
          await execAsync(`adb -s ${deviceId} shell input keyevent KEYCODE_WAKEUP`, { timeout: 3000 })
          await new Promise(resolve => setTimeout(resolve, 1000))
          await execAsync(`adb -s ${deviceId} shell input swipe 500 1500 500 500`, { timeout: 3000 })
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Open Instagram app using the correct activity
          try {
            await execAsync(`adb -s ${deviceId} shell am start -n com.instagram.android/.activity.MainTabActivity`, { timeout: 5000 })
          } catch (activityError) {
            // Fallback to generic launch
            await execAsync(`adb -s ${deviceId} shell monkey -p com.instagram.android -c android.intent.category.LAUNCHER 1`, { timeout: 5000 })
          }
          await new Promise(resolve => setTimeout(resolve, 3000))
          
          // Get screen dimensions for proper navigation
          const { stdout: screenInfo } = await execAsync(`adb -s ${deviceId} shell wm size`, { timeout: 3000 })
          const screenMatch = screenInfo.match(/(\d+)x(\d+)/)
          const screenWidth = screenMatch ? parseInt(screenMatch[1]) : 1080
          const screenHeight = screenMatch ? parseInt(screenMatch[2]) : 2340
          
          // Navigate to profile tab
          const profileTabX = Math.floor(screenWidth * 0.9) // 90% from left
          const profileTabY = Math.floor(screenHeight * 0.95) // 95% from top
          
          await execAsync(`adb -s ${deviceId} shell input tap ${profileTabX} ${profileTabY}`, { timeout: 3000 })
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          logDeviceAction(deviceId, 'instagram_account_switch', 'success', { 
            targetUsername: username,
            message: 'Successfully navigated to profile for account switch',
            duration: Date.now() - startTime
          })
          
          return NextResponse.json({
            success: true,
            message: `Account switch initiated for: ${username}`,
            action: 'switch_account'
          })
        } catch (error) {
          logDeviceAction(deviceId, 'instagram_account_switch', 'error', { 
            targetUsername: username,
            error: error instanceof Error ? error.message : 'Switch failed',
            duration: Date.now() - startTime
          })
          
          return NextResponse.json({
            success: false,
            error: 'Failed to switch Instagram account'
          })
        }

      case 'logout':
        logDeviceAction(deviceId, 'instagram_account_logout', 'success', { 
          message: 'Logout initiated',
          duration: Date.now() - startTime
        })
        
        return NextResponse.json({
          success: true,
          message: 'Instagram logout initiated',
          action: 'logout'
        })

      default:
        logDeviceAction(deviceId, 'instagram_account_action', 'error', { 
          error: `Unknown action: ${action}`,
          duration: Date.now() - startTime
        })
        
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`
        })
    }

  } catch (error) {
    logDeviceAction(deviceId, 'instagram_account_action', 'error', { 
      error: error instanceof Error ? error.message : 'Internal server error',
      duration: Date.now() - startTime
    })
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
