'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface LogEvent {
  type: 'log' | 'device-action' | 'adb-command' | 'instagram-action' | 'system-event' | 'deployment' | 'connection' | 'heartbeat'
  id?: string
  timestamp: string
  level?: 'info' | 'warn' | 'error' | 'debug'
  category?: string
  message: string
  deviceId?: string
  actionType?: string
  coordinates?: { x: number; y: number }
  duration?: number
  command?: string
  output?: string
  data?: any
  clientId?: string
  connectedClients?: number
}

interface TerminalFilters {
  level: 'all' | 'info' | 'warn' | 'error' | 'debug'
  category: 'all' | 'device' | 'automation' | 'api' | 'scheduler' | 'user'
  deviceId: 'all' | string
  search: string
}

export function LiveTerminal() {
  const [logs, setLogs] = useState<LogEvent[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [connectedClients, setConnectedClients] = useState(0)
  const [autoScroll, setAutoScroll] = useState(true)
  const [filters, setFilters] = useState<TerminalFilters>({
    level: 'all',
    category: 'all',
    deviceId: 'all',
    search: ''
  })
  
  const terminalRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  // Auto-scroll to bottom when new logs arrive
  const scrollToBottom = useCallback(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [autoScroll])

  // Connect to real-time logs
  const connectToLogs = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    setConnectionStatus('connecting')
    
    try {
      const eventSource = new EventSource('/api/realtime/logs')
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        setIsConnected(true)
        setConnectionStatus('connected')
        reconnectAttempts.current = 0
        console.log('Connected to real-time logs')
      }

      eventSource.onmessage = (event) => {
        try {
          const logEvent: LogEvent = JSON.parse(event.data)
          
          // Handle different event types
          if (logEvent.type === 'heartbeat') {
            setConnectedClients(logEvent.connectedClients || 0)
            return
          }

          if (logEvent.type === 'connection') {
            console.log('Connection established:', logEvent.message)
            return
          }

          // Add log to the list
          setLogs(prevLogs => {
            const newLogs = [...prevLogs, logEvent]
            // Keep only last 1000 logs for performance
            return newLogs.slice(-1000)
          })

          // Auto-scroll after a short delay to ensure DOM is updated
          setTimeout(scrollToBottom, 10)
        } catch (error) {
          console.error('Error parsing log event:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error)
        setIsConnected(false)
        setConnectionStatus('error')
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000 // 1s, 2s, 4s, 8s, 16s
          reconnectAttempts.current++
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`)
            connectToLogs()
          }, delay)
        } else {
          setConnectionStatus('disconnected')
          console.error('Max reconnection attempts reached')
        }
      }
    } catch (error) {
      console.error('Failed to create EventSource:', error)
      setConnectionStatus('error')
    }
  }, [scrollToBottom])

  // Disconnect from logs
  const disconnectFromLogs = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    setIsConnected(false)
    setConnectionStatus('disconnected')
    reconnectAttempts.current = 0
  }, [])

  // Filter logs based on current filters
  const filteredLogs = logs.filter(log => {
    if (filters.level !== 'all' && log.level !== filters.level) return false
    if (filters.category !== 'all' && log.category !== filters.category) return false
    if (filters.deviceId !== 'all' && log.deviceId !== filters.deviceId) return false
    if (filters.search && !log.message.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  // Get unique device IDs for filter dropdown
  const deviceIds = Array.from(new Set(logs.filter(log => log.deviceId).map(log => log.deviceId)))

  // Clear logs
  const clearLogs = () => {
    setLogs([])
  }

  // Export logs
  const exportLogs = () => {
    const logsText = filteredLogs.map(log => {
      const timestamp = new Date(log.timestamp).toLocaleString()
      const level = log.level ? `[${log.level.toUpperCase()}]` : ''
      const device = log.deviceId ? `[${log.deviceId}]` : ''
      const coords = log.coordinates ? ` (${log.coordinates.x},${log.coordinates.y})` : ''
      const duration = log.duration ? ` ${log.duration}ms` : ''
      return `${timestamp} ${level} ${device} ${log.message}${coords}${duration}`
    }).join('\n')

    const blob = new Blob([logsText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tonycash-logs-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Format log message with syntax highlighting
  const formatLogMessage = (log: LogEvent) => {
    const timestamp = new Date(log.timestamp).toLocaleTimeString()
    const level = log.level || 'info'
    const device = log.deviceId ? `[${log.deviceId}]` : ''
    
    let message = log.message
    let details = ''

    // Add coordinate information
    if (log.coordinates) {
      details += ` (${log.coordinates.x},${log.coordinates.y})`
    }

    // Add duration information
    if (log.duration) {
      details += ` ${log.duration}ms`
    }

    // Add command information
    if (log.command) {
      details += `\n  └─ Command: ${log.command}`
    }

    // Add output information
    if (log.output && log.output.trim()) {
      details += `\n  └─ Output: ${log.output.trim()}`
    }

    // Add error information
    if (log.data?.error) {
      details += `\n  └─ Error: ${log.data.error}`
    }

    return { timestamp, level, device, message, details }
  }

  // Get color class for log level
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400'
      case 'warn': return 'text-yellow-400'
      case 'debug': return 'text-gray-400'
      default: return 'text-green-400'
    }
  }

  // Get connection status color
  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500'
      case 'connecting': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  // Initialize connection on mount
  useEffect(() => {
    connectToLogs()
    return () => {
      disconnectFromLogs()
    }
  }, [connectToLogs, disconnectFromLogs])

  return (
    <div className="space-y-4">
      {/* Connection Status & Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Live Terminal</CardTitle>
              <CardDescription>
                Real-time device actions and system events
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getConnectionStatusColor()}`} />
                {connectionStatus}
              </Badge>
              {connectedClients > 0 && (
                <Badge variant="secondary">
                  {connectedClients} client{connectedClients !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant={isConnected ? "destructive" : "default"}
                size="sm"
                onClick={isConnected ? disconnectFromLogs : connectToLogs}
              >
                {isConnected ? 'Disconnect' : 'Connect'}
              </Button>
              <Button variant="outline" size="sm" onClick={clearLogs}>
                Clear Logs
              </Button>
              <Button variant="outline" size="sm" onClick={exportLogs}>
                Export Logs
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-scroll" className="text-sm">Auto-scroll</Label>
              <Switch
                id="auto-scroll"
                checked={autoScroll}
                onCheckedChange={setAutoScroll}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select
              value={filters.level}
              onValueChange={(value) => setFilters(prev => ({ ...prev, level: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.category}
              onValueChange={(value) => setFilters(prev => ({ ...prev, category: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="device">Device</SelectItem>
                <SelectItem value="automation">Automation</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="scheduler">Scheduler</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.deviceId}
              onValueChange={(value) => setFilters(prev => ({ ...prev, deviceId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Devices</SelectItem>
                {deviceIds.map(deviceId => (
                  <SelectItem key={deviceId} value={deviceId!}>
                    {deviceId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Search logs..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Terminal Display */}
      <Card>
        <CardContent className="p-0">
          <div
            ref={terminalRef}
            className="bg-gray-900 text-green-300 font-mono text-sm p-4 h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
          >
            {filteredLogs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                {isConnected ? 'No logs to display. Waiting for device actions...' : 'Connect to start viewing real-time logs'}
              </div>
            ) : (
              filteredLogs.map((log, index) => {
                const formatted = formatLogMessage(log)
                return (
                  <div key={`${log.id || index}`} className="mb-1">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 text-xs min-w-20">
                        {formatted.timestamp}
                      </span>
                      <span className={`text-xs font-bold min-w-12 ${getLevelColor(formatted.level)}`}>
                        [{formatted.level.toUpperCase()}]
                      </span>
                      {formatted.device && (
                        <span className="text-blue-400 text-xs min-w-24">
                          {formatted.device}
                        </span>
                      )}
                      <span className="flex-1">
                        {formatted.message}
                        {formatted.details && (
                          <span className="text-gray-400">
                            {formatted.details}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{logs.length}</div>
            <div className="text-sm text-muted-foreground">Total Logs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-400">
              {logs.filter(log => log.level === 'error').length}
            </div>
            <div className="text-sm text-muted-foreground">Errors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-400">
              {logs.filter(log => log.type === 'device-action').length}
            </div>
            <div className="text-sm text-muted-foreground">Device Actions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">
              {deviceIds.length}
            </div>
            <div className="text-sm text-muted-foreground">Active Devices</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
