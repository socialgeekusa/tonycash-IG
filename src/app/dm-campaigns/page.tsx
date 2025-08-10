'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'

export default function DMCampaigns() {
  const [campaignName, setCampaignName] = useState('')
  const [messageTemplate, setMessageTemplate] = useState('')
  const [targetList, setTargetList] = useState('')
  const [followUpMessage, setFollowUpMessage] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [campaignProgress, setCampaignProgress] = useState(0)
  const [messagesPerHour, setMessagesPerHour] = useState([30])
  const [followUpDelay, setFollowUpDelay] = useState([24])

  const activeCampaigns = [
    {
      id: 1,
      name: 'Entrepreneur Outreach',
      status: 'running',
      sent: 156,
      total: 500,
      replies: 23,
      progress: 31
    },
    {
      id: 2,
      name: 'Fitness Influencers',
      status: 'paused',
      sent: 89,
      total: 200,
      replies: 12,
      progress: 45
    },
    {
      id: 3,
      name: 'Business Owners',
      status: 'completed',
      sent: 300,
      total: 300,
      replies: 45,
      progress: 100
    }
  ]

  const handleStartCampaign = () => {
    if (!campaignName || !messageTemplate || !targetList) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsRunning(true)
    toast.success('DM Campaign started successfully!')
    
    // Simulate campaign progress
    const interval = setInterval(() => {
      setCampaignProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsRunning(false)
          toast.success('Campaign completed!')
          return 100
        }
        return prev + 2
      })
    }, 1000)
  }

  const handlePauseCampaign = () => {
    setIsRunning(false)
    toast.info('Campaign paused')
  }

  const handleImportTargets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      toast.success(`Imported ${file.name} successfully`)
      setTargetList('Imported 250 targets from CSV file')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">DM Campaigns</h1>
        <p className="text-muted-foreground">
          Send mass direct messages and manage follow-up sequences
        </p>
      </div>

      <Tabs defaultValue="create-campaign" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create-campaign">Create Campaign</TabsTrigger>
          <TabsTrigger value="active-campaigns">Active Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Message Templates</TabsTrigger>
          <TabsTrigger value="target-lists">Target Lists</TabsTrigger>
        </TabsList>

        {/* Create Campaign */}
        <TabsContent value="create-campaign">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Setup</CardTitle>
                <CardDescription>
                  Configure your DM campaign settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="campaign-name">Campaign Name</Label>
                  <Input
                    id="campaign-name"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g., Entrepreneur Outreach Q1"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="message-template">Message Template</Label>
                  <Textarea
                    id="message-template"
                    value={messageTemplate}
                    onChange={(e) => setMessageTemplate(e.target.value)}
                    placeholder="Hi {name}! I noticed you're into {niche}. I'd love to connect and share some insights that might help your business grow. Are you open to a quick chat?"
                    className="mt-1 h-32"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use variables: {"{name}"}, {"{niche}"}, {"{followers}"}, {"{posts}"}
                  </p>
                </div>

                <div>
                  <Label htmlFor="target-list">Target List</Label>
                  <Textarea
                    id="target-list"
                    value={targetList}
                    onChange={(e) => setTargetList(e.target.value)}
                    placeholder="@username1, @username2, @username3..."
                    className="mt-1 h-24"
                  />
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" asChild>
                      <label htmlFor="csv-upload" className="cursor-pointer">
                        Import CSV
                        <input
                          id="csv-upload"
                          type="file"
                          accept=".csv"
                          className="hidden"
                          onChange={handleImportTargets}
                        />
                      </label>
                    </Button>
                    <Button variant="outline" size="sm">
                      Import from Followers
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Messages per hour: {messagesPerHour[0]}</Label>
                    <Slider
                      value={messagesPerHour}
                      onValueChange={setMessagesPerHour}
                      max={60}
                      min={5}
                      step={5}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 20-40 messages per hour for safety
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Campaign Options</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="personalize-messages" defaultChecked />
                        <Label htmlFor="personalize-messages">Personalize messages</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="skip-followers" />
                        <Label htmlFor="skip-followers">Skip existing followers</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="random-delays" defaultChecked />
                        <Label htmlFor="random-delays">Add random delays</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Follow-up Sequence</CardTitle>
                <CardDescription>
                  Automated follow-up messages for non-responders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch id="enable-followup" />
                  <Label htmlFor="enable-followup">Enable follow-up messages</Label>
                </div>

                <div>
                  <Label>Follow-up delay: {followUpDelay[0]} hours</Label>
                  <Slider
                    value={followUpDelay}
                    onValueChange={setFollowUpDelay}
                    max={168}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="followup-message">Follow-up Message</Label>
                  <Textarea
                    id="followup-message"
                    value={followUpMessage}
                    onChange={(e) => setFollowUpMessage(e.target.value)}
                    placeholder="Hey {name}! Just wanted to follow up on my previous message. I have some great insights that could really help your {niche} business. Let me know if you're interested!"
                    className="mt-1 h-24"
                  />
                </div>

                <div>
                  <Label htmlFor="max-followups">Maximum follow-ups</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select max follow-ups" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 follow-up</SelectItem>
                      <SelectItem value="2">2 follow-ups</SelectItem>
                      <SelectItem value="3">3 follow-ups</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Follow-up Conditions</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="followup-no-reply" defaultChecked />
                      <Label htmlFor="followup-no-reply">No reply after 24h</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="followup-seen" />
                      <Label htmlFor="followup-seen">Message seen but no reply</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Preview</CardTitle>
              <CardDescription>
                Review your campaign before launching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Target Count</div>
                  <div className="text-2xl font-bold">
                    {targetList.split(',').filter(t => t.trim()).length}
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Estimated Duration</div>
                  <div className="text-2xl font-bold">
                    {Math.ceil(targetList.split(',').filter(t => t.trim()).length / messagesPerHour[0])}h
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Messages/Hour</div>
                  <div className="text-2xl font-bold">{messagesPerHour[0]}</div>
                </div>
              </div>

              {isRunning && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Campaign Progress</span>
                    <span className="text-sm text-muted-foreground">{campaignProgress}%</span>
                  </div>
                  <Progress value={campaignProgress} className="h-2" />
                </div>
              )}

              <div className="flex gap-2">
                {!isRunning ? (
                  <Button onClick={handleStartCampaign} className="flex-1">
                    Launch Campaign
                  </Button>
                ) : (
                  <Button onClick={handlePauseCampaign} variant="destructive" className="flex-1">
                    Pause Campaign
                  </Button>
                )}
                <Button variant="outline">Save Draft</Button>
                <Button variant="outline">Test Message</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Campaigns */}
        <TabsContent value="active-campaigns">
          <div className="space-y-4">
            {activeCampaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      <CardDescription>
                        {campaign.sent}/{campaign.total} messages sent • {campaign.replies} replies
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        campaign.status === 'running' ? 'default' :
                        campaign.status === 'paused' ? 'secondary' : 'outline'
                      }
                    >
                      {campaign.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">{campaign.progress}%</span>
                      </div>
                      <Progress value={campaign.progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{campaign.sent}</div>
                        <div className="text-xs text-muted-foreground">Sent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{campaign.replies}</div>
                        <div className="text-xs text-muted-foreground">Replies</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {Math.round((campaign.replies / campaign.sent) * 100)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Reply Rate</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {campaign.status === 'running' ? (
                        <Button variant="outline" size="sm">Pause</Button>
                      ) : campaign.status === 'paused' ? (
                        <Button size="sm">Resume</Button>
                      ) : null}
                      <Button variant="outline" size="sm">View Details</Button>
                      <Button variant="outline" size="sm">Export Results</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Message Templates */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>
                Pre-built and custom message templates with spintax support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium mb-2">Business Networking</div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Hi {"{name}"}! I love your content about {"{niche}"}. I'd love to connect and share some insights that might help your business grow. Are you open to a quick chat?
                    </p>
                    <Button size="sm" variant="outline">Use Template</Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="font-medium mb-2">Collaboration Outreach</div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Hey {"{name}"}! I noticed we're both in the {"{niche}"} space. I have an idea for a collaboration that could benefit both our audiences. Interested in hearing more?
                    </p>
                    <Button size="sm" variant="outline">Use Template</Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="font-medium mb-2">Value-First Approach</div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Hi {"{name}"}! I came across your profile and was impressed by your {"{niche}"} content. I have a free resource that I think would be perfect for your audience. Can I share it with you?
                    </p>
                    <Button size="sm" variant="outline">Use Template</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="custom-template">Create Custom Template</Label>
                    <Textarea
                      id="custom-template"
                      placeholder="Create your own message template with variables..."
                      className="mt-1 h-32"
                    />
                  </div>

                  <div>
                    <Label>Available Variables</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Badge variant="outline">{"{name}"}</Badge>
                      <Badge variant="outline">{"{niche}"}</Badge>
                      <Badge variant="outline">{"{followers}"}</Badge>
                      <Badge variant="outline">{"{posts}"}</Badge>
                      <Badge variant="outline">{"{bio}"}</Badge>
                      <Badge variant="outline">{"{location}"}</Badge>
                    </div>
                  </div>

                  <div>
                    <Label>Spintax Examples</Label>
                    <div className="text-sm text-muted-foreground space-y-1 mt-2">
                      <p>{"{Hi|Hey|Hello}"} {"{name}"}!</p>
                      <p>I {"{love|really like|am impressed by}"} your content</p>
                      <p>{"{Would you be|Are you}"} interested in {"{chatting|connecting}"}?</p>
                    </div>
                  </div>

                  <Button>Save Template</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Target Lists */}
        <TabsContent value="target-lists">
          <Card>
            <CardHeader>
              <CardTitle>Target Lists Management</CardTitle>
              <CardDescription>
                Import, manage, and organize your DM target lists
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Import Methods</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      <Button variant="outline" asChild>
                        <label htmlFor="csv-import" className="cursor-pointer">
                          Import CSV File
                          <input
                            id="csv-import"
                            type="file"
                            accept=".csv"
                            className="hidden"
                          />
                        </label>
                      </Button>
                      <Button variant="outline">Import from Followers</Button>
                      <Button variant="outline">Import from Following</Button>
                      <Button variant="outline">Import from Hashtag</Button>
                      <Button variant="outline">Import from Competitors</Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="manual-list">Manual Entry</Label>
                    <Textarea
                      id="manual-list"
                      placeholder="@username1&#10;@username2&#10;@username3"
                      className="mt-1 h-32"
                    />
                    <Button className="mt-2 w-full">Add to List</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Saved Lists</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Entrepreneurs</div>
                          <div className="text-sm text-muted-foreground">1,234 targets</div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline">Export</Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Fitness Influencers</div>
                          <div className="text-sm text-muted-foreground">567 targets</div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline">Export</Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Tech Startups</div>
                          <div className="text-sm text-muted-foreground">890 targets</div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline">Export</Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>List Filters</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="filter-verified" />
                        <Label htmlFor="filter-verified">Only verified accounts</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="filter-business" />
                        <Label htmlFor="filter-business">Only business accounts</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="filter-active" />
                        <Label htmlFor="filter-active">Only active accounts (posted in last 30 days)</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
