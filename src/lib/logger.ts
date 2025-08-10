export interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warn' | 'error' | 'debug'
  category: 'automation' | 'api' | 'device' | 'scheduler' | 'user'
  message: string
  data?: any
  deviceId?: string
  userId?: string
}

export interface LoggerConfig {
  maxEntries: number
  enableConsole: boolean
  enableStorage: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}

class Logger {
  private logs: LogEntry[] = []
  private config: LoggerConfig = {
    maxEntries: 1000,
    enableConsole: true,
    enableStorage: true,
    logLevel: 'info'
  }

  constructor(config?: Partial<LoggerConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
    
    // Load existing logs from storage
    this.loadFromStorage()
  }

  // Main logging methods
  info(message: string, category: LogEntry['category'] = 'automation', data?: any): void {
    this.log('info', message, category, data)
  }

  warn(message: string, category: LogEntry['category'] = 'automation', data?: any): void {
    this.log('warn', message, category, data)
  }

  error(message: string, category: LogEntry['category'] = 'automation', data?: any): void {
    this.log('error', message, category, data)
  }

  debug(message: string, category: LogEntry['category'] = 'automation', data?: any): void {
    this.log('debug', message, category, data)
  }

  // Core logging method
  private log(level: LogEntry['level'], message: string, category: LogEntry['category'], data?: any): void {
    // Check if we should log this level
    if (!this.shouldLog(level)) {
      return
    }

    const entry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      category,
      message,
      data
    }

    // Add to logs array
    this.logs.push(entry)

    // Maintain max entries limit
    if (this.logs.length > this.config.maxEntries) {
      this.logs = this.logs.slice(-this.config.maxEntries)
    }

    // Console output
    if (this.config.enableConsole) {
      this.logToConsole(entry)
    }

    // Storage
    if (this.config.enableStorage) {
      this.saveToStorage()
    }
  }

  // Specialized logging methods for automation
  logAutomationAction(action: string, target: string, result: 'success' | 'failure', data?: any): void {
    const message = `${action} on ${target}: ${result}`
    const level = result === 'success' ? 'info' : 'error'
    this.log(level, message, 'automation', { action, target, result, ...data })
  }

  logDeviceAction(deviceId: string, action: string, result: 'success' | 'failure', data?: any): void {
    const message = `Device ${deviceId} - ${action}: ${result}`
    const level = result === 'success' ? 'info' : 'error'
    this.log(level, message, 'device', { deviceId, action, result, ...data })
  }

  logAPICall(endpoint: string, method: string, status: number, duration?: number): void {
    const message = `${method} ${endpoint} - ${status}`
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info'
    this.log(level, message, 'api', { endpoint, method, status, duration })
  }

  logSchedulerEvent(event: string, taskId?: string, data?: any): void {
    const message = taskId ? `Scheduler: ${event} (${taskId})` : `Scheduler: ${event}`
    this.log('info', message, 'scheduler', { event, taskId, ...data })
  }

  logUserAction(action: string, userId?: string, data?: any): void {
    const message = `User action: ${action}`
    this.log('info', message, 'user', { action, userId, ...data })
  }

  // Query methods
  getLogs(limit?: number): LogEntry[] {
    const logs = [...this.logs].reverse() // Most recent first
    return limit ? logs.slice(0, limit) : logs
  }

  getLogsByLevel(level: LogEntry['level'], limit?: number): LogEntry[] {
    const filtered = this.logs.filter(log => log.level === level).reverse()
    return limit ? filtered.slice(0, limit) : filtered
  }

  getLogsByCategory(category: LogEntry['category'], limit?: number): LogEntry[] {
    const filtered = this.logs.filter(log => log.category === category).reverse()
    return limit ? filtered.slice(0, limit) : filtered
  }

  getLogsByTimeRange(startTime: Date, endTime: Date): LogEntry[] {
    return this.logs.filter(log => 
      log.timestamp >= startTime && log.timestamp <= endTime
    ).reverse()
  }

  getRecentLogs(minutes: number = 60): LogEntry[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000)
    return this.logs.filter(log => log.timestamp >= cutoff).reverse()
  }

  // Search logs
  searchLogs(query: string): LogEntry[] {
    const lowerQuery = query.toLowerCase()
    return this.logs.filter(log => 
      log.message.toLowerCase().includes(lowerQuery) ||
      log.category.toLowerCase().includes(lowerQuery) ||
      (log.data && JSON.stringify(log.data).toLowerCase().includes(lowerQuery))
    ).reverse()
  }

  // Statistics
  getLogStats() {
    const total = this.logs.length
    const byLevel = {
      debug: this.logs.filter(l => l.level === 'debug').length,
      info: this.logs.filter(l => l.level === 'info').length,
      warn: this.logs.filter(l => l.level === 'warn').length,
      error: this.logs.filter(l => l.level === 'error').length
    }
    const byCategory = {
      automation: this.logs.filter(l => l.category === 'automation').length,
      api: this.logs.filter(l => l.category === 'api').length,
      device: this.logs.filter(l => l.category === 'device').length,
      scheduler: this.logs.filter(l => l.category === 'scheduler').length,
      user: this.logs.filter(l => l.category === 'user').length
    }

    const recent = this.getRecentLogs(60).length
    const errors = this.getRecentLogs(60).filter(l => l.level === 'error').length

    return {
      total,
      byLevel,
      byCategory,
      recentHour: recent,
      recentErrors: errors
    }
  }

  // Management methods
  clearLogs(): void {
    this.logs = []
    if (this.config.enableStorage) {
      this.saveToStorage()
    }
  }

  clearOldLogs(olderThanHours: number = 24): number {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000)
    const initialCount = this.logs.length
    this.logs = this.logs.filter(log => log.timestamp >= cutoff)
    
    const removed = initialCount - this.logs.length
    if (removed > 0 && this.config.enableStorage) {
      this.saveToStorage()
    }
    
    return removed
  }

  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'level', 'category', 'message', 'data']
      const rows = this.logs.map(log => [
        log.timestamp.toISOString(),
        log.level,
        log.category,
        log.message,
        log.data ? JSON.stringify(log.data) : ''
      ])
      
      return [headers, ...rows].map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n')
    }
    
    return JSON.stringify(this.logs, null, 2)
  }

  // Configuration
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config }
  }

  getConfig(): LoggerConfig {
    return { ...this.config }
  }

  // Private helper methods
  private shouldLog(level: LogEntry['level']): boolean {
    const levels = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.config.logLevel)
    const messageLevelIndex = levels.indexOf(level)
    return messageLevelIndex >= currentLevelIndex
  }

  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString()
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.category}]`
    
    switch (entry.level) {
      case 'error':
        console.error(prefix, entry.message, entry.data || '')
        break
      case 'warn':
        console.warn(prefix, entry.message, entry.data || '')
        break
      case 'debug':
        console.debug(prefix, entry.message, entry.data || '')
        break
      default:
        console.log(prefix, entry.message, entry.data || '')
    }
  }

  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return
    
    try {
      const logsToSave = this.logs.slice(-100) // Save only last 100 logs
      localStorage.setItem('tonycash_logs', JSON.stringify(logsToSave))
    } catch (error) {
      console.error('Failed to save logs to storage:', error)
    }
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem('tonycash_logs')
      if (stored) {
        const logs = JSON.parse(stored)
        this.logs = logs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }))
      }
    } catch (error) {
      console.error('Failed to load logs from storage:', error)
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Convenience functions
export const logInfo = (message: string, category?: LogEntry['category'], data?: any) => 
  logger.info(message, category, data)

export const logWarn = (message: string, category?: LogEntry['category'], data?: any) => 
  logger.warn(message, category, data)

export const logError = (message: string, category?: LogEntry['category'], data?: any) => 
  logger.error(message, category, data)

export const logDebug = (message: string, category?: LogEntry['category'], data?: any) => 
  logger.debug(message, category, data)
