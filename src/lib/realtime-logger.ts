import { logger, LogEntry } from './logger'

export interface RealTimeLogEntry extends LogEntry {
  deviceId?: string
  actionType?: string
  coordinates?: { x: number; y: number }
  duration?: number
  screenshot?: string
  command?: string
  output?: string
}

// Simple event emitter for browser/Node.js compatibility
class SimpleEventEmitter {
  private events: { [key: string]: Function[] } = {}

  on(event: string, listener: Function): void {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(listener)
  }

  off(event: string, listener: Function): void {
    if (!this.events[event]) return
    this.events[event] = this.events[event].filter(l => l !== listener)
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return
    this.events[event].forEach(listener => {
      try {
        listener(...args)
      } catch (error) {
        console.error('Event listener error:', error)
      }
    })
  }

  removeAllListeners(event?: string): void {
    if (event) {
      delete this.events[event]
    } else {
      this.events = {}
    }
  }
}

class RealTimeLogger extends SimpleEventEmitter {
  private static instance: RealTimeLogger
  private isEnabled: boolean = true
  private connectedClients: Set<string> = new Set()

  constructor() {
    super()
  }

  static getInstance(): RealTimeLogger {
    if (!RealTimeLogger.instance) {
      RealTimeLogger.instance = new RealTimeLogger()
    }
    return RealTimeLogger.instance
  }

  // Device action logging with real-time broadcast
  logDeviceAction(
    deviceId: string,
    action: string,
    status: 'started' | 'success' | 'error',
    details?: {
      coordinates?: { x: number; y: number }
      text?: string
      duration?: number
      screenshot?: string
      error?: string
      command?: string
      output?: string
    }
  ): void {
    const timestamp = new Date()
    const logEntry: RealTimeLogEntry = {
      id: this.generateId(),
      timestamp,
      level: status === 'error' ? 'error' : 'info',
      category: 'device',
      message: `[${deviceId}] ${action}: ${status}`,
      deviceId,
      actionType: action,
      ...details
    }

    // Add to main logger
    logger.info(logEntry.message, 'device', {
      deviceId,
      action,
      status,
      ...details
    })

    // Emit real-time event
    this.emit('device-action', logEntry)
    this.emit('log', logEntry)

    // Console output with enhanced formatting
    this.logToConsole(logEntry)
  }

  // ADB command logging
  logADBCommand(
    deviceId: string,
    command: string,
    output?: string,
    error?: string,
    duration?: number
  ): void {
    const timestamp = new Date()
    const logEntry: RealTimeLogEntry = {
      id: this.generateId(),
      timestamp,
      level: error ? 'error' : 'info',
      category: 'device',
      message: `[${deviceId}] ADB: ${command}`,
      deviceId,
      command,
      output,
      duration,
      data: { error }
    }

    logger.info(logEntry.message, 'device', { command, output, error, duration })
    this.emit('adb-command', logEntry)
    this.emit('log', logEntry)
    this.logToConsole(logEntry)
  }

  // Instagram action logging
  logInstagramAction(
    deviceId: string,
    action: string,
    target?: string,
    result?: 'success' | 'failure',
    details?: any
  ): void {
    const timestamp = new Date()
    const message = target 
      ? `[${deviceId}] Instagram: ${action} on ${target} - ${result}`
      : `[${deviceId}] Instagram: ${action} - ${result}`

    const logEntry: RealTimeLogEntry = {
      id: this.generateId(),
      timestamp,
      level: result === 'failure' ? 'error' : 'info',
      category: 'automation',
      message,
      deviceId,
      actionType: action,
      data: { target, result, ...details }
    }

    logger.logAutomationAction(action, target || 'unknown', result || 'success', details)
    this.emit('instagram-action', logEntry)
    this.emit('log', logEntry)
    this.logToConsole(logEntry)
  }

  // System events
  logSystemEvent(
    event: string,
    level: 'info' | 'warn' | 'error' = 'info',
    details?: any
  ): void {
    const timestamp = new Date()
    const logEntry: RealTimeLogEntry = {
      id: this.generateId(),
      timestamp,
      level,
      category: 'automation',
      message: `System: ${event}`,
      data: details
    }

    logger.info(logEntry.message, 'automation', details)
    this.emit('system-event', logEntry)
    this.emit('log', logEntry)
    this.logToConsole(logEntry)
  }

  // GitHub deployment events
  logDeploymentEvent(
    event: string,
    status: 'started' | 'success' | 'error',
    details?: any
  ): void {
    const timestamp = new Date()
    const logEntry: RealTimeLogEntry = {
      id: this.generateId(),
      timestamp,
      level: status === 'error' ? 'error' : 'info',
      category: 'automation',
      message: `Deployment: ${event} - ${status}`,
      data: { event, status, ...details }
    }

    logger.info(logEntry.message, 'automation', details)
    this.emit('deployment', logEntry)
    this.emit('log', logEntry)
    this.logToConsole(logEntry)
  }

  // Client connection management
  addClient(clientId: string): void {
    this.connectedClients.add(clientId)
    this.logSystemEvent(`Dashboard client connected: ${clientId}`)
  }

  removeClient(clientId: string): void {
    this.connectedClients.delete(clientId)
    this.logSystemEvent(`Dashboard client disconnected: ${clientId}`)
  }

  getConnectedClients(): number {
    return this.connectedClients.size
  }

  // Control methods
  enable(): void {
    this.isEnabled = true
    this.logSystemEvent('Real-time logging enabled')
  }

  disable(): void {
    this.isEnabled = false
    this.logSystemEvent('Real-time logging disabled')
  }

  isLoggingEnabled(): boolean {
    return this.isEnabled
  }

  // Enhanced console logging with colors and formatting
  private logToConsole(entry: RealTimeLogEntry): void {
    if (!this.isEnabled) return

    const timestamp = entry.timestamp.toISOString()
    const deviceInfo = entry.deviceId ? `[${entry.deviceId}]` : ''
    const prefix = `${timestamp} ${deviceInfo}`

    // Color coding for different log levels
    const colors = {
      info: '\x1b[36m',    // Cyan
      warn: '\x1b[33m',    // Yellow
      error: '\x1b[31m',   // Red
      debug: '\x1b[90m'    // Gray
    }
    const reset = '\x1b[0m'
    const color = colors[entry.level] || colors.info

    console.log(`${color}${prefix} ${entry.message}${reset}`)
    
    // Additional details for device actions
    if (entry.coordinates) {
      console.log(`  └─ Coordinates: (${entry.coordinates.x}, ${entry.coordinates.y})`)
    }
    if (entry.duration) {
      console.log(`  └─ Duration: ${entry.duration}ms`)
    }
    if (entry.command) {
      console.log(`  └─ Command: ${entry.command}`)
    }
    if (entry.output && entry.output.trim()) {
      console.log(`  └─ Output: ${entry.output.trim()}`)
    }
    if (entry.data?.error) {
      console.log(`  └─ Error: ${entry.data.error}`)
    }
  }

  private generateId(): string {
    return `rt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Export singleton instance
export const realTimeLogger = RealTimeLogger.getInstance()

// Convenience functions
export const logDeviceAction = (
  deviceId: string,
  action: string,
  status: 'started' | 'success' | 'error',
  details?: any
) => realTimeLogger.logDeviceAction(deviceId, action, status, details)

export const logADBCommand = (
  deviceId: string,
  command: string,
  output?: string,
  error?: string,
  duration?: number
) => realTimeLogger.logADBCommand(deviceId, command, output, error, duration)

export const logInstagramAction = (
  deviceId: string,
  action: string,
  target?: string,
  result?: 'success' | 'failure',
  details?: any
) => realTimeLogger.logInstagramAction(deviceId, action, target, result, details)

export const logSystemEvent = (
  event: string,
  level: 'info' | 'warn' | 'error' = 'info',
  details?: any
) => realTimeLogger.logSystemEvent(event, level, details)

export const logDeploymentEvent = (
  event: string,
  status: 'started' | 'success' | 'error',
  details?: any
) => realTimeLogger.logDeploymentEvent(event, status, details)
