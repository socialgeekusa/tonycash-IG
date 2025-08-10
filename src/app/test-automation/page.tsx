'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface TestResult {
  id: string
  name: string
  status: 'pending' | 'running' | 'success' | 'error'
  message: string
  duration?: number
  details?: any
}

interface DeviceInfo {
  id: string
  name: string
  type: 'ios' | 'android'
  status: 'connected' | 'disconnected' | 'busy'
}

export default function TestAutomation() {
  const [devices, setDevices] = useState<DeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [testProgress, setTestProgress] = useState(0)
  const [instagramAccounts, setInstagramAccounts] = useState<any[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('')

  // Define comprehensive test suite
  const testSuite = [
    {
      id: 'device_detection',
      name: 'Device Detection',
      description: 'Test ADB device detection and connectivity'
    },
    {
      id: 'instagram_detection',
      name: 'Instagram Account Detection',
      description: 'Detect Instagram accounts on connected device'
    },
    {
      id: 'device_wake',
      name: 'Device Wake & Unlock',
      description: 'Wake device and unlock screen'
    },
    {
      id: 'instagram_launch',
      name: 'Instagram App Launch',
      description: 'Open Instagram application'
    },
    {
      id: 'screenshot_test',
      name: 'Screenshot Capture',
      description: 'Take and retrieve device screenshot'
    },
    {
      id: 'ui_navigation',
      name: 'UI Navigation Test',
      description: 'Navigate to Instagram profile tab'
    },
    {
      id: 'automation_like',
      name: 'Auto Like Test',
      description: 'Test automated liking functionality'
    },
    {
      id: 'automation_follow',
      name: 'Auto Follow Test',
      description: 'Test automated following functionality'
    },
    {
      id: 'automation_comment',
      name: 'Auto Comment Test',
      description: 'Test automated commenting functionality'
    },
    {
      id: 'account_switch',
      name: 'Account Switching',
      description: 'Test Instagram account switching'
    }
  ]

  // Load devices on component mount
  useEffect(() => {
    fetchDevices()
    // Set up polling for real-time updates
    const interval = setInterval(fetchDevices, 10000) // Every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/devices/detect')
      const data = await response.json()
      if (data.success && data.devices) {
        setDevices(data.devices)
        const connectedDevice = data.devices.find((d: DeviceInfo) => d.status === 'connected')
        if (connectedDevice && !selectedDevice) {
          setSelectedDevice(connectedDevice)
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
        if (data.accounts.length > 0 && !selectedAccount) {
          setSelectedAccount(data.accounts[0].username)
        }
      }
    } catch (error) {
      console.error('Failed to fetch Instagram accounts:', error)
    }
  }

  const updateTestResult = (testId: string, status: TestResult['status'], message: string, details?: any, duration?: number) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.id === testId)
      if (existing) {
        return prev.map(r => r.id === testId ? { ...r, status, message, details, duration } : r)
      } else {
        return [...prev, { id: testId, name: testSuite.find(t => t.id === testId)?.name || testId, status, message, details, duration }]
      }
    })
  }

  const runSingleTest = async (testId: string): Promise<boolean> => {
    if (!selectedDevice) {
      updateTestResult(testId, 'error', 'No device selected')
      return false
    }

    const startTime = Date.now()
    updateTestResult(testId, 'running', 'Test in progress...')

    try {
      switch (testId) {
        case 'device_detection':
          const deviceResponse = await fetch('/api/devices/detect')
          const deviceData = await deviceResponse.json()
          if (deviceData.success && deviceData.devices.length > 0) {
            updateTestResult(testId, 'success', `Found ${deviceData.devices.length} device(s)`, deviceData.devices, Date.now() - startTime)
            return true
          } else {
            updateTestResult(testId, 'error', 'No devices detected', deviceData, Date.now() - startTime)
            return false
          }

        case 'instagram_detection':
          const igResponse = await fetch(`/api/devices/instagram-accounts?deviceId=${selectedDevice.id}`)
          const igData = await igResponse.json()
          if (igData.success) {
            updateTestResult(testId, 'success', `Found ${igData.accounts.length} Instagram account(s)`, igData.accounts, Date.now() - startTime)
            return true
          } else {
            updateTestResult(testId, 'error', 'Instagram detection failed', igData, Date.now() - startTime)
            return false
          }

        case 'device_wake':
          const wakeResponse = await fetch('/api/devices/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deviceId: selectedDevice.id,
              action: 'wake_device'
            })
          })
          const wakeData = await wakeResponse.json()
          if (wakeData.success) {
            updateTestResult(testId, 'success', 'Device woken successfully', wakeData, Date.now() - startTime)
            return true
          } else {
            updateTestResult(testId, 'error', 'Failed to wake device', wakeData, Date.now() - startTime)
            return false
          }

        case 'instagram_launch':
          const launchResponse = await fetch('/api/devices/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deviceId: selectedDevice.id,
              action: 'open_instagram'
            })
          })
          const launchData = await launchResponse.json()
          if (launchData.success) {
            updateTestResult(testId, 'success', 'Instagram launched successfully', launchData, Date.now() - startTime)
            return true
          } else {
            updateTestResult(testId, 'error', 'Failed to launch Instagram', launchData, Date.now() - startTime)
            return false
          }

        case 'screenshot_test':
          const screenshotResponse = await fetch('/api/devices/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deviceId: selectedDevice.id,
              action: 'screenshot'
            })
          })
          const screenshotData = await screenshotResponse.json()
          if (screenshotData.success) {
            updateTestResult(testId, 'success', 'Screenshot captured successfully', screenshotData, Date.now() - startTime)
            return true
          } else {
            updateTestResult(testId, 'error', 'Failed to capture screenshot', screenshotData, Date.now() - startTime)
            return false
          }

        case 'ui_navigation':
          const navResponse = await fetch('/api/devices/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deviceId: selectedDevice.id,
              action: 'tap',
              parameters: { x: 900, y: 2200 } // Profile tab location
            })
          })
          const navData = await navResponse.json()
          if (navData.success) {
            updateTestResult(testId, 'success', 'UI navigation successful', navData, Date.now() - startTime)
            return true
          } else {
            updateTestResult(testId, 'error', 'UI navigation failed', navData, Date.now() - startTime)
            return false
          }

        case 'automation_like':
          const likeResponse = await fetch('/api/automation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              feature: 'like',
              action: 'start',
              parameters: {
                deviceId: selectedDevice.id,
                targets: ['test_user'],
                testMode: true,
                count: 1
              }
            })
          })
          const likeData = await likeResponse.json()
          if (likeData.success) {
            updateTestResult(testId, 'success', 'Auto like test successful', likeData, Date.now() - startTime)
            return true
          } else {
            updateTestResult(testId, 'error', 'Auto like test failed', likeData, Date.now() - startTime)
            return false
          }

        case 'automation_follow':
          const followResponse = await fetch('/api/automation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              feature: 'follow',
              action: 'start',
              parameters: {
                deviceId: selectedDevice.id,
                targets: ['test_user'],
                testMode: true,
                count: 1
              }
            })
          })
          const followData = await followResponse.json()
          if (followData.success) {
            updateTestResult(testId, 'success', 'Auto follow test successful', followData, Date.now() - startTime)
            return true
          } else {
            updateTestResult(testId, 'error', 'Auto follow test failed', followData, Date.now() - startTime)
            return false
          }

        case 'automation_comment':
          const commentResponse = await fetch('/api/automation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              feature: 'comment',
              action: 'start',
              parameters: {
                deviceId: selectedDevice.id,
                target: 'test_user',
                comment: 'Great content! 🔥',
                testMode: true
              }
            })
          })
          const commentData = await commentResponse.json()
          if (commentData.success) {
            updateTestResult(testId, 'success', 'Auto comment test successful', commentData, Date.now() - startTime)
            return true
          } else {
            updateTestResult(testId, 'error', 'Auto comment test failed', commentData, Date.now() - startTime)
            return false
          }

        case 'account_switch':
          if (!selectedAccount) {
            updateTestResult(testId, 'error', 'No Instagram account selected', null, Date.now() - startTime)
            return false
          }
          
          const switchResponse = await fetch('/api/devices/instagram-accounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deviceId: selectedDevice.id,
              action: 'switch_account',
              username: selectedAccount
            })
          })
          const switchData = await switchResponse.json()
          if (switchData.success) {
            updateTestResult(testId, 'success', 'Account switch test successful', switchData, Date.now() - startTime)
            return true
          } else {
            updateTestResult(testId, 'error', 'Account switch test failed', switchData, Date.now() - startTime)
            return false
          }

        default:
          updateTestResult(testId, 'error', 'Unknown test', null, Date.now() - startTime)
          return false
      }
    } catch (error) {
      updateTestResult(testId, 'error', `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`, error, Date.now() - startTime)
      return false
    }
  }

  const runAllTests = async () => {
    if (!selectedDevice) {
      toast.error('No device selected')
      return
    }

    setIsRunningTests(true)
    setTestProgress(0)
    setTestResults([])

    let successCount = 0
    const totalTests = testSuite.length

    for (let i = 0; i < testSuite.length; i++) {
      const test = testSuite[i]
      const success = await runSingleTest(test.id)
      if (success) successCount++
      
      setTestProgress(((i + 1) / totalTests) * 100)
      
      // Add delay between tests to avoid overwhelming the device
      if (i < testSuite.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    setIsRunningTests(false)
    
    toast.success(`Test Suite Complete`, {
      description: `${successCount}/${totalTests} tests passed`,
    })
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      case 'running': return 'bg-blue-500 animate-pulse'
      default: return 'bg-gray-400'
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-500">✓ Pass</Badge>
      case 'error': return <Badge className="bg-red-500">✗ Fail</Badge>
      case 'running': return <Badge className="bg-blue-500">⟳ Running</Badge>
      default: return <Badge variant="outline">⏸ Pending</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Automated Testing & Debug Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive testing suite for TonyCash Tool automation features
        </p>
      </div>

      {/* Device Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Device & Account Selection</CardTitle>
          <CardDescription>
            Select the device and Instagram account for testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Connected Device</label>
              <div className="mt-2">
                {devices.length === 0 ? (
                  <div className="p-4 border rounded-lg text-center text-muted-foreground">
                    No devices connected
                  </div>
                ) : (
                  devices.map(device => (
                    <div
                      key={device.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedDevice?.id === device.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        setSelectedDevice(device)
                        fetchInstagramAccounts(device.id)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{device.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {device.type.toUpperCase()}
                          </Badge>
                        </div>
                        <Badge variant={device.status === 'connected' ? 'default' : 'destructive'}>
                          {device.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Instagram Account</label>
              <div className="mt-2">
                {instagramAccounts.length === 0 ? (
                  <div className="p-4 border rounded-lg text-center text-muted-foreground">
                    No Instagram accounts detected
                  </div>
                ) : (
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full p-3 border rounded-lg bg-background"
                  >
                    <option value="">Select Account</option>
                    {instagramAccounts.map(account => (
                      <option key={account.username} value={account.username}>
                        @{account.username} ({account.detectionMethod || 'manual'})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
          <CardDescription>
            Run individual tests or the complete test suite
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={runAllTests}
              disabled={isRunningTests || !selectedDevice}
              className="bg-green-600 hover:bg-green-700"
            >
              {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setTestResults([])}
              disabled={isRunningTests}
            >
              Clear Results
            </Button>
            <Button
              variant="outline"
              onClick={fetchDevices}
              disabled={isRunningTests}
            >
              Refresh Devices
            </Button>
          </div>

          {isRunningTests && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Test Progress</span>
                <span>{Math.round(testProgress)}%</span>
              </div>
              <Progress value={testProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      <Tabs defaultValue="results" className="space-y-4">
        <TabsList>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="individual">Individual Tests</TabsTrigger>
          <TabsTrigger value="logs">Real-time Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Results from the automated test suite
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No test results yet. Run tests to see results here.
                </div>
              ) : (
                <div className="space-y-3">
                  {testResults.map(result => (
                    <div key={result.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(result.status)}`} />
                          <span className="font-medium">{result.name}</span>
                          {getStatusBadge(result.status)}
                        </div>
                        {result.duration && (
                          <span className="text-xs text-muted-foreground">
                            {result.duration}ms
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-xs cursor-pointer text-blue-600">
                            View Details
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual">
          <Card>
            <CardHeader>
              <CardTitle>Individual Tests</CardTitle>
              <CardDescription>
                Run specific tests individually
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testSuite.map(test => {
                  const result = testResults.find(r => r.id === test.id)
                  return (
                    <div key={test.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${result ? getStatusColor(result.status) : 'bg-gray-400'}`} />
                          <span className="font-medium text-sm">{test.name}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => runSingleTest(test.id)}
                          disabled={isRunningTests || !selectedDevice}
                        >
                          Run
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">{test.description}</p>
                      {result && (
                        <p className="text-xs mt-1 font-medium">{result.message}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Logs</CardTitle>
              <CardDescription>
                Live system logs and device actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-auto">
                <div className="space-y-1">
                  <div>[{new Date().toLocaleTimeString()}] System initialized</div>
                  <div>[{new Date().toLocaleTimeString()}] Waiting for test execution...</div>
                  {testResults.map((result, index) => (
                    <div key={index}>
                      [{new Date().toLocaleTimeString()}] {result.name}: {result.message}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
