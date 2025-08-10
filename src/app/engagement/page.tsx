'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'

export default function SmartEngagement() {
  const [autoLikeEnabled, setAutoLikeEnabled] = useState(false)
  const [autoCommentEnabled, setAutoCommentEnabled] = useState(false)
  const [autoFollowEnabled, setAutoFollowEnabled] = useState(false)
  const [followBackEnabled, setFollowBackEnabled] = useState(true)
  const [storyViewerEnabled, setStoryViewerEnabled] = useState(false)
  const [commentReplierEnabled, setCommentReplierEnabled] = useState(false)

  const [likesPerHour, setLikesPerHour] = useState([50])
  const [commentsPerHour, setCommentsPerHour] = useState([10])
  const [followsPerHour, setFollowsPerHour] = useState([20])

  const [commentTemplates, setCommentTemplates] = useState([
    "Great content! 🔥",
    "Love this! 💯",
    "Amazing work! 👏",
    "This is inspiring! ✨"
  ])

  // Username targeting state
  const [likeTargetUsernames, setLikeTargetUsernames] = useState('')
  const [commentTargetUsernames, setCommentTargetUsernames] = useState('')
  const [followTargetUsernames, setFollowTargetUsernames] = useState('')
  const [storyTargetUsernames, setStoryTargetUsernames] = useState('')

  // Device and automation state
  const [devices, setDevices] = useState<any[]>([])
  const [currentDevice, setCurrentDevice] = useState<any>(null)
  const [isRunningTest, setIsRunningTest] = useState(false)
  const [isRunningAutomation, setIsRunningAutomation] = useState(false)
  const [instagramAccounts, setInstagramAccounts] = useState<any[]>([])
  const [selectedInstagramAccount, setSelectedInstagramAccount] = useState<string>('')

  // Hashtag and location state
  const [likeHashtags, setLikeHashtags] = useState('')
  const [likeLocations, setLikeLocations] = useState('')

  // Load devices and Instagram accounts on component mount
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch('/api/devices/detect')
        const data = await response.json()
        if (data.success && data.devices) {
          setDevices(data.devices)
          const connectedDevice = data.devices.find((d: any) => d.status === 'connected')
          if (connectedDevice) {
            setCurrentDevice(connectedDevice)
            // Fetch Instagram accounts for the connected device
            fetchInstagramAccounts(connectedDevice.id)
          }
        }
      } catch (error) {
        console.error('Failed to fetch devices:', error)
      }
    }

    const fetchInstagramAccounts = async (deviceId: string) => {
      try {
        const response = await fetch(`/api/devices/instagram-accounts?deviceId=${deviceId}`)
        const data = await response.json()
        if (data.success && data.accounts) {
          setInstagramAccounts(data.accounts)
          // Auto-select the first active account
          const activeAccount = data.accounts.find((acc: any) => acc.isActive)
          if (activeAccount) {
            setSelectedInstagramAccount(activeAccount.username)
          }
        }
      } catch (error) {
        console.error('Failed to fetch Instagram accounts:', error)
      }
    }

    fetchDevices()
  }, [])

  const handleToggleFeature = (feature: string, enabled: boolean) => {
    toast.success(`${feature} ${enabled ? 'enabled' : 'disabled'}`)
  }

  // Username formatting utilities
  const formatUsernames = (input: string): string[] => {
    return input
      .split(',')
      .map(username => username.trim().replace('@', ''))
      .filter(username => username.length > 0)
  }

  const validateUsername = (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9._]{1,30}$/
    return usernameRegex.test(username)
  }

  const handleSaveSettings = () => {
    toast.success('Engagement settings saved successfully!')
  }

  // Test run functionality
  const handleTestRun = async (feature: 'like' | 'comment' | 'follow' | 'story_view') => {
    if (!currentDevice) {
      toast.error('No Device Connected', {
        description: 'Please connect your device first in the Device Controller',
      })
      return
    }

    setIsRunningTest(true)

    try {
      let targets: string[] = []
      let parameters: any = {
        deviceId: currentDevice.id,
        delay: 30000, // 30 second delay between actions
        count: 3 // Test with 3 actions only
      }

      // Get targets based on feature
      switch (feature) {
        case 'like':
          if (likeTargetUsernames) {
            targets = formatUsernames(likeTargetUsernames)
          }
          if (likeHashtags) {
            parameters.hashtags = likeHashtags.split(',').map(h => h.trim())
          }
          if (likeLocations) {
            parameters.locations = likeLocations.split(',').map(l => l.trim())
          }
          parameters.likesPerHour = likesPerHour[0]
          break
        case 'comment':
          if (commentTargetUsernames) {
            targets = formatUsernames(commentTargetUsernames)
          }
          parameters.comment = commentTemplates[0] || "Great content! 🔥"
          parameters.commentsPerHour = commentsPerHour[0]
          break
        case 'follow':
          if (followTargetUsernames) {
            targets = formatUsernames(followTargetUsernames)
          }
          parameters.followsPerHour = followsPerHour[0]
          break
        case 'story_view':
          if (storyTargetUsernames) {
            targets = formatUsernames(storyTargetUsernames)
          }
          break
      }

      if (targets.length === 0) {
        toast.warning('No Targets Specified', {
          description: 'Please add target usernames, hashtags, or locations to test',
        })
        setIsRunningTest(false)
        return
      }

      // Validate usernames
      const invalidUsernames = targets.filter(username => !validateUsername(username))
      if (invalidUsernames.length > 0) {
        toast.error('Invalid Usernames', {
          description: `Invalid usernames: ${invalidUsernames.join(', ')}`,
        })
        setIsRunningTest(false)
        return
      }

      // Call automation API
      const response = await fetch('/api/automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feature,
          action: 'start',
          parameters: {
            ...parameters,
            targets: targets.slice(0, 3), // Limit to 3 for testing
            testMode: true,
            instagramUsername: selectedInstagramAccount // Include selected Instagram account
          }
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Test Run Started!', {
          description: `Testing ${feature} automation on ${targets.slice(0, 3).join(', ')}. Check your device!`,
        })
      } else {
        toast.error('Test Run Failed', {
          description: result.error || 'Unknown error occurred',
        })
      }

    } catch (error) {
      toast.error('Test Run Error', {
        description: 'Failed to start test run. Please try again.',
      })
      console.error('Test run error:', error)
    } finally {
      setIsRunningTest(false)
    }
  }

  // Start unified automation for all enabled features
  const handleStartAutomation = async () => {
    if (!currentDevice) {
      toast.error('No Device Connected', {
        description: 'Please connect your device first in the Device Controller',
      })
      return
    }

    // Check if at least one feature is enabled
    const enabledFeatures = []
    if (autoLikeEnabled) enabledFeatures.push('like')
    if (autoCommentEnabled) enabledFeatures.push('comment')
    if (autoFollowEnabled) enabledFeatures.push('follow')
    if (storyViewerEnabled) enabledFeatures.push('story_view')

    if (enabledFeatures.length === 0) {
      toast.warning('No Features Enabled', {
        description: 'Please enable at least one automation feature (Auto Like, Auto Comment, Auto Follow, or Story Viewer)',
      })
      return
    }

    // Instagram account is optional - will use current active account if not specified
    if (!selectedInstagramAccount) {
      toast.info('Using Current Instagram Account', {
        description: 'No specific account selected - will use the currently active Instagram account on device',
      })
    }

    setIsRunningAutomation(true)

    try {
      // Collect all targets from all enabled features
      let allTargets: string[] = []
      let allHashtags: string[] = []
      let allLocations: string[] = []

      // Collect targets from enabled features
      if (autoLikeEnabled && likeTargetUsernames) {
        allTargets = [...allTargets, ...formatUsernames(likeTargetUsernames)]
      }
      if (autoCommentEnabled && commentTargetUsernames) {
        allTargets = [...allTargets, ...formatUsernames(commentTargetUsernames)]
      }
      if (autoFollowEnabled && followTargetUsernames) {
        allTargets = [...allTargets, ...formatUsernames(followTargetUsernames)]
      }
      if (storyViewerEnabled && storyTargetUsernames) {
        allTargets = [...allTargets, ...formatUsernames(storyTargetUsernames)]
      }

      // Collect hashtags and locations
      if (likeHashtags) {
        allHashtags = [...allHashtags, ...likeHashtags.split(',').map(h => h.trim())]
      }
      if (likeLocations) {
        allLocations = [...allLocations, ...likeLocations.split(',').map(l => l.trim())]
      }

      // Remove duplicates
      allTargets = [...new Set(allTargets)]
      allHashtags = [...new Set(allHashtags)]
      allLocations = [...new Set(allLocations)]

      if (allTargets.length === 0 && allHashtags.length === 0 && allLocations.length === 0) {
        toast.warning('No Targets Specified', {
          description: 'Please add target usernames, hashtags, or locations in the enabled features',
        })
        setIsRunningAutomation(false)
        return
      }

      // Prepare unified automation parameters
      const parameters = {
        deviceId: currentDevice.id,
        instagramUsername: selectedInstagramAccount,
        continuous: true,
        enabledFeatures: enabledFeatures,
        targets: allTargets,
        hashtags: allHashtags,
        locations: allLocations,
        // Feature-specific settings
        likesPerHour: autoLikeEnabled ? likesPerHour[0] : 0,
        commentsPerHour: autoCommentEnabled ? commentsPerHour[0] : 0,
        followsPerHour: autoFollowEnabled ? followsPerHour[0] : 0,
        commentTemplates: autoCommentEnabled ? commentTemplates : [],
        testMode: false
      }

      // Call unified automation API
      const response = await fetch('/api/automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feature: 'unified',
          action: 'start',
          parameters: parameters
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Unified Automation Started!', {
          description: `Running ${enabledFeatures.join(', ')} automation on ${allTargets.length} usernames, ${allHashtags.length} hashtags, ${allLocations.length} locations. Device will unlock and start engaging!`,
        })
      } else {
        toast.error('Automation Failed', {
          description: result.error || 'Unknown error occurred',
        })
        setIsRunningAutomation(false)
      }

    } catch (error) {
      toast.error('Automation Error', {
        description: 'Failed to start automation. Please try again.',
      })
      console.error('Automation error:', error)
      setIsRunningAutomation(false)
    }
  }

  // Stop automation
  const handleStopAutomation = async () => {
    try {
      const response = await fetch('/api/automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feature: 'unified',
          action: 'stop',
          parameters: { deviceId: currentDevice?.id }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('Automation Stopped', {
          description: 'All automation features have been stopped',
        })
      }
    } catch (error) {
      console.error('Stop automation error:', error)
    } finally {
      setIsRunningAutomation(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Smart Engagement Engine</h1>
        <p className="text-muted-foreground">
          Automate likes, comments, follows, and story interactions
        </p>
        
        {/* Device Status */}
        <div className="mt-4 p-3 border rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${currentDevice ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">
                Device Status: {currentDevice ? `Connected (${currentDevice.id})` : 'Not Connected'}
              </span>
            </div>
            {!currentDevice && (
              <Badge variant="destructive">
                Connect device in Device Controller
              </Badge>
            )}
          </div>
          
          {/* Instagram Account Selector */}
          {currentDevice && instagramAccounts.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center space-x-4">
                <Label htmlFor="instagram-account" className="text-sm font-medium">
                  Active Instagram Account:
                </Label>
                <select
                  id="instagram-account"
                  value={selectedInstagramAccount}
                  onChange={(e) => setSelectedInstagramAccount(e.target.value)}
                  className="px-3 py-1 border rounded-md text-sm bg-background"
                >
                  <option value="">Select Account</option>
                  {instagramAccounts.map((account: any) => (
                    <option key={account.username} value={account.username}>
                      @{account.username} {account.isActive ? '(Active)' : ''}
                    </option>
                  ))}
                </select>
                {selectedInstagramAccount && (
                  <Badge variant="outline" className="text-xs">
                    Will switch to @{selectedInstagramAccount}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Unified Automation Control Panel */}
        <div className="mt-4 p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Unified Automation Control</h3>
              <p className="text-sm text-muted-foreground">
                Enable features below, then click "Start Automation" to run all enabled features together
              </p>
            </div>
            <div className="flex gap-2">
              {!isRunningAutomation ? (
                <Button 
                  onClick={handleStartAutomation}
                  disabled={isRunningTest || !currentDevice}
                  className="bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  🚀 Start Automation
                </Button>
              ) : (
                <Button 
                  onClick={handleStopAutomation}
                  className="bg-red-600 hover:bg-red-700"
                  size="lg"
                >
                  ⏹️ Stop Automation
                </Button>
              )}
            </div>
          </div>
          
          {/* Feature Status Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className={`p-3 rounded-lg border ${autoLikeEnabled ? 'bg-green-100 border-green-300' : 'bg-gray-100 border-gray-300'}`}>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${autoLikeEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm font-medium">Auto Like</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {autoLikeEnabled ? `${likesPerHour[0]}/hour` : 'Disabled'}
              </p>
            </div>
            
            <div className={`p-3 rounded-lg border ${autoCommentEnabled ? 'bg-green-100 border-green-300' : 'bg-gray-100 border-gray-300'}`}>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${autoCommentEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm font-medium">Auto Comment</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {autoCommentEnabled ? `${commentsPerHour[0]}/hour` : 'Disabled'}
              </p>
            </div>
            
            <div className={`p-3 rounded-lg border ${autoFollowEnabled ? 'bg-green-100 border-green-300' : 'bg-gray-100 border-gray-300'}`}>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${autoFollowEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm font-medium">Auto Follow</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {autoFollowEnabled ? `${followsPerHour[0]}/hour` : 'Disabled'}
              </p>
            </div>
            
            <div className={`p-3 rounded-lg border ${storyViewerEnabled ? 'bg-green-100 border-green-300' : 'bg-gray-100 border-gray-300'}`}>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${storyViewerEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm font-medium">Story Viewer</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {storyViewerEnabled ? 'Active' : 'Disabled'}
              </p>
            </div>
          </div>
          
          {isRunningAutomation && (
            <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-800">
                  Automation is running - Device will unlock, open Instagram, and engage with targets
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="auto-like" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="auto-like">Auto Like</TabsTrigger>
          <TabsTrigger value="auto-comment">Auto Comment</TabsTrigger>
          <TabsTrigger value="auto-follow">Auto Follow</TabsTrigger>
          <TabsTrigger value="follow-back">Follow Back</TabsTrigger>
          <TabsTrigger value="story-viewer">Story Viewer</TabsTrigger>
          <TabsTrigger value="comment-replier">Comment Replier</TabsTrigger>
        </TabsList>

        {/* Auto Like Tab */}
        <TabsContent value="auto-like">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Auto Like Posts</CardTitle>
                  <CardDescription>
                    Automatically like posts, stories, and reels to increase visibility
                  </CardDescription>
                </div>
                <Switch
                  checked={autoLikeEnabled}
                  onCheckedChange={(checked) => {
                    setAutoLikeEnabled(checked)
                    handleToggleFeature('Auto Like', checked)
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Likes per hour: {likesPerHour[0]}</Label>
                  <Slider
                    value={likesPerHour}
                    onValueChange={setLikesPerHour}
                    max={100}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 30-60 likes per hour for safety
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="like-hashtags">Target Hashtags</Label>
                    <Input
                      id="like-hashtags"
                      value={likeHashtags}
                      onChange={(e) => setLikeHashtags(e.target.value)}
                      placeholder="#entrepreneur #business #success"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="like-locations">Target Locations</Label>
                    <Input
                      id="like-locations"
                      value={likeLocations}
                      onChange={(e) => setLikeLocations(e.target.value)}
                      placeholder="New York, Los Angeles, Miami"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="like-usernames">Target Usernames</Label>
                    <Input
                      id="like-usernames"
                      value={likeTargetUsernames}
                      onChange={(e) => setLikeTargetUsernames(e.target.value)}
                      placeholder="@user1, @user2, @user3"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter usernames separated by commas
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="like-stories" />
                  <Label htmlFor="like-stories">Also like stories</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="like-reels" />
                  <Label htmlFor="like-reels">Also like reels</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveSettings}>Save Settings</Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleTestRun('like')}
                  disabled={isRunningTest || isRunningAutomation}
                >
                  {isRunningTest ? 'Running Test...' : 'Test Run'}
                </Button>
                <Button 
                  onClick={handleStartAutomation}
                  disabled={isRunningTest || isRunningAutomation || !currentDevice}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isRunningAutomation ? 'Automation Running...' : 'Start Automation'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auto Comment Tab */}
        <TabsContent value="auto-comment">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Auto Comment</CardTitle>
                  <CardDescription>
                    Leave custom, thoughtful comments on target audience's posts
                  </CardDescription>
                </div>
                <Switch
                  checked={autoCommentEnabled}
                  onCheckedChange={(checked) => {
                    setAutoCommentEnabled(checked)
                    handleToggleFeature('Auto Comment', checked)
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Comments per hour: {commentsPerHour[0]}</Label>
                  <Slider
                    value={commentsPerHour}
                    onValueChange={setCommentsPerHour}
                    max={30}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 5-15 comments per hour for safety
                  </p>
                </div>

                <div>
                  <Label>Comment Templates</Label>
                  <Textarea
                    value={commentTemplates.join('\n')}
                    onChange={(e) => setCommentTemplates(e.target.value.split('\n').filter(t => t.trim()))}
                    placeholder="Enter comment templates, one per line"
                    className="mt-1 h-32"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use spintax: {"{Great|Amazing|Awesome}"} content!
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="comment-hashtags">Target Hashtags</Label>
                    <Input
                      id="comment-hashtags"
                      placeholder="#entrepreneur #business #success"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="comment-users">Target Usernames</Label>
                    <Input
                      id="comment-users"
                      value={commentTargetUsernames}
                      onChange={(e) => setCommentTargetUsernames(e.target.value)}
                      placeholder="@user1, @user2, @user3"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter usernames separated by commas
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="comment-delay" />
                  <Label htmlFor="comment-delay">Add random delays (1-5 minutes)</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveSettings}>Save Settings</Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleTestRun('comment')}
                  disabled={isRunningTest || isRunningAutomation}
                >
                  {isRunningTest ? 'Running Test...' : 'Test Run'}
                </Button>
                <Button 
                  onClick={handleStartAutomation}
                  disabled={isRunningTest || isRunningAutomation || !currentDevice}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isRunningAutomation ? 'Automation Running...' : 'Start Automation'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auto Follow Tab */}
        <TabsContent value="auto-follow">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Auto Follow / Unfollow</CardTitle>
                  <CardDescription>
                    Follow niche-relevant users and unfollow non-engagers
                  </CardDescription>
                </div>
                <Switch
                  checked={autoFollowEnabled}
                  onCheckedChange={(checked) => {
                    setAutoFollowEnabled(checked)
                    handleToggleFeature('Auto Follow', checked)
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Follows per hour: {followsPerHour[0]}</Label>
                  <Slider
                    value={followsPerHour}
                    onValueChange={setFollowsPerHour}
                    max={50}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 15-25 follows per hour for safety
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="follow-competitors">Competitor Accounts</Label>
                    <Input
                      id="follow-competitors"
                      placeholder="@competitor1 @competitor2"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="follow-hashtags">Target Hashtags</Label>
                    <Input
                      id="follow-hashtags"
                      placeholder="#entrepreneur #business"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="follow-usernames">Target Usernames</Label>
                    <Input
                      id="follow-usernames"
                      value={followTargetUsernames}
                      onChange={(e) => setFollowTargetUsernames(e.target.value)}
                      placeholder="@user1, @user2, @user3"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Direct username targeting for follows
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Follow Strategy</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="follow-followers" defaultChecked />
                      <Label htmlFor="follow-followers">Follow followers of competitors</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="follow-followings" />
                      <Label htmlFor="follow-followings">Follow accounts that competitors follow</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="follow-hashtag-users" />
                      <Label htmlFor="follow-hashtag-users">Follow users posting with target hashtags</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Auto Unfollow Settings</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="unfollow-days">Unfollow after (days)</Label>
                      <Input
                        id="unfollow-days"
                        type="number"
                        placeholder="7"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="unfollow-limit">Daily unfollow limit</Label>
                      <Input
                        id="unfollow-limit"
                        type="number"
                        placeholder="50"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveSettings}>Save Settings</Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleTestRun('follow')}
                  disabled={isRunningTest || isRunningAutomation}
                >
                  {isRunningTest ? 'Running Test...' : 'Test Run'}
                </Button>
                <Button 
                  onClick={handleStartAutomation}
                  disabled={isRunningTest || isRunningAutomation || !currentDevice}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isRunningAutomation ? 'Automation Running...' : 'Start Automation'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Follow Back Tab */}
        <TabsContent value="follow-back">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Follow Back</CardTitle>
                  <CardDescription>
                    Automatically follow anyone who follows you
                  </CardDescription>
                </div>
                <Switch
                  checked={followBackEnabled}
                  onCheckedChange={(checked) => {
                    setFollowBackEnabled(checked)
                    handleToggleFeature('Follow Back', checked)
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="instant-followback" defaultChecked />
                  <Label htmlFor="instant-followback">Follow back instantly</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="delay-followback" />
                  <Label htmlFor="delay-followback">Add random delay (1-30 minutes)</Label>
                </div>

                <div>
                  <Label>Quality Filters</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="filter-private" />
                      <Label htmlFor="filter-private">Skip private accounts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="filter-no-posts" />
                      <Label htmlFor="filter-no-posts">Skip accounts with no posts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="filter-low-followers" />
                      <Label htmlFor="filter-low-followers">Skip accounts with less than 10 followers</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveSettings}>Save Settings</Button>
                <Button variant="outline">View Pending</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Story Viewer Tab */}
        <TabsContent value="story-viewer">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Story Viewer + Liker</CardTitle>
                  <CardDescription>
                    View and like targeted users' stories to increase profile visits
                  </CardDescription>
                </div>
                <Switch
                  checked={storyViewerEnabled}
                  onCheckedChange={(checked) => {
                    setStoryViewerEnabled(checked)
                    handleToggleFeature('Story Viewer', checked)
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="story-hashtags">Target Hashtags</Label>
                    <Input
                      id="story-hashtags"
                      placeholder="#entrepreneur #business"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="story-users">Target Usernames</Label>
                    <Input
                      id="story-users"
                      value={storyTargetUsernames}
                      onChange={(e) => setStoryTargetUsernames(e.target.value)}
                      placeholder="@user1, @user2, @user3"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter usernames to view their stories
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Story Actions</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="view-stories" defaultChecked />
                      <Label htmlFor="view-stories">View stories</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="like-stories-tab" />
                      <Label htmlFor="like-stories-tab">Like stories (when possible)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="react-stories" />
                      <Label htmlFor="react-stories">React to stories with emojis</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="stories-per-hour">Stories to view per hour</Label>
                  <Input
                    id="stories-per-hour"
                    type="number"
                    placeholder="30"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveSettings}>Save Settings</Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleTestRun('story_view')}
                  disabled={isRunningTest || isRunningAutomation}
                >
                  {isRunningTest ? 'Running Test...' : 'Test Run'}
                </Button>
                <Button 
                  onClick={handleStartAutomation}
                  disabled={isRunningTest || isRunningAutomation || !currentDevice}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isRunningAutomation ? 'Automation Running...' : 'Start Automation'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comment Replier Tab */}
        <TabsContent value="comment-replier">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Comment Replier</CardTitle>
                  <CardDescription>
                    Reply to comments instantly with custom or spintax templates
                  </CardDescription>
                </div>
                <Switch
                  checked={commentReplierEnabled}
                  onCheckedChange={(checked) => {
                    setCommentReplierEnabled(checked)
                    handleToggleFeature('Comment Replier', checked)
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Reply Templates</Label>
                  <Textarea
                    placeholder="Thank you! 🙏&#10;Appreciate it! 💯&#10;{Thanks|Thank you} so much! ❤️"
                    className="mt-1 h-32"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use spintax for variety: {"{Thanks|Thank you|Appreciate it}"}!
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Reply Settings</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="reply-all" />
                      <Label htmlFor="reply-all">Reply to all comments</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="reply-questions" defaultChecked />
                      <Label htmlFor="reply-questions">Only reply to questions</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="reply-positive" />
                      <Label htmlFor="reply-positive">Only reply to positive comments</Label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reply-delay-min">Min delay (minutes)</Label>
                    <Input
                      id="reply-delay-min"
                      type="number"
                      placeholder="1"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reply-delay-max">Max delay (minutes)</Label>
                    <Input
                      id="reply-delay-max"
                      type="number"
                      placeholder="10"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveSettings}>Save Settings</Button>
                <Button variant="outline">Test Replies</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Status</CardTitle>
          <CardDescription>
            Current status of all engagement features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Auto Like</span>
              <Badge variant={autoLikeEnabled ? "default" : "secondary"}>
                {autoLikeEnabled ? "ON" : "OFF"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Auto Comment</span>
              <Badge variant={autoCommentEnabled ? "default" : "secondary"}>
                {autoCommentEnabled ? "ON" : "OFF"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Auto Follow</span>
              <Badge variant={autoFollowEnabled ? "default" : "secondary"}>
                {autoFollowEnabled ? "ON" : "OFF"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Follow Back</span>
              <Badge variant={followBackEnabled ? "default" : "secondary"}>
                {followBackEnabled ? "ON" : "OFF"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Story Viewer</span>
              <Badge variant={storyViewerEnabled ? "default" : "secondary"}>
                {storyViewerEnabled ? "ON" : "OFF"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Comment Replier</span>
              <Badge variant={commentReplierEnabled ? "default" : "secondary"}>
                {commentReplierEnabled ? "ON" : "OFF"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
