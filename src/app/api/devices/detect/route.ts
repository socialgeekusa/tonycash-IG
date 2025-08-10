import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface Device {
  id: string
  name: string
  type: 'ios' | 'android'
  status: 'connected' | 'disconnected' | 'busy'
  lastSeen: Date
  ipAddress?: string
}

export async function GET(request: NextRequest) {
  try {
    const realDevices: Device[] = []

    // Check for Android devices using ADB
    try {
      const { stdout: androidOutput } = await execAsync('adb devices')
      const lines = androidOutput.split('\n').slice(1)
      
      for (const line of lines) {
        const parts = line.trim().split('\t')
        if (parts.length === 2 && parts[1] === 'device') {
          // Get device info
          try {
            const { stdout: modelOutput } = await execAsync(`adb -s ${parts[0]} shell getprop ro.product.model`)
            const deviceModel = modelOutput.trim() || 'Android Device'
            
            realDevices.push({
              id: parts[0], // Use the actual device ID from ADB
              name: `${deviceModel} (${parts[0].substring(0, 8)})`,
              type: 'android',
              status: 'connected',
              lastSeen: new Date(),
              ipAddress: 'USB Connected'
            })
          } catch (modelError) {
            realDevices.push({
              id: parts[0], // Use the actual device ID from ADB
              name: `Android Device (${parts[0].substring(0, 8)})`,
              type: 'android',
              status: 'connected',
              lastSeen: new Date(),
              ipAddress: 'USB Connected'
            })
          }
        }
      }
    } catch (androidError) {
      console.log('ADB not found or no Android devices connected')
    }

    // Check for iOS devices using xcrun (if on macOS)
    try {
      const { stdout: iosOutput } = await execAsync('xcrun simctl list devices --json')
      const iosData = JSON.parse(iosOutput)
      
      // Parse real iOS devices (not simulators)
      if (iosData.devices) {
        for (const [version, devices] of Object.entries(iosData.devices)) {
          if (Array.isArray(devices)) {
            for (const device of devices) {
              if (device.isAvailable && device.state === 'Booted' && !device.name.includes('Simulator')) {
                realDevices.push({
                  id: `ios-${device.udid}`,
                  name: device.name,
                  type: 'ios',
                  status: 'connected',
                  lastSeen: new Date(),
                  ipAddress: 'USB Connected'
                })
              }
            }
          }
        }
      }
    } catch (iosError) {
      console.log('iOS development tools not found or no iOS devices connected')
    }

    // Check for iOS devices using idevice_id (if libimobiledevice is installed)
    try {
      const { stdout: ideviceOutput } = await execAsync('idevice_id -l')
      const deviceIds = ideviceOutput.trim().split('\n').filter(id => id.length > 0)
      
      for (const deviceId of deviceIds) {
        try {
          const { stdout: nameOutput } = await execAsync(`ideviceinfo -u ${deviceId} -k DeviceName`)
          const deviceName = nameOutput.trim() || 'iPhone'
          
          realDevices.push({
            id: `ios-${deviceId}`,
            name: `${deviceName} (${deviceId.substring(0, 8)})`,
            type: 'ios',
            status: 'connected',
            lastSeen: new Date(),
            ipAddress: 'USB Connected'
          })
        } catch (nameError) {
          realDevices.push({
            id: `ios-${deviceId}`,
            name: `iPhone (${deviceId.substring(0, 8)})`,
            type: 'ios',
            status: 'connected',
            lastSeen: new Date(),
            ipAddress: 'USB Connected'
          })
        }
      }
    } catch (ideviceError) {
      console.log('libimobiledevice not found')
    }

    return NextResponse.json({
      success: true,
      devices: realDevices,
      message: realDevices.length > 0 
        ? `Found ${realDevices.length} connected device(s)` 
        : 'No devices connected. Please connect your iOS or Android device via USB.'
    })

  } catch (error) {
    console.error('Device detection error:', error)
    return NextResponse.json({
      success: false,
      devices: [],
      error: 'Failed to detect devices',
      message: 'Device detection failed. Make sure ADB (Android) or Xcode tools (iOS) are installed.'
    })
  }
}

export async function POST(request: NextRequest) {
  // Handle device connection/disconnection
  return NextResponse.json({ success: true, message: 'Device management endpoint' })
}
