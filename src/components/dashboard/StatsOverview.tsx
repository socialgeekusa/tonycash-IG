'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import { useDeviceStore } from '@/lib/stores/deviceStore'

interface Stats {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
  progress: number
}

interface Activity {
  action: string
  count: number
  status: 'active' | 'paused' | 'stopped'
}

export function StatsOverview() {
  const { connectedDevices } = useDeviceStore()
  const [stats, setStats] = useState<Stats[]>([
    {
      title: 'Total Followers',
      value: '0',
      change: '+0',
      changeType: 'positive' as const,
      progress: 0
    },
    {
      title: 'Engagement Rate',
      value: '0%',
      change: '+0%',
      changeType: 'positive' as const,
      progress: 0
    },
    {
      title: 'DMs Sent Today',
      value: '0',
      change: '+0',
      changeType: 'positive' as const,
      progress: 0
    },
    {
      title: 'Auto Likes',
      value: '0',
      change: '+0',
      changeType: 'positive' as const,
      progress: 0
    }
  ])

  const [activities, setActivities] = useState<Activity[]>([
    {
      action: 'Auto Like',
      count: 0,
      status: 'stopped' as const
    },
    {
      action: 'Auto Follow',
      count: 0,
      status: 'stopped' as const
    },
    {
      action: 'DM Campaign',
      count: 0,
      status: 'stopped' as const
    },
    {
      action: 'Comment Reply',
      count: 0,
      status: 'stopped' as const
    }
  ])

  useEffect(() => {
    // Load real stats from localStorage or API
    const loadRealStats = () => {
      try {
        const savedStats = localStorage.getItem('tonycash-stats')
        const savedActivities = localStorage.getItem('tonycash-activities')
        
        if (savedStats) {
          setStats(JSON.parse(savedStats))
        }
        
        if (savedActivities) {
          setActivities(JSON.parse(savedActivities))
        }
      } catch (error) {
        console.error('Failed to load stats:', error)
      }
    }

    loadRealStats()
    
    // Refresh stats every 30 seconds
    const interval = setInterval(loadRealStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const hasDevices = connectedDevices.length > 0
  const deviceStatus = hasDevices ? 'Ready for automation' : 'Connect a device to start'

  return (
    <div className="space-y-6">
      {/* Device Status Alert */}
      {!hasDevices && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <p className="text-sm text-orange-700">
                <strong>No devices connected.</strong> Connect your iOS or Android device via USB to start automation.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className={!hasDevices ? 'opacity-50' : ''}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.title}</CardDescription>
              <CardTitle className="text-2xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <Badge
                  variant={stat.changeType === 'positive' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {stat.change}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {stat.progress}%
                </span>
              </div>
              <Progress value={stat.progress} className="h-2" />
            </CardContent>
          </Card>
        ))}
        
        {/* Active Automations Card */}
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Active Automations</CardTitle>
            <CardDescription>
              {deviceStatus}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {activities.map((activity, index) => (
                <div key={index} className={`flex items-center justify-between p-3 border rounded-lg ${!hasDevices ? 'opacity-50' : ''}`}>
                  <div>
                    <div className="font-medium text-sm">{activity.action}</div>
                    <div className="text-xs text-muted-foreground">
                      {activity.count} actions
                    </div>
                  </div>
                  <Badge
                    variant={activity.status === 'active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {hasDevices ? activity.status : 'stopped'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
