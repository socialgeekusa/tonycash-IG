'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDeviceStore } from '@/lib/stores/deviceStore'

export function Header() {
  const { connectedDevices, isConnecting } = useDeviceStore()

  return (
    <header className="border-b bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">TonyCash Tool</h1>
          <p className="text-sm text-muted-foreground">
            Professional Instagram Growth Automation
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Devices:</span>
            <Badge variant={connectedDevices.length > 0 ? "default" : "secondary"}>
              {connectedDevices.length} Connected
            </Badge>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Refresh Devices'}
          </Button>
        </div>
      </div>
    </header>
  )
}
