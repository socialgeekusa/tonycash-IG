'use client'

import { LiveTerminal } from '@/components/dashboard/LiveTerminal'
import { useDeviceStore } from '@/lib/stores/deviceStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function LiveDashboardPage() {
  const { connectedDevices, refreshDevices } = useDeviceStore()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor real-time device actions and system events
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/">Back to Dashboard</Link>
          </Button>
          <Button onClick={refreshDevices}>
            Refresh Devices
          </Button>
        </div>
      </div>

      {/* Connected Devices Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Connected Devices</CardTitle>
          <CardDescription>
            Real-time status of all connected Android and iOS devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connectedDevices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-lg font-medium">No devices connected</p>
              <p className="text-sm">
                Connect your Android device via USB and enable USB debugging to get started
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg text-left">
                <h4 className="font-medium mb-2">Quick Setup:</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Connect your Android device via USB</li>
                  <li>Enable Developer Options (tap Build Number 7 times)</li>
                  <li>Enable USB Debugging in Developer Options</li>
                  <li>Allow USB debugging when prompted on device</li>
                  <li>Refresh devices to detect your phone</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectedDevices.map((device) => (
                <div
                  key={device.id}
                  className="p-4 border rounded-lg bg-card"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="font-medium">{device.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {device.type.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>ID: {device.id}</p>
                    <p>Connection: {device.ipAddress}</p>
                    <p>Last seen: {new Date(device.lastSeen).toLocaleTimeString()}</p>
                  </div>
                  <div className="mt-3">
                    <Badge
                      variant={
                        device.status === 'connected' ? 'default' :
                        device.status === 'busy' ? 'secondary' : 'destructive'
                      }
                      className="text-xs"
                    >
                      {device.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Terminal */}
      <LiveTerminal />

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How to Use Live Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Real-Time Monitoring</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View live device actions as they happen</li>
                <li>• Monitor ADB commands and their output</li>
                <li>• Track Instagram automation activities</li>
                <li>• See system events and deployment updates</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Debugging Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Filter logs by level, category, or device</li>
                <li>• Search through log messages</li>
                <li>• Export logs for detailed analysis</li>
                <li>• Auto-scroll to follow latest actions</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
              GitHub Auto-Deployment
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              When you push updates to your GitHub repository, they will automatically be deployed 
              to your Windows PC via GitHub Desktop. The live terminal will show deployment events 
              in real-time, allowing you to immediately test fixes and improvements.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
