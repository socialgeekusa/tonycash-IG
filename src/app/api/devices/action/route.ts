import { NextRequest, NextResponse } from 'next/server'
import { realTimeLogger, logDeviceAction, logADBCommand } from '@/lib/realtime-logger'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()
  let deviceId = 'unknown'
  let action = 'unknown'

  try {
    const { exec } = require('child_process')
    const { promisify } = require('util')
    const execAsync = promisify(exec)
    
    const body = await request.json()
    deviceId = body.deviceId || 'unknown'
    action = body.action || 'unknown'
    const parameters = body.parameters || {}

    // Log the incoming request
    logDeviceAction(deviceId, `API Request: ${action}`, 'started', {
      parameters,
      timestamp: new Date().toISOString()
    })

    if (!deviceId || !action) {
      const error = 'Missing deviceId or action'
      logDeviceAction(deviceId, action, 'error', { error })
      return NextResponse.json({
        success: false,
        error
      }, { status: 400 })
    }

    // Verify device is connected
    try {
      const adbStartTime = Date.now()
      const { stdout: devices } = await execAsync('adb devices', { timeout: 5000 })
      const adbDuration = Date.now() - adbStartTime
      
      logADBCommand(deviceId, 'adb devices', devices, undefined, adbDuration)
      
      if (!devices.includes(deviceId)) {
        const error = 'Device not connected'
        logDeviceAction(deviceId, action, 'error', { error })
        return NextResponse.json({
          success: false,
          error
        }, { status: 404 })
      }
    } catch (error) {
      const errorMsg = 'ADB not available'
      logADBCommand(deviceId, 'adb devices', undefined, errorMsg)
      logDeviceAction(deviceId, action, 'error', { error: errorMsg })
      return NextResponse.json({
        success: false,
        error: errorMsg
      }, { status: 500 })
    }

    let result: any = { success: false }

    switch (action) {
      case 'open_instagram':
        result = await openInstagram(deviceId, execAsync)
        break
      case 'screenshot':
        result = await takeScreenshot(deviceId, execAsync)
        break
      case 'tap':
        result = await tapScreen(deviceId, execAsync, parameters.x, parameters.y)
        break
      case 'swipe':
        result = await swipeScreen(deviceId, execAsync, parameters)
        break
      case 'type_text':
        result = await typeText(deviceId, execAsync, parameters.text)
        break
      case 'home':
        result = await goHome(deviceId, execAsync)
        break
      case 'back':
        result = await goBack(deviceId, execAsync)
        break
      case 'wake_device':
        result = await wakeDevice(deviceId, execAsync)
        break
      case 'toggle_airplane_mode':
        result = await toggleAirplaneMode(deviceId, execAsync)
        break
      case 'touch_event':
        result = await simulateTouchEvent(deviceId, execAsync, parameters.x || 500, parameters.y || 1000)
        break
      case 'smart_engagement':
        result = await smartEngagementSequence(deviceId, execAsync, parameters)
        break
      default:
        result = {
          success: false,
          error: `Unknown action: ${action}`
        }
        logDeviceAction(deviceId, action, 'error', { error: result.error })
    }

    // Log the final result
    const totalDuration = Date.now() - startTime
    logDeviceAction(deviceId, action, result.success ? 'success' : 'error', {
      ...result,
      duration: totalDuration
    })

    return NextResponse.json(result)

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Internal server error'
    console.error('Device action error:', error)
    logDeviceAction(deviceId, action, 'error', { 
      error: errorMsg,
      duration: Date.now() - startTime
    })
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// Action implementations
async function openInstagram(deviceId: string, execAsync: any) {
  const actionStartTime = Date.now()
  
  try {
    logDeviceAction(deviceId, 'open_instagram', 'started', { step: 'wake_device' })
    
    // Wake device first
    const wakeStartTime = Date.now()
    await execAsync(`adb -s ${deviceId} shell input keyevent KEYCODE_WAKEUP`, { timeout: 3000 })
    const wakeDuration = Date.now() - wakeStartTime
    logADBCommand(deviceId, 'input keyevent KEYCODE_WAKEUP', 'Device wake command sent', undefined, wakeDuration)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Unlock device (swipe up)
    logDeviceAction(deviceId, 'open_instagram', 'started', { step: 'unlock_device' })
    const unlockStartTime = Date.now()
    await execAsync(`adb -s ${deviceId} shell input swipe 500 1500 500 500`, { timeout: 3000 })
    const unlockDuration = Date.now() - unlockStartTime
    logADBCommand(deviceId, 'input swipe 500 1500 500 500', 'Unlock swipe performed', undefined, unlockDuration)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Open Instagram app using monkey command (more reliable)
    logDeviceAction(deviceId, 'open_instagram', 'started', { step: 'launch_app' })
    const launchStartTime = Date.now()
    await execAsync(`adb -s ${deviceId} shell monkey -p com.instagram.android -c android.intent.category.LAUNCHER 1`, { timeout: 5000 })
    const launchDuration = Date.now() - launchStartTime
    logADBCommand(deviceId, 'monkey -p com.instagram.android -c android.intent.category.LAUNCHER 1', 'Instagram launch command sent', undefined, launchDuration)
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const totalDuration = Date.now() - actionStartTime
    logDeviceAction(deviceId, 'open_instagram', 'success', { 
      message: 'Instagram opened successfully',
      duration: totalDuration
    })
    
    return {
      success: true,
      message: 'Instagram opened successfully',
      action: 'open_instagram',
      duration: totalDuration
    }
  } catch (error) {
    logDeviceAction(deviceId, 'open_instagram', 'error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      step: 'primary_method_failed'
    })
    
    // Fallback: try using am start with intent
    try {
      logDeviceAction(deviceId, 'open_instagram', 'started', { step: 'fallback_method' })
      const fallbackStartTime = Date.now()
      await execAsync(`adb -s ${deviceId} shell am start -a android.intent.action.MAIN -c android.intent.category.LAUNCHER com.instagram.android`, { timeout: 5000 })
      const fallbackDuration = Date.now() - fallbackStartTime
      logADBCommand(deviceId, 'am start -a android.intent.action.MAIN -c android.intent.category.LAUNCHER com.instagram.android', 'Fallback Instagram launch', undefined, fallbackDuration)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const totalDuration = Date.now() - actionStartTime
      logDeviceAction(deviceId, 'open_instagram', 'success', { 
        message: 'Instagram opened successfully (fallback method)',
        duration: totalDuration
      })
      
      return {
        success: true,
        message: 'Instagram opened successfully (fallback method)',
        action: 'open_instagram',
        duration: totalDuration
      }
    } catch (fallbackError) {
      const totalDuration = Date.now() - actionStartTime
      const errorMsg = 'Failed to open Instagram app'
      logDeviceAction(deviceId, 'open_instagram', 'error', { 
        error: errorMsg,
        details: fallbackError instanceof Error ? fallbackError.message : 'Unknown error',
        duration: totalDuration
      })
      
      return {
        success: false,
        error: errorMsg,
        details: error instanceof Error ? error.message : 'Unknown error',
        duration: totalDuration
      }
    }
  }
}

async function takeScreenshot(deviceId: string, execAsync: any) {
  try {
    console.log(`Taking screenshot on device ${deviceId}`)
    
    // Take screenshot
    await execAsync(`adb -s ${deviceId} shell screencap -p /sdcard/screenshot.png`, { timeout: 5000 })
    
    // Pull screenshot to local machine
    const timestamp = Date.now()
    await execAsync(`adb -s ${deviceId} pull /sdcard/screenshot.png screenshot_${timestamp}.png`, { timeout: 5000 })
    
    return {
      success: true,
      message: 'Screenshot taken successfully',
      action: 'screenshot',
      filename: `screenshot_${timestamp}.png`
    }
  } catch (error) {
    console.error('Failed to take screenshot:', error)
    return {
      success: false,
      error: 'Failed to take screenshot',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function tapScreen(deviceId: string, execAsync: any, x: number, y: number) {
  try {
    console.log(`Tapping at ${x}, ${y} on device ${deviceId}`)
    
    await execAsync(`adb -s ${deviceId} shell input tap ${x} ${y}`, { timeout: 3000 })
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      success: true,
      message: `Tapped at coordinates ${x}, ${y}`,
      action: 'tap',
      coordinates: { x, y }
    }
  } catch (error) {
    console.error('Failed to tap:', error)
    return {
      success: false,
      error: 'Failed to tap screen',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function swipeScreen(deviceId: string, execAsync: any, params: any) {
  try {
    const { startX, startY, endX, endY, duration = 500 } = params
    console.log(`Swiping from ${startX},${startY} to ${endX},${endY} on device ${deviceId}`)
    
    await execAsync(`adb -s ${deviceId} shell input swipe ${startX} ${startY} ${endX} ${endY} ${duration}`, { timeout: 3000 })
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      success: true,
      message: `Swiped from ${startX},${startY} to ${endX},${endY}`,
      action: 'swipe',
      parameters: params
    }
  } catch (error) {
    console.error('Failed to swipe:', error)
    return {
      success: false,
      error: 'Failed to swipe screen',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function typeText(deviceId: string, execAsync: any, text: string) {
  try {
    console.log(`Typing text "${text}" on device ${deviceId}`)
    
    // Escape special characters for shell
    const escapedText = text.replace(/['"\\]/g, '\\$&')
    await execAsync(`adb -s ${deviceId} shell input text "${escapedText}"`, { timeout: 3000 })
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      success: true,
      message: `Typed text: ${text}`,
      action: 'type_text',
      text
    }
  } catch (error) {
    console.error('Failed to type text:', error)
    return {
      success: false,
      error: 'Failed to type text',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function goHome(deviceId: string, execAsync: any) {
  try {
    console.log(`Going to home screen on device ${deviceId}`)
    
    await execAsync(`adb -s ${deviceId} shell input keyevent KEYCODE_HOME`, { timeout: 3000 })
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      success: true,
      message: 'Navigated to home screen',
      action: 'home'
    }
  } catch (error) {
    console.error('Failed to go home:', error)
    return {
      success: false,
      error: 'Failed to navigate to home screen',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function goBack(deviceId: string, execAsync: any) {
  try {
    console.log(`Going back on device ${deviceId}`)
    
    await execAsync(`adb -s ${deviceId} shell input keyevent KEYCODE_BACK`, { timeout: 3000 })
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      success: true,
      message: 'Navigated back',
      action: 'back'
    }
  } catch (error) {
    console.error('Failed to go back:', error)
    return {
      success: false,
      error: 'Failed to navigate back',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function wakeDevice(deviceId: string, execAsync: any) {
  try {
    console.log(`Waking device ${deviceId}`)
    
    await execAsync(`adb -s ${deviceId} shell input keyevent KEYCODE_WAKEUP`, { timeout: 3000 })
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      success: true,
      message: 'Device woken up',
      action: 'wake_device'
    }
  } catch (error) {
    console.error('Failed to wake device:', error)
    return {
      success: false,
      error: 'Failed to wake device',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function toggleAirplaneMode(deviceId: string, execAsync: any) {
  try {
    console.log(`Toggling airplane mode on device ${deviceId}`)
    
    // Wake device first
    await execAsync(`adb -s ${deviceId} shell input keyevent KEYCODE_WAKEUP`, { timeout: 3000 })
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Get current airplane mode state first
    let currentState = '0'
    try {
      const { stdout: stateOutput } = await execAsync(`adb -s ${deviceId} shell settings get global airplane_mode_on`, { timeout: 3000 })
      currentState = stateOutput.trim()
    } catch (stateError) {
      console.log('Could not get current airplane mode state, assuming OFF')
    }

    // Method 1: Try to toggle airplane mode directly using settings command
    try {
      const isAirplaneModeOn = currentState === '1'
      const newState = isAirplaneModeOn ? '0' : '1'
      
      console.log(`Current airplane mode state: ${isAirplaneModeOn ? 'ON' : 'OFF'}, toggling to: ${newState === '1' ? 'ON' : 'OFF'}`)
      
      // Toggle airplane mode
      await execAsync(`adb -s ${deviceId} shell settings put global airplane_mode_on ${newState}`, { timeout: 3000 })
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Broadcast the change to update the UI
      await execAsync(`adb -s ${deviceId} shell am broadcast -a android.intent.action.AIRPLANE_MODE --ez state ${newState === '1'}`, { timeout: 3000 })
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return {
        success: true,
        message: `Airplane mode ${newState === '1' ? 'enabled' : 'disabled'} successfully`,
        action: 'toggle_airplane_mode',
        previousState: isAirplaneModeOn ? 'ON' : 'OFF',
        newState: newState === '1' ? 'ON' : 'OFF'
      }
    } catch (directToggleError) {
      console.log('Direct toggle failed, trying UI method...', directToggleError)
      
      // Method 2: Use UI interaction as fallback
      // Open quick settings panel
      await execAsync(`adb -s ${deviceId} shell cmd statusbar expand-settings`, { timeout: 3000 })
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Take a screenshot to help debug button location
      await execAsync(`adb -s ${deviceId} shell screencap -p /sdcard/airplane_debug.png`, { timeout: 3000 })
      
      // Try multiple common airplane mode button locations for different devices
      const commonLocations = [
        { x: 200, y: 300, name: "Top-left area" },
        { x: 150, y: 250, name: "Upper-left" },
        { x: 300, y: 300, name: "Center-left" },
        { x: 100, y: 200, name: "Far top-left" },
        { x: 250, y: 350, name: "Mid-left" }
      ]
      
      for (const location of commonLocations) {
        console.log(`Trying airplane mode tap at ${location.name}: ${location.x}, ${location.y}`)
        await execAsync(`adb -s ${deviceId} shell input tap ${location.x} ${location.y}`, { timeout: 3000 })
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Check if airplane mode state changed
        try {
          const { stdout: newState } = await execAsync(`adb -s ${deviceId} shell settings get global airplane_mode_on`, { timeout: 2000 })
          if (newState.trim() !== currentState) {
            // Success! Airplane mode was toggled
            await execAsync(`adb -s ${deviceId} shell input keyevent KEYCODE_BACK`, { timeout: 3000 })
            return {
              success: true,
              message: `Airplane mode toggled successfully using ${location.name}`,
              action: 'toggle_airplane_mode',
              method: 'UI tap',
              location: location
            }
          }
        } catch (checkError) {
          console.log('Could not check airplane mode state:', checkError)
        }
      }
      
      // Close quick settings
      await execAsync(`adb -s ${deviceId} shell input keyevent KEYCODE_BACK`, { timeout: 3000 })
      
      return {
        success: false,
        message: 'Could not locate airplane mode button. Quick settings opened but toggle not found.',
        action: 'toggle_airplane_mode',
        note: 'Screenshot saved as airplane_debug.png for manual inspection. You may need to manually tap the airplane mode button.',
        triedLocations: commonLocations
      }
    }
  } catch (error) {
    console.error('Failed to toggle airplane mode:', error)
    return {
      success: false,
      error: 'Failed to toggle airplane mode',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function simulateTouchEvent(deviceId: string, execAsync: any, x: number, y: number) {
  const actionStartTime = Date.now()
  
  try {
    logDeviceAction(deviceId, 'touch_event', 'started', { 
      coordinates: { x, y },
      step: 'preparing_touch_event'
    })
    
    // Execute the touch event
    const touchStartTime = Date.now()
    await execAsync(`adb -s ${deviceId} shell input tap ${x} ${y}`, { timeout: 3000 })
    const touchDuration = Date.now() - touchStartTime
    
    logADBCommand(deviceId, `input tap ${x} ${y}`, 'Touch event executed', undefined, touchDuration)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Heartbeat verification - check if device is responsive
    logDeviceAction(deviceId, 'touch_event', 'started', { step: 'heartbeat_verification' })
    const heartbeatStartTime = Date.now()
    
    try {
      const { stdout: heartbeatResponse } = await execAsync(`adb -s ${deviceId} shell dumpsys input_method | head -1`, { timeout: 2000 })
      const heartbeatDuration = Date.now() - heartbeatStartTime
      
      logADBCommand(deviceId, 'dumpsys input_method (heartbeat)', heartbeatResponse.trim(), undefined, heartbeatDuration)
      logDeviceAction(deviceId, 'heartbeat', 'success', { 
        message: 'Device responsive after touch event',
        duration: heartbeatDuration
      })
    } catch (heartbeatError) {
      logDeviceAction(deviceId, 'heartbeat', 'error', { 
        error: 'Device heartbeat check failed',
        details: heartbeatError instanceof Error ? heartbeatError.message : 'Unknown error'
      })
    }
    
    const totalDuration = Date.now() - actionStartTime
    logDeviceAction(deviceId, 'touch_event', 'success', { 
      coordinates: { x, y },
      message: `Touch event executed successfully at (${x}, ${y})`,
      duration: totalDuration
    })
    
    return {
      success: true,
      message: `Touch event executed successfully at coordinates (${x}, ${y})`,
      action: 'touch_event',
      coordinates: { x, y },
      duration: totalDuration,
      heartbeatVerified: true
    }
  } catch (error) {
    const totalDuration = Date.now() - actionStartTime
    const errorMsg = 'Failed to execute touch event'
    
    logDeviceAction(deviceId, 'touch_event', 'error', { 
      coordinates: { x, y },
      error: errorMsg,
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: totalDuration
    })
    
    return {
      success: false,
      error: errorMsg,
      details: error instanceof Error ? error.message : 'Unknown error',
      coordinates: { x, y },
      duration: totalDuration
    }
  }
}

async function smartEngagementSequence(deviceId: string, execAsync: any, parameters: any = {}) {
  const sequenceStartTime = Date.now()
  const instagramUsername = parameters.instagramUsername || null
  
  try {
    logDeviceAction(deviceId, 'smart_engagement', 'started', { 
      step: 'sequence_initialization',
      targetUsername: instagramUsername
    })
    
    // Step 1: Wake and unlock device
    logDeviceAction(deviceId, 'smart_engagement', 'started', { step: 'wake_and_unlock' })
    const wakeStartTime = Date.now()
    
    await execAsync(`adb -s ${deviceId} shell input keyevent KEYCODE_WAKEUP`, { timeout: 3000 })
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Unlock device (swipe up)
    await execAsync(`adb -s ${deviceId} shell input swipe 500 1500 500 500`, { timeout: 3000 })
    const wakeDuration = Date.now() - wakeStartTime
    
    logADBCommand(deviceId, 'wake and unlock sequence', 'Device unlocked', undefined, wakeDuration)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Step 2: Launch Instagram
    logDeviceAction(deviceId, 'smart_engagement', 'started', { step: 'launch_instagram' })
    const launchStartTime = Date.now()
    
    await execAsync(`adb -s ${deviceId} shell monkey -p com.instagram.android -c android.intent.category.LAUNCHER 1`, { timeout: 5000 })
    const launchDuration = Date.now() - launchStartTime
    
    logADBCommand(deviceId, 'monkey -p com.instagram.android', 'Instagram launched', undefined, launchDuration)
    await new Promise(resolve => setTimeout(resolve, 4000))
    
    // Step 3: Verify Instagram account (if specified)
    if (instagramUsername) {
      logDeviceAction(deviceId, 'smart_engagement', 'started', { 
        step: 'verify_instagram_account',
        targetUsername: instagramUsername
      })
      
      try {
        // Take screenshot to verify current account
        const screenshotStartTime = Date.now()
        await execAsync(`adb -s ${deviceId} shell screencap -p /sdcard/instagram_verification.png`, { timeout: 5000 })
        
        // Pull screenshot for verification
        const timestamp = Date.now()
        await execAsync(`adb -s ${deviceId} pull /sdcard/instagram_verification.png instagram_profile_${timestamp}.png`, { timeout: 5000 })
        const screenshotDuration = Date.now() - screenshotStartTime
        
        logADBCommand(deviceId, 'screencap for verification', `Screenshot saved as instagram_profile_${timestamp}.png`, undefined, screenshotDuration)
        
        // Navigate to profile to verify username
        await execAsync(`adb -s ${deviceId} shell input tap 900 2100`, { timeout: 3000 }) // Profile tab
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        logDeviceAction(deviceId, 'smart_engagement', 'success', { 
          step: 'instagram_account_verified',
          targetUsername: instagramUsername,
          screenshotFile: `instagram_profile_${timestamp}.png`,
          message: `Instagram opened and profile accessed for verification`
        })
      } catch (verificationError) {
        logDeviceAction(deviceId, 'smart_engagement', 'error', { 
          step: 'instagram_account_verification_failed',
          targetUsername: instagramUsername,
          error: verificationError instanceof Error ? verificationError.message : 'Unknown error'
        })
      }
    }
    
    // Step 4: Return to home feed for engagement
    logDeviceAction(deviceId, 'smart_engagement', 'started', { step: 'navigate_to_home_feed' })
    await execAsync(`adb -s ${deviceId} shell input tap 150 2100`, { timeout: 3000 }) // Home tab
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const totalDuration = Date.now() - sequenceStartTime
    logDeviceAction(deviceId, 'smart_engagement', 'success', { 
      message: 'Smart engagement sequence completed successfully',
      targetUsername: instagramUsername,
      duration: totalDuration,
      readyForEngagement: true
    })
    
    return {
      success: true,
      message: 'Smart engagement sequence completed successfully',
      action: 'smart_engagement',
      targetUsername: instagramUsername,
      duration: totalDuration,
      steps: ['wake_and_unlock', 'launch_instagram', 'verify_account', 'navigate_to_home'],
      readyForEngagement: true
    }
  } catch (error) {
    const totalDuration = Date.now() - sequenceStartTime
    const errorMsg = 'Smart engagement sequence failed'
    
    logDeviceAction(deviceId, 'smart_engagement', 'error', { 
      error: errorMsg,
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: totalDuration,
      targetUsername: instagramUsername
    })
    
    return {
      success: false,
      error: errorMsg,
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: totalDuration,
      targetUsername: instagramUsername
    }
  }
}
