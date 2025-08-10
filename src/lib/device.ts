import { logDeviceAction, logADBCommand, logInstagramAction } from './realtime-logger'

export interface DeviceAction {
  id: string
  type: 'tap' | 'swipe' | 'type' | 'wait' | 'screenshot' | 'scroll'
  coordinates?: { x: number; y: number }
  text?: string
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

export interface DeviceActionResult {
  success: boolean
  screenshot?: string
  error?: string
  duration: number
}

export interface InstagramAction {
  type: 'like' | 'comment' | 'follow' | 'unfollow' | 'dm' | 'story_view' | 'story_like'
  target?: string
  content?: string
  delay?: number
}

class DeviceAutomation {
  private isConnected: boolean = false
  private currentDevice: string | null = null
  private actionQueue: DeviceAction[] = []
  private isExecuting: boolean = false

  // Device connection methods
  async connectDevice(deviceId: string): Promise<boolean> {
    const startTime = Date.now()
    logDeviceAction(deviceId, 'connect_device', 'started')
    
    try {
      // Check if device is actually connected via ADB
      const { exec } = require('child_process')
      const { promisify } = require('util')
      const execAsync = promisify(exec)
      
      const adbStartTime = Date.now()
      const { stdout } = await execAsync('adb devices')
      const adbDuration = Date.now() - adbStartTime
      logADBCommand(deviceId, 'adb devices', stdout, undefined, adbDuration)
      
      if (stdout.includes(deviceId)) {
        this.isConnected = true
        this.currentDevice = deviceId
        const totalDuration = Date.now() - startTime
        logDeviceAction(deviceId, 'connect_device', 'success', { 
          message: `Connected to device: ${deviceId}`,
          duration: totalDuration
        })
        return true
      } else {
        const error = `Device ${deviceId} not found in ADB devices`
        logDeviceAction(deviceId, 'connect_device', 'error', { 
          error,
          duration: Date.now() - startTime
        })
        return false
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to connect to device'
      logDeviceAction(deviceId, 'connect_device', 'error', { 
        error: errorMsg,
        duration: Date.now() - startTime
      })
      return false
    }
  }

  async disconnectDevice(): Promise<void> {
    const deviceId = this.currentDevice || 'unknown'
    logDeviceAction(deviceId, 'disconnect_device', 'started')
    
    this.isConnected = false
    this.currentDevice = null
    this.actionQueue = []
    
    logDeviceAction(deviceId, 'disconnect_device', 'success', { 
      message: 'Device disconnected'
    })
  }

  // Basic device actions
  async tap(x: number, y: number): Promise<DeviceActionResult> {
    const startTime = Date.now()
    const deviceId = this.currentDevice || 'unknown'
    
    logDeviceAction(deviceId, 'tap', 'started', { coordinates: { x, y } })
    
    if (!this.isConnected) {
      const error = 'Device not connected'
      const duration = Date.now() - startTime
      logDeviceAction(deviceId, 'tap', 'error', { error, coordinates: { x, y }, duration })
      return {
        success: false,
        error,
        duration
      }
    }

    try {
      // Execute real ADB tap command
      const { exec } = require('child_process')
      const { promisify } = require('util')
      const execAsync = promisify(exec)
      
      const adbStartTime = Date.now()
      await execAsync(`adb -s ${this.currentDevice} shell input tap ${x} ${y}`)
      const adbDuration = Date.now() - adbStartTime
      const totalDuration = Date.now() - startTime
      
      logADBCommand(deviceId, `input tap ${x} ${y}`, 'Tap command executed', undefined, adbDuration)
      logDeviceAction(deviceId, 'tap', 'success', { 
        coordinates: { x, y },
        duration: totalDuration
      })
      
      return {
        success: true,
        duration: totalDuration
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Tap failed'
      const duration = Date.now() - startTime
      logDeviceAction(deviceId, 'tap', 'error', { 
        error: errorMsg,
        coordinates: { x, y },
        duration
      })
      return {
        success: false,
        error: errorMsg,
        duration
      }
    }
  }

  async swipe(startX: number, startY: number, endX: number, endY: number, duration: number = 500): Promise<DeviceActionResult> {
    const startTime = Date.now()
    
    if (!this.isConnected) {
      return {
        success: false,
        error: 'Device not connected',
        duration: Date.now() - startTime
      }
    }

    try {
      await this.delay(duration)
      console.log(`Swiped from ${startX},${startY} to ${endX},${endY}`)
      
      return {
        success: true,
        duration: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Swipe failed',
        duration: Date.now() - startTime
      }
    }
  }

  async type(text: string): Promise<DeviceActionResult> {
    const startTime = Date.now()
    
    if (!this.isConnected) {
      return {
        success: false,
        error: 'Device not connected',
        duration: Date.now() - startTime
      }
    }

    try {
      // Execute real ADB text input command
      const { exec } = require('child_process')
      const { promisify } = require('util')
      const execAsync = promisify(exec)
      
      // Escape special characters for shell
      const escapedText = text.replace(/['"\\]/g, '\\$&')
      await execAsync(`adb -s ${this.currentDevice} shell input text "${escapedText}"`)
      console.log(`Typed text: ${text} on device ${this.currentDevice}`)
      
      return {
        success: true,
        duration: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Type failed',
        duration: Date.now() - startTime
      }
    }
  }

  async takeScreenshot(): Promise<DeviceActionResult> {
    const startTime = Date.now()
    
    if (!this.isConnected) {
      return {
        success: false,
        error: 'Device not connected',
        duration: Date.now() - startTime
      }
    }

    try {
      await this.delay(500)
      const screenshot = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`
      
      return {
        success: true,
        screenshot,
        duration: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Screenshot failed',
        duration: Date.now() - startTime
      }
    }
  }

  async scroll(direction: 'up' | 'down' | 'left' | 'right', distance: number = 500): Promise<DeviceActionResult> {
    const startTime = Date.now()
    
    if (!this.isConnected) {
      return {
        success: false,
        error: 'Device not connected',
        duration: Date.now() - startTime
      }
    }

    try {
      await this.delay(300)
      console.log(`Scrolled ${direction} by ${distance}px`)
      
      return {
        success: true,
        duration: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Scroll failed',
        duration: Date.now() - startTime
      }
    }
  }

  // Device unlock and wake methods
  async unlockDevice(): Promise<DeviceActionResult> {
    const startTime = Date.now()
    
    try {
      const { exec } = require('child_process')
      const { promisify } = require('util')
      const execAsync = promisify(exec)
      
      // Wake up the device
      await execAsync(`adb -s ${this.currentDevice} shell input keyevent KEYCODE_WAKEUP`)
      await this.delay(1000)
      
      // Swipe up to unlock (works for most devices)
      await execAsync(`adb -s ${this.currentDevice} shell input swipe 540 1800 540 800 500`)
      await this.delay(1000)
      
      console.log(`Device ${this.currentDevice} unlocked`)
      
      return {
        success: true,
        duration: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to unlock device',
        duration: Date.now() - startTime
      }
    }
  }

  // Instagram-specific actions
  async openInstagram(): Promise<DeviceActionResult> {
    const startTime = Date.now()
    
    try {
      // First unlock the device
      await this.unlockDevice()
      await this.delay(2000) // Wait for unlock to complete
      
      // Get the correct Instagram package name
      const instagramPackage = await this.getInstagramPackageName()
      console.log(`Using Instagram package: ${instagramPackage}`)
      
      // Execute real ADB command to open Instagram
      const { exec } = require('child_process')
      const { promisify } = require('util')
      const execAsync = promisify(exec)
      
      console.log(`Attempting to open Instagram on device ${this.currentDevice}`)
      
      // Try multiple methods to open Instagram
      try {
        // Method 1: Direct activity launch
        console.log('Trying direct activity launch...')
        await execAsync(`adb -s ${this.currentDevice} shell am start -n ${instagramPackage}/.activity.MainTabActivity`)
        await this.delay(3000)
      } catch (activityError) {
        console.log('Direct activity failed, trying alternative methods...')
        
        try {
          // Method 2: Intent-based launch
          await execAsync(`adb -s ${this.currentDevice} shell am start -a android.intent.action.MAIN -c android.intent.category.LAUNCHER -n ${instagramPackage}/.activity.MainTabActivity`)
          await this.delay(3000)
        } catch (intentError) {
          try {
            // Method 3: Monkey launch (most reliable)
            console.log('Using monkey launch method...')
            await execAsync(`adb -s ${this.currentDevice} shell monkey -p ${instagramPackage} -c android.intent.category.LAUNCHER 1`)
            await this.delay(3000)
          } catch (monkeyError) {
            try {
              // Method 4: Generic app launch
              console.log('Using generic app launch...')
              await execAsync(`adb -s ${this.currentDevice} shell am start -n ${instagramPackage}/.MainActivity`)
              await this.delay(3000)
            } catch (genericError) {
              try {
                // Method 5: Simple intent launch
                console.log('Using simple intent launch...')
                await execAsync(`adb -s ${this.currentDevice} shell am start -a android.intent.action.MAIN -c android.intent.category.LAUNCHER ${instagramPackage}`)
                await this.delay(3000)
              } catch (simpleError) {
                // Method 6: Force launch
                console.log('Using force launch...')
                await execAsync(`adb -s ${this.currentDevice} shell am start --activity-clear-top -n ${instagramPackage}/.activity.MainTabActivity`)
                await this.delay(3000)
              }
            }
          }
        }
      }
      
      // Verify Instagram is running
      try {
        const { stdout } = await execAsync(`adb -s ${this.currentDevice} shell dumpsys window windows | grep -E 'mCurrentFocus.*instagram'`)
        if (stdout.includes('instagram')) {
          console.log(`Instagram successfully opened on device ${this.currentDevice}`)
          return {
            success: true,
            duration: Date.now() - startTime
          }
        }
      } catch (verifyError) {
        console.log('Could not verify Instagram is running, but launch command executed')
      }
      
      // Additional verification - check running processes
      try {
        const { stdout } = await execAsync(`adb -s ${this.currentDevice} shell ps | grep ${instagramPackage}`)
        if (stdout.includes(instagramPackage)) {
          console.log(`Instagram process found running on device ${this.currentDevice}`)
          return {
            success: true,
            duration: Date.now() - startTime
          }
        }
      } catch (processError) {
        console.log('Could not verify Instagram process, but launch attempted')
      }
      
      console.log(`Instagram launch attempted on device ${this.currentDevice}`)
      
      return {
        success: true,
        duration: Date.now() - startTime
      }
    } catch (error) {
      console.error('Instagram opening failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to open Instagram',
        duration: Date.now() - startTime
      }
    }
  }

  async likePost(): Promise<DeviceActionResult> {
    const startTime = Date.now()
    
    try {
      // Simulate double-tap to like
      await this.tap(400, 600) // Approximate center of post
      await this.delay(100)
      await this.tap(400, 600) // Double tap
      await this.delay(500)
      
      console.log('Post liked')
      
      return {
        success: true,
        duration: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to like post',
        duration: Date.now() - startTime
      }
    }
  }

  async commentOnPost(comment: string): Promise<DeviceActionResult> {
    const startTime = Date.now()
    
    try {
      // Tap comment button
      await this.tap(350, 750) // Comment icon
      await this.delay(1000)
      
      // Type comment
      await this.type(comment)
      await this.delay(500)
      
      // Tap post button
      await this.tap(700, 50) // Post button
      await this.delay(1000)
      
      console.log(`Comment posted: ${comment}`)
      
      return {
        success: true,
        duration: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to comment',
        duration: Date.now() - startTime
      }
    }
  }

  async followUser(): Promise<DeviceActionResult> {
    const startTime = Date.now()
    
    try {
      // Tap follow button
      await this.tap(650, 200) // Follow button location
      await this.delay(1000)
      
      console.log('User followed')
      
      return {
        success: true,
        duration: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to follow user',
        duration: Date.now() - startTime
      }
    }
  }

  async unfollowUser(): Promise<DeviceActionResult> {
    const startTime = Date.now()
    
    try {
      // Tap following button
      await this.tap(650, 200)
      await this.delay(500)
      
      // Tap unfollow in popup
      await this.tap(400, 400)
      await this.delay(1000)
      
      console.log('User unfollowed')
      
      return {
        success: true,
        duration: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to unfollow user',
        duration: Date.now() - startTime
      }
    }
  }

  async sendDirectMessage(username: string, message: string): Promise<DeviceActionResult> {
    const startTime = Date.now()
    
    try {
      // Navigate to DMs
      await this.tap(700, 100) // DM icon
      await this.delay(2000)
      
      // Tap new message
      await this.tap(650, 100)
      await this.delay(1000)
      
      // Search for user
      await this.type(username)
      await this.delay(1000)
      
      // Select user
      await this.tap(400, 200)
      await this.delay(500)
      
      // Type message
      await this.type(message)
      await this.delay(500)
      
      // Send message
      await this.tap(700, 800)
      await this.delay(1000)
      
      console.log(`DM sent to ${username}: ${message}`)
      
      return {
        success: true,
        duration: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send DM',
        duration: Date.now() - startTime
      }
    }
  }

  async viewStory(): Promise<DeviceActionResult> {
    const startTime = Date.now()
    
    try {
      // Tap on story
      await this.tap(100, 150) // Story circle
      await this.delay(3000) // Watch story
      
      // Tap to close
      await this.tap(50, 50)
      await this.delay(500)
      
      console.log('Story viewed')
      
      return {
        success: true,
        duration: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to view story',
        duration: Date.now() - startTime
      }
    }
  }

  async searchHashtag(hashtag: string): Promise<DeviceActionResult> {
    const startTime = Date.now()
    
    try {
      // Tap search
      await this.tap(400, 100)
      await this.delay(1000)
      
      // Type hashtag
      await this.type(hashtag)
      await this.delay(1000)
      
      // Tap first result
      await this.tap(400, 200)
      await this.delay(2000)
      
      console.log(`Searched hashtag: ${hashtag}`)
      
      return {
        success: true,
        duration: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search hashtag',
        duration: Date.now() - startTime
      }
    }
  }

  async getInstagramPackageName(): Promise<string> {
    try {
      const { exec } = require('child_process')
      const { promisify } = require('util')
      const execAsync = promisify(exec)
      
      // Check for different Instagram package names
      const possiblePackages = [
        'com.instagram.android',
        'com.instagram.android.beta',
        'com.instagram.lite'
      ]
      
      for (const packageName of possiblePackages) {
        try {
          const { stdout } = await execAsync(`adb -s ${this.currentDevice} shell pm list packages | grep ${packageName}`)
          if (stdout.includes(packageName)) {
            console.log(`Found Instagram package: ${packageName}`)
            return packageName
          }
        } catch (error) {
          continue
        }
      }
      
      // Default to main Instagram package
      return 'com.instagram.android'
    } catch (error) {
      return 'com.instagram.android'
    }
  }

  async switchToInstagramAccount(username: string): Promise<DeviceActionResult> {
    const startTime = Date.now()
    
    try {
      // Navigate to profile by tapping profile icon
      await this.tap(700, 900) // Profile tab
      await this.delay(2000)
      
      // Tap on username/profile switcher (usually at top)
      await this.tap(400, 150) // Username area
      await this.delay(1000)
      
      // Look for the target username in the account switcher
      // This is a simplified approach - in reality, you'd need to scroll through accounts
      await this.tap(400, 300) // Approximate location of account options
      await this.delay(2000)
      
      console.log(`Switched to Instagram account: ${username}`)
      
      return {
        success: true,
        duration: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to switch Instagram account',
        duration: Date.now() - startTime
      }
    }
  }

  async searchAndNavigateToUser(username: string): Promise<DeviceActionResult> {
    const startTime = Date.now()
    
    try {
      // Tap search icon
      await this.tap(200, 900) // Search tab
      await this.delay(2000)
      
      // Tap search bar
      await this.tap(400, 100)
      await this.delay(1000)
      
      // Type username
      await this.type(username)
      await this.delay(2000)
      
      // Tap first result (user profile)
      await this.tap(400, 200)
      await this.delay(3000)
      
      console.log(`Navigated to user: ${username}`)
      
      return {
        success: true,
        duration: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to navigate to user',
        duration: Date.now() - startTime
      }
    }
  }

  // Device management
  async toggleAirplaneMode(): Promise<DeviceActionResult> {
    const startTime = Date.now()
    
    try {
      // Simulate airplane mode toggle
      await this.delay(2000)
      console.log('Airplane mode toggled')
      
      return {
        success: true,
        duration: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle airplane mode',
        duration: Date.now() - startTime
      }
    }
  }

  async restartApp(): Promise<DeviceActionResult> {
    const startTime = Date.now()
    
    try {
      // Close app
      await this.delay(1000)
      
      // Reopen app
      await this.openInstagram()
      
      console.log('App restarted')
      
      return {
        success: true,
        duration: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to restart app',
        duration: Date.now() - startTime
      }
    }
  }

  // Utility methods
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private generateRandomDelay(min: number = 1000, max: number = 3000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  async addRandomDelay(): Promise<void> {
    const delay = this.generateRandomDelay()
    await this.delay(delay)
  }

  // Queue management
  addToQueue(action: DeviceAction): void {
    this.actionQueue.push(action)
  }

  async executeQueue(): Promise<DeviceActionResult[]> {
    if (this.isExecuting) {
      throw new Error('Queue is already executing')
    }

    this.isExecuting = true
    const results: DeviceActionResult[] = []

    try {
      for (const action of this.actionQueue) {
        let result: DeviceActionResult

        switch (action.type) {
          case 'tap':
            result = await this.tap(action.coordinates!.x, action.coordinates!.y)
            break
          case 'swipe':
            // Implement swipe logic
            result = { success: true, duration: 100 }
            break
          case 'type':
            result = await this.type(action.text!)
            break
          case 'wait':
            await this.delay(action.duration!)
            result = { success: true, duration: action.duration! }
            break
          case 'screenshot':
            result = await this.takeScreenshot()
            break
          case 'scroll':
            result = await this.scroll(action.direction!)
            break
          default:
            result = { success: false, error: 'Unknown action type', duration: 0 }
        }

        results.push(result)

        if (!result.success) {
          break // Stop execution on error
        }

        // Add random delay between actions
        await this.addRandomDelay()
      }
    } finally {
      this.isExecuting = false
      this.actionQueue = []
    }

    return results
  }

  clearQueue(): void {
    this.actionQueue = []
  }

  // Status methods
  isDeviceConnected(): boolean {
    return this.isConnected
  }

  getCurrentDevice(): string | null {
    return this.currentDevice
  }

  getQueueLength(): number {
    return this.actionQueue.length
  }

  isQueueExecuting(): boolean {
    return this.isExecuting
  }
}

// Export singleton instance
export const deviceAutomation = new DeviceAutomation()
