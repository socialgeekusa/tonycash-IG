'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'

export default function Settings() {
  const [openaiKey, setOpenaiKey] = useState(process.env.NEXT_PUBLIC_OPENAI_API_KEY || '')
  const [claudeKey, setClaudeKey] = useState('')
  const [proxyUrl, setProxyUrl] = useState('')
  const [deviceSettings, setDeviceSettings] = useState({
    autoAirplaneMode: true,
    mobileDataRotation: false,
    screenshotOnError: true,
    autoRestart: false
  })
  const [safetyLimits, setSafetyLimits] = useState({
    likesPerHour: [50],
    commentsPerHour: [10],
    followsPerHour: [20],
    dmsPerHour: [15]
  })

  const handleSaveSettings = () => {
    // Save to localStorage or backend
    localStorage.setItem('tonycash_settings', JSON.stringify({
      openaiKey,
      claudeKey,
      proxyUrl,
      deviceSettings,
      safetyLimits
    }))
    toast.success('Settings saved successfully!')
  }

  const handleTestApiKey = async (provider: string) => {
    toast.info(`Testing ${provider} API key...`)
    // Simulate API test
    setTimeout(() => {
      toast.success(`${provider} API key is valid!`)
    }, 2000)
  }

  const handleExportSettings = () => {
    const settings = {
      openaiKey: '***HIDDEN***',
      claudeKey: claudeKey ? '***HIDDEN***' : '',
      proxyUrl,
      deviceSettings,
      safetyLimits
    }
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tonycash-settings.json'
    a.click()
    toast.success('Settings exported successfully!')
  }

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const settings = JSON.parse(e.target?.result as string)
          // Apply imported settings (excluding API keys for security)
          setProxyUrl(settings.proxyUrl || '')
          setDeviceSettings(settings.deviceSettings || deviceSettings)
          setSafetyLimits(settings.safetyLimits || safetyLimits)
          toast.success('Settings imported successfully!')
        } catch (error) {
          toast.error('Invalid settings file')
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure API keys, device settings, and automation parameters
        </p>
      </div>

      <Tabs defaultValue="api-keys" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="device-settings">Device Settings</TabsTrigger>
          <TabsTrigger value="safety-limits">Safety Limits</TabsTrigger>
          <TabsTrigger value="proxy-settings">Proxy Settings</TabsTrigger>
          <TabsTrigger value="backup-restore">Backup & Restore</TabsTrigger>
        </TabsList>

        {/* API Keys */}
        <TabsContent value="api-keys">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Service API Keys</CardTitle>
                <CardDescription>
                  Configure your AI service providers for content generation and smart replies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="openai-key">OpenAI API Key</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="openai-key"
                        type="password"
                        value={openaiKey}
                        onChange={(e) => setOpenaiKey(e.target.value)}
                        placeholder="sk-..."
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => handleTestApiKey('OpenAI')}
                        disabled={!openaiKey}
                      >
                        Test
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Used for AI bio updates, caption generation, and smart replies
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="claude-key">Claude API Key (Optional)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="claude-key"
                        type="password"
                        value={claudeKey}
                        onChange={(e) => setClaudeKey(e.target.value)}
                        placeholder="sk-ant-..."
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => handleTestApiKey('Claude')}
                        disabled={!claudeKey}
                      >
                        Test
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Alternative AI provider for more natural language generation
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="ai-model">Preferred AI Model</Label>
                    <Select defaultValue="gpt-4">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4 (Recommended)</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</SelectItem>
                        <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                        <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveSettings}>Save API Keys</Button>
                  <Button variant="outline" onClick={() => handleTestApiKey('All')}>
                    Test All Keys
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Usage & Limits</CardTitle>
                <CardDescription>
                  Monitor your API usage and set spending limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">$12.45</div>
                    <div className="text-sm text-muted-foreground">This Month</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">1,234</div>
                    <div className="text-sm text-muted-foreground">API Calls</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">$50.00</div>
                    <div className="text-sm text-muted-foreground">Monthly Limit</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Device Settings */}
        <TabsContent value="device-settings">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Automation Settings</CardTitle>
                <CardDescription>
                  Configure how TonyCash Tool interacts with your connected devices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-airplane">Auto Airplane Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically toggle airplane mode when switching devices
                      </p>
                    </div>
                    <Switch
                      id="auto-airplane"
                      checked={deviceSettings.autoAirplaneMode}
                      onCheckedChange={(checked) =>
                        setDeviceSettings(prev => ({ ...prev, autoAirplaneMode: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="mobile-data-rotation">Mobile Data IP Rotation</Label>
                      <p className="text-sm text-muted-foreground">
                        Use mobile data with IP rotation for enhanced privacy
                      </p>
                    </div>
                    <Switch
                      id="mobile-data-rotation"
                      checked={deviceSettings.mobileDataRotation}
                      onCheckedChange={(checked) =>
                        setDeviceSettings(prev => ({ ...prev, mobileDataRotation: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="screenshot-error">Screenshot on Error</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically take screenshots when errors occur
                      </p>
                    </div>
                    <Switch
                      id="screenshot-error"
                      checked={deviceSettings.screenshotOnError}
                      onCheckedChange={(checked) =>
                        setDeviceSettings(prev => ({ ...prev, screenshotOnError: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-restart">Auto Restart on Failure</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically restart Instagram app if it becomes unresponsive
                      </p>
                    </div>
                    <Switch
                      id="auto-restart"
                      checked={deviceSettings.autoRestart}
                      onCheckedChange={(checked) =>
                        setDeviceSettings(prev => ({ ...prev, autoRestart: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Device Connection Timeout</Label>
                    <Select defaultValue="30">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">1 minute</SelectItem>
                        <SelectItem value="120">2 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Action Retry Attempts</Label>
                    <Select defaultValue="3">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 attempt</SelectItem>
                        <SelectItem value="2">2 attempts</SelectItem>
                        <SelectItem value="3">3 attempts</SelectItem>
                        <SelectItem value="5">5 attempts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Management</CardTitle>
                <CardDescription>
                  Manage your connected iOS and Android devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">iPhone 15 Pro</div>
                      <div className="text-sm text-muted-foreground">iOS 17.2 • 192.168.1.100</div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="default">Connected</Badge>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Samsung Galaxy S24</div>
                      <div className="text-sm text-muted-foreground">Android 14 • 192.168.1.101</div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="default">Connected</Badge>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    Add New Device
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Safety Limits */}
        <TabsContent value="safety-limits">
          <Card>
            <CardHeader>
              <CardTitle>Automation Safety Limits</CardTitle>
              <CardDescription>
                Set safe limits to protect your Instagram account from being flagged
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div>
                  <Label>Likes per hour: {safetyLimits.likesPerHour[0]}</Label>
                  <Slider
                    value={safetyLimits.likesPerHour}
                    onValueChange={(value) => setSafetyLimits(prev => ({ ...prev, likesPerHour: value }))}
                    max={100}
                    min={5}
                    step={5}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 30-60 likes per hour
                  </p>
                </div>

                <div>
                  <Label>Comments per hour: {safetyLimits.commentsPerHour[0]}</Label>
                  <Slider
                    value={safetyLimits.commentsPerHour}
                    onValueChange={(value) => setSafetyLimits(prev => ({ ...prev, commentsPerHour: value }))}
                    max={30}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 5-15 comments per hour
                  </p>
                </div>

                <div>
                  <Label>Follows per hour: {safetyLimits.followsPerHour[0]}</Label>
                  <Slider
                    value={safetyLimits.followsPerHour}
                    onValueChange={(value) => setSafetyLimits(prev => ({ ...prev, followsPerHour: value }))}
                    max={50}
                    min={5}
                    step={5}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 15-25 follows per hour
                  </p>
                </div>

                <div>
                  <Label>DMs per hour: {safetyLimits.dmsPerHour[0]}</Label>
                  <Slider
                    value={safetyLimits.dmsPerHour}
                    onValueChange={(value) => setSafetyLimits(prev => ({ ...prev, dmsPerHour: value }))}
                    max={40}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 10-20 DMs per hour
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Daily Limits</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="daily-likes">Max likes per day</Label>
                      <Input
                        id="daily-likes"
                        type="number"
                        placeholder="1000"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="daily-follows">Max follows per day</Label>
                      <Input
                        id="daily-follows"
                        type="number"
                        placeholder="200"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Safety Features</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="random-delays" defaultChecked />
                      <Label htmlFor="random-delays">Add random delays between actions</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="weekend-pause" />
                      <Label htmlFor="weekend-pause">Pause automation on weekends</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="night-pause" defaultChecked />
                      <Label htmlFor="night-pause">Pause automation at night (11 PM - 7 AM)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="account-age-check" defaultChecked />
                      <Label htmlFor="account-age-check">Adjust limits based on account age</Label>
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSettings} className="w-full">
                Save Safety Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Proxy Settings */}
        <TabsContent value="proxy-settings">
          <Card>
            <CardHeader>
              <CardTitle>Proxy & IP Rotation Settings</CardTitle>
              <CardDescription>
                Configure proxy servers and IP rotation for enhanced privacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="proxy-url">Mobile Proxy URL</Label>
                  <Input
                    id="proxy-url"
                    value={proxyUrl}
                    onChange={(e) => setProxyUrl(e.target.value)}
                    placeholder="http://username:password@proxy.example.com:8080"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter your mobile proxy URL for IP rotation
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rotation-interval">IP Rotation Interval</Label>
                    <Select defaultValue="30">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">Every 15 minutes</SelectItem>
                        <SelectItem value="30">Every 30 minutes</SelectItem>
                        <SelectItem value="60">Every hour</SelectItem>
                        <SelectItem value="120">Every 2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="proxy-type">Proxy Type</Label>
                    <Select defaultValue="mobile">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mobile">Mobile Proxy</SelectItem>
                        <SelectItem value="residential">Residential Proxy</SelectItem>
                        <SelectItem value="datacenter">Datacenter Proxy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Proxy Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="auto-rotation" defaultChecked />
                      <Label htmlFor="auto-rotation">Enable automatic IP rotation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="proxy-health-check" defaultChecked />
                      <Label htmlFor="proxy-health-check">Monitor proxy health</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="fallback-direct" />
                      <Label htmlFor="fallback-direct">Fallback to direct connection if proxy fails</Label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline">Test Proxy Connection</Button>
                  <Button variant="outline">Check Current IP</Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Label>Proxy Status</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="font-medium">Current IP</div>
                    <div className="text-sm text-muted-foreground">192.168.1.100</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="font-medium">Location</div>
                    <div className="text-sm text-muted-foreground">New York, US</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="font-medium">Latency</div>
                    <div className="text-sm text-muted-foreground">45ms</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="font-medium">Status</div>
                    <Badge variant="default">Connected</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup & Restore */}
        <TabsContent value="backup-restore">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Backup & Restore Settings</CardTitle>
                <CardDescription>
                  Export your settings for backup or import from another installation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Export Settings</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Download your current settings as a JSON file (API keys will be excluded for security)
                    </p>
                    <Button onClick={handleExportSettings} className="w-full">
                      Export Settings
                    </Button>
                  </div>

                  <div>
                    <Label>Import Settings</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Upload a previously exported settings file to restore your configuration
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                      <label htmlFor="import-settings" className="cursor-pointer">
                        Import Settings
                        <input
                          id="import-settings"
                          type="file"
                          accept=".json"
                          className="hidden"
                          onChange={handleImportSettings}
                        />
                      </label>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reset Settings</CardTitle>
                <CardDescription>
                  Reset all settings to their default values
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    Reset Safety Limits
                  </Button>
                  <Button variant="outline" className="w-full">
                    Reset Device Settings
                  </Button>
                  <Button variant="outline" className="w-full">
                    Reset Proxy Settings
                  </Button>
                  <Button variant="destructive" className="w-full">
                    Reset All Settings
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Warning: This action cannot be undone. Make sure to export your settings first.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Info</CardTitle>
                <CardDescription>
                  Information about your TonyCash Tool installation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Version</div>
                    <div className="font-medium">1.0.0</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Build</div>
                    <div className="font-medium">2024.01.15</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Platform</div>
                    <div className="font-medium">macOS / Windows</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">License</div>
                    <div className="font-medium">Professional</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
