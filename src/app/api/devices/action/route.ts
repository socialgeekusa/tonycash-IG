import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { exec } = require('child_process')
    const { promisify } = require('util')
    const execAsync = promisify(exec)
    
    const body = await request.json()
    const { deviceId, action, parameters = {} } = body

    if (!deviceId || !action) {
      return NextResponse.json({
        success: false,
        error: 'Missing deviceId or action'
      }, { status: 400 })
    }

    // Verify device is connected
    try {
      const { stdout: devices } = await execAsync('adb devices', { timeout: 5000 })
      if (!devices.includes(deviceId)) {
        return NextResponse.json({
          success: false,
          error: 'Device not connected'
        }, { status: 404 })
      }
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'ADB not available'
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
      default:
        result = {
          success: false,
          error: `Unknown action: ${action}`
        }
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Device action error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// Action implementations
async function openInstagram(deviceId: string, execAsync: any) {
  try {
    console.log(`Opening Instagram on device ${deviceId}`)
    
    // Wake device first
    await execAsync(`adb -s ${deviceId} shell input keyevent KEYCODE_WAKEUP`, { timeout: 3000 })
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Unlock device (swipe up)
    await execAsync(`adb -s ${deviceId} shell input swipe 500 1500 500 500`, { timeout: 3000 })
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Open Instagram app using monkey command (more reliable)
    await execAsync(`adb -s ${deviceId} shell monkey -p com.instagram.android -c android.intent.category.LAUNCHER 1`, { timeout: 5000 })
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    return {
      success: true,
      message: 'Instagram opened successfully',
      action: 'open_instagram'
    }
  } catch (error) {
    console.error('Failed to open Instagram:', error)
    
    // Fallback: try using am start with intent
    try {
      console.log('Trying fallback method to open Instagram...')
      await execAsync(`adb -s ${deviceId} shell am start -a android.intent.action.MAIN -c android.intent.category.LAUNCHER com.instagram.android`, { timeout: 5000 })
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      return {
        success: true,
        message: 'Instagram opened successfully (fallback method)',
        action: 'open_instagram'
      }
    } catch (fallbackError) {
      return {
        success: false,
        error: 'Failed to open Instagram app',
        details: error instanceof Error ? error.message : 'Unknown error'
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
