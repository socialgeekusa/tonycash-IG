'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d')

  const growthMetrics = [
    {
      title: 'Total Followers',
      current: 12847,
      previous: 12613,
      change: 234,
      changePercent: 1.9,
      trend: 'up'
    },
    {
      title: 'Following',
      current: 1456,
      previous: 1423,
      change: 33,
      changePercent: 2.3,
      trend: 'up'
    },
    {
      title: 'Posts',
      current: 89,
      previous: 86,
      change: 3,
      changePercent: 3.5,
      trend: 'up'
    },
    {
      title: 'Avg. Engagement Rate',
      current: 4.2,
      previous: 3.8,
      change: 0.4,
      changePercent: 10.5,
      trend: 'up'
    }
  ]

  const engagementData = [
    {
      action: 'Auto Likes',
      count: 1234,
      success: 1198,
      failed: 36,
      successRate: 97.1
    },
    {
      action: 'Auto Comments',
      count: 456,
      success: 441,
      failed: 15,
      successRate: 96.7
    },
    {
      action: 'Auto Follows',
      count: 789,
      success: 756,
      failed: 33,
      successRate: 95.8
    },
    {
      action: 'DMs Sent',
      count: 234,
      success: 228,
      failed: 6,
      successRate: 97.4
    }
  ]

  const topPosts = [
    {
      id: 1,
      caption: 'The secret to success is...',
      likes: 1234,
      comments: 89,
      shares: 45,
      engagement: 5.2,
      date: '2024-01-15'
    },
    {
      id: 2,
      caption: 'Building wealth starts with...',
      likes: 987,
      comments: 67,
      shares: 32,
      engagement: 4.8,
      date: '2024-01-14'
    },
    {
      id: 3,
      caption: 'Mindset is everything when...',
      likes: 856,
      comments: 54,
      shares: 28,
      engagement: 4.1,
      date: '2024-01-13'
    }
  ]

  const hashtagPerformance = [
    { hashtag: '#entrepreneur', reach: 12500, engagement: 4.2, posts: 15 },
    { hashtag: '#business', reach: 9800, engagement: 3.8, posts: 12 },
    { hashtag: '#success', reach: 8900, engagement: 4.5, posts: 10 },
    { hashtag: '#motivation', reach: 7600, engagement: 3.9, posts: 8 },
    { hashtag: '#wealth', reach: 6500, engagement: 5.1, posts: 6 }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Insights</h1>
          <p className="text-muted-foreground">
            Track your Instagram growth and automation performance
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {growthMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardDescription>{metric.title}</CardDescription>
              <CardTitle className="text-2xl">
                {typeof metric.current === 'number' && metric.current > 100 
                  ? metric.current.toLocaleString() 
                  : metric.current}
                {metric.title.includes('Rate') && '%'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant={metric.trend === 'up' ? 'default' : 'destructive'}>
                  {metric.trend === 'up' ? '+' : '-'}{Math.abs(metric.change)}
                  {metric.title.includes('Rate') && '%'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {metric.changePercent > 0 ? '+' : ''}{metric.changePercent}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="engagement" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="engagement">Engagement Reports</TabsTrigger>
          <TabsTrigger value="content">Content Performance</TabsTrigger>
          <TabsTrigger value="hashtags">Hashtag Analysis</TabsTrigger>
          <TabsTrigger value="automation">Automation Stats</TabsTrigger>
        </TabsList>

        {/* Engagement Reports */}
        <TabsContent value="engagement">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Automation Performance</CardTitle>
                <CardDescription>
                  Success rates of your automation activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {engagementData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.action}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.success}/{item.count} ({item.successRate}%)
                        </span>
                      </div>
                      <Progress value={item.successRate} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Activity Summary</CardTitle>
                <CardDescription>
                  Your automation activity over the past 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">156</div>
                      <div className="text-sm text-muted-foreground">Likes Today</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">23</div>
                      <div className="text-sm text-muted-foreground">Comments Today</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">45</div>
                      <div className="text-sm text-muted-foreground">Follows Today</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">12</div>
                      <div className="text-sm text-muted-foreground">DMs Today</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Daily Goal Progress</span>
                      <span className="text-sm text-muted-foreground">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Follower Growth Tracking</CardTitle>
              <CardDescription>
                Visualize your follower growth over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">This Week</div>
                  <div className="text-2xl font-bold">+234</div>
                  <div className="text-sm text-green-600">↗ 12% increase</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">This Month</div>
                  <div className="text-2xl font-bold">+1,045</div>
                  <div className="text-sm text-green-600">↗ 8.9% increase</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Average Daily</div>
                  <div className="text-2xl font-bold">+33</div>
                  <div className="text-sm text-green-600">↗ Consistent growth</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Performance */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Posts</CardTitle>
              <CardDescription>
                Your highest engagement posts from the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPosts.map((post, index) => (
                  <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium mb-1">{post.caption}</div>
                      <div className="text-sm text-muted-foreground">
                        Posted on {post.date}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{post.likes}</div>
                        <div className="text-muted-foreground">Likes</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{post.comments}</div>
                        <div className="text-muted-foreground">Comments</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{post.shares}</div>
                        <div className="text-muted-foreground">Shares</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{post.engagement}%</div>
                        <div className="text-muted-foreground">Engagement</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Type Performance</CardTitle>
                <CardDescription>
                  How different content types perform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Reels</span>
                    <div className="flex items-center gap-2">
                      <Progress value={85} className="w-20 h-2" />
                      <span className="text-sm text-muted-foreground">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Carousel Posts</span>
                    <div className="flex items-center gap-2">
                      <Progress value={72} className="w-20 h-2" />
                      <span className="text-sm text-muted-foreground">72%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Single Images</span>
                    <div className="flex items-center gap-2">
                      <Progress value={58} className="w-20 h-2" />
                      <span className="text-sm text-muted-foreground">58%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Stories</span>
                    <div className="flex items-center gap-2">
                      <Progress value={91} className="w-20 h-2" />
                      <span className="text-sm text-muted-foreground">91%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Best Posting Times</CardTitle>
                <CardDescription>
                  When your audience is most active
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">9:00 AM - 11:00 AM</span>
                    <Badge variant="default">Peak</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">1:00 PM - 3:00 PM</span>
                    <Badge variant="secondary">Good</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">7:00 PM - 9:00 PM</span>
                    <Badge variant="default">Peak</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">10:00 PM - 12:00 AM</span>
                    <Badge variant="secondary">Good</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Hashtag Analysis */}
        <TabsContent value="hashtags">
          <Card>
            <CardHeader>
              <CardTitle>Hashtag Performance Analysis</CardTitle>
              <CardDescription>
                Measure reach and engagement per hashtag
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hashtagPerformance.map((hashtag, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="font-medium">{hashtag.hashtag}</div>
                      <Badge variant="outline">{hashtag.posts} posts</Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{hashtag.reach.toLocaleString()}</div>
                        <div className="text-muted-foreground">Reach</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{hashtag.engagement}%</div>
                        <div className="text-muted-foreground">Engagement</div>
                      </div>
                      <div className="w-20">
                        <Progress value={hashtag.engagement * 20} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hashtag Recommendations</CardTitle>
                <CardDescription>
                  Suggested hashtags based on your niche
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">#entrepreneurmindset</span>
                    <Badge variant="outline">High potential</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">#businessgrowth</span>
                    <Badge variant="outline">Trending</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">#wealthbuilding</span>
                    <Badge variant="outline">Low competition</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">#successstory</span>
                    <Badge variant="outline">High engagement</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hashtag Mix Analysis</CardTitle>
                <CardDescription>
                  Your current hashtag strategy breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Popular (1M+ posts)</span>
                    <div className="flex items-center gap-2">
                      <Progress value={30} className="w-20 h-2" />
                      <span className="text-sm text-muted-foreground">30%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Medium (100K-1M posts)</span>
                    <div className="flex items-center gap-2">
                      <Progress value={50} className="w-20 h-2" />
                      <span className="text-sm text-muted-foreground">50%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Niche (10K-100K posts)</span>
                    <div className="flex items-center gap-2">
                      <Progress value={20} className="w-20 h-2" />
                      <span className="text-sm text-muted-foreground">20%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Automation Stats */}
        <TabsContent value="automation">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Automation Efficiency</CardTitle>
                <CardDescription>
                  How well your automation is performing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">94.2%</div>
                    <div className="text-sm text-muted-foreground">Overall Success Rate</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Actions Completed</span>
                      <span className="font-medium">2,847</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Actions Failed</span>
                      <span className="font-medium">164</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Response Time</span>
                      <span className="font-medium">2.3s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Uptime</span>
                      <span className="font-medium">99.1%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Safety Metrics</CardTitle>
                <CardDescription>
                  Monitoring for safe automation practices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Action Rate Compliance</span>
                    <Badge variant="default">Safe</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Daily Limits</span>
                    <Badge variant="default">Within Limits</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Account Health</span>
                    <Badge variant="default">Excellent</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Risk Level</span>
                    <Badge variant="default">Low</Badge>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground mb-2">
                      Actions performed in the last 24 hours
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold">156</div>
                        <div className="text-xs text-muted-foreground">Likes</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">23</div>
                        <div className="text-xs text-muted-foreground">Comments</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">45</div>
                        <div className="text-xs text-muted-foreground">Follows</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">12</div>
                        <div className="text-xs text-muted-foreground">DMs</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>ROI & Growth Impact</CardTitle>
              <CardDescription>
                Measure the return on your automation investment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">+18.5%</div>
                  <div className="text-sm text-muted-foreground">Follower Growth</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">+24.3%</div>
                  <div className="text-sm text-muted-foreground">Engagement Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">+31.2%</div>
                  <div className="text-sm text-muted-foreground">Profile Visits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">+15.7%</div>
                  <div className="text-sm text-muted-foreground">Website Clicks</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
