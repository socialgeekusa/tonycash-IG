'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useDeviceStore } from '@/lib/stores/deviceStore'
import { DeviceController } from '@/components/automation/DeviceController'
import { InstagramAccountManager } from '@/components/automation/InstagramAccountManager'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { StatsOverview } from '@/components/dashboard/StatsOverview'

export default function Dashboard() {
  const { connectedDevices, refreshDevices } = useDeviceStore()

  useEffect(() => {
    refreshDevices()
  }, [refreshDevices])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to TonyCash Tool - Your Instagram Growth Command Center
        </p>
      </div>

      {/* Stats Overview */}
      <StatsOverview />

      {/* Device Status & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeviceController />
        <QuickActions />
      </div>

      {/* Instagram Account Manager */}
      <InstagramAccountManager devices={connectedDevices} />

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  )
}
