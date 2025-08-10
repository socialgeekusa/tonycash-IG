'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Activity {
  id: number
  action: string
  target: string
  result: string
  timestamp: string
  type: 'engagement' | 'dm' | 'cleanup'
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'engagement':
      return 'bg-blue-500'
    case 'dm':
      return 'bg-green-500'
    case 'cleanup':
      return 'bg-orange-500'
    default:
      return 'bg-gray-500'
  }
}

const getResultVariant = (result: string) => {
  if (result === 'Success' || result === 'Delivered') return 'default'
  if (result.includes('Sent')) return 'secondary'
  if (result.includes('Likes')) return 'secondary'
  return 'outline'
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/automation?recent=true')
      const data = await response.json()
      
      if (data.success && data.activities) {
        setActivities(data.activities)
      } else {
        // No activities yet - show empty state
        setActivities([])
      }
    } catch (error) {
      console.error('Failed to fetch recent activity:', error)
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentActivity()
    
    // Refresh activity every 30 seconds
    const interval = setInterval(fetchRecentActivity, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest automation actions and their results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-muted-foreground">Loading recent activity...</div>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <div className="text-sm text-muted-foreground mb-2">No recent activity</div>
              <div className="text-xs text-muted-foreground">
                Start using automation features to see activity here
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${getTypeColor(activity.type)}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{activity.action}</span>
                        <span className="text-sm text-muted-foreground">→</span>
                        <span className="text-sm">{activity.target}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.timestamp}
                      </div>
                    </div>
                  </div>
                  <Badge variant={getResultVariant(activity.result)} className="text-xs">
                    {activity.result}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
