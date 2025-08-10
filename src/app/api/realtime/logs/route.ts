import { NextRequest, NextResponse } from 'next/server'
import { realTimeLogger } from '@/lib/realtime-logger'

export async function GET(request: NextRequest) {
  // Set up Server-Sent Events headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  })

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Add client to real-time logger
      realTimeLogger.addClient(clientId)
      
      // Send initial connection message
      const connectionMessage = {
        type: 'connection',
        id: clientId,
        timestamp: new Date().toISOString(),
        message: 'Connected to real-time logs',
        clientId: clientId,
        connectedClients: realTimeLogger.getConnectedClients()
      }
      
      controller.enqueue(`data: ${JSON.stringify(connectionMessage)}\n\n`)
      
      // Set up log listener
      const logListener = (logEntry: any) => {
        try {
          const eventData = {
            ...logEntry,
            type: logEntry.type || 'log',
            id: logEntry.id || `log_${Date.now()}`,
            timestamp: logEntry.timestamp || new Date().toISOString()
          }
          
          controller.enqueue(`data: ${JSON.stringify(eventData)}\n\n`)
        } catch (error) {
          console.error('Error sending log event:', error)
        }
      }
      
      // Listen to all log events
      realTimeLogger.on('log', logListener)
      realTimeLogger.on('device-action', logListener)
      realTimeLogger.on('adb-command', logListener)
      realTimeLogger.on('instagram-action', logListener)
      realTimeLogger.on('system-event', logListener)
      realTimeLogger.on('deployment', logListener)
      
      // Send heartbeat every 30 seconds
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = {
            type: 'heartbeat',
            timestamp: new Date().toISOString(),
            connectedClients: realTimeLogger.getConnectedClients(),
            clientId: clientId
          }
          
          controller.enqueue(`data: ${JSON.stringify(heartbeat)}\n\n`)
        } catch (error) {
          console.error('Error sending heartbeat:', error)
          clearInterval(heartbeatInterval)
        }
      }, 30000)
      
      // Handle client disconnect
      const cleanup = () => {
        clearInterval(heartbeatInterval)
        realTimeLogger.removeClient(clientId)
        realTimeLogger.off('log', logListener)
        realTimeLogger.off('device-action', logListener)
        realTimeLogger.off('adb-command', logListener)
        realTimeLogger.off('instagram-action', logListener)
        realTimeLogger.off('system-event', logListener)
        realTimeLogger.off('deployment', logListener)
        
        try {
          controller.close()
        } catch (error) {
          console.error('Error closing controller:', error)
        }
      }
      
      // Set up cleanup on request abort
      request.signal.addEventListener('abort', cleanup)
      
      // Store cleanup function for potential manual cleanup
      ;(controller as any).cleanup = cleanup
    },
    
    cancel() {
      // This will be called when the stream is cancelled
      console.log('Real-time log stream cancelled')
    }
  })

  return new NextResponse(stream, { headers })
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cache-Control',
    },
  })
}
