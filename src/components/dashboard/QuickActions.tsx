'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const quickActions = [
  {
    title: 'Start DM Campaign',
    description: 'Send mass direct messages',
    action: 'dm-campaigns',
    color: 'bg-blue-500'
  },
  {
    title: 'Auto Like Posts',
    description: 'Like posts automatically',
    action: 'engagement',
    color: 'bg-red-500'
  },
  {
    title: 'Follow Competitors',
    description: 'Target competitor followers',
    action: 'targeting',
    color: 'bg-green-500'
  },
  {
    title: 'Generate Caption',
    description: 'AI-powered captions',
    action: 'ai-tools',
    color: 'bg-purple-500'
  },
  {
    title: 'Auto Comment',
    description: 'Leave thoughtful comments',
    action: 'engagement',
    color: 'bg-orange-500'
  },
  {
    title: 'View Analytics',
    description: 'Check growth metrics',
    action: 'analytics',
    color: 'bg-teal-500'
  }
]

export function QuickActions() {
  const router = useRouter()

  const handleQuickAction = (action: string, title: string) => {
    toast.info(`Navigating to ${title}`)
    router.push(`/${action}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Fast access to your most used features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((item, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2 text-left"
              onClick={() => handleQuickAction(item.action, item.title)}
            >
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <div>
                <div className="font-medium text-sm">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
