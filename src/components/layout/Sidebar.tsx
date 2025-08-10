'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    description: 'Overview & Quick Actions'
  },
  {
    name: 'Live Dashboard',
    href: '/dashboard/live',
    description: 'Real-time Device Monitoring'
  },
  {
    name: 'Smart Engagement',
    href: '/engagement',
    description: 'Auto Like, Comment, Follow'
  },
  {
    name: 'AI Tools',
    href: '/ai-tools',
    description: 'Bio Updates, Captions, Smart Replies'
  },
  {
    name: 'DM Campaigns',
    href: '/dm-campaigns',
    description: 'Mass DMs & Follow-ups'
  },
  {
    name: 'Targeting',
    href: '/targeting',
    description: 'Precision Audience Targeting'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    description: 'Growth Reports & Insights'
  },
  {
    name: 'Settings',
    href: '/settings',
    description: 'API Keys & Configuration'
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-card border-r flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">TC</span>
          </div>
          <div>
            <h2 className="font-semibold">TonyCash Tool</h2>
            <p className="text-xs text-muted-foreground">Instagram Growth</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-auto p-3 text-left",
                  isActive && "bg-primary text-primary-foreground"
                )}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-xs opacity-80">{item.description}</span>
                </div>
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Status</span>
          <Badge variant="default" className="bg-green-500">
            Active
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          All systems operational
        </p>
      </div>
    </div>
  )
}
