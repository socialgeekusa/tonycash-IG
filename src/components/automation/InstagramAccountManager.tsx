'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { RefreshCw, User, Calendar, Smartphone, Settings, LogOut, UserCheck, Plus, UserPlus, Upload, Download, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'

interface InstagramAccount {
  username: string
  displayName: string
  isActive: boolean
  lastUsed: Date
  deviceId: string
}

interface Device {
  id: string
  name: string
  type: 'ios' | 'android'
  status: 'connected' | 'disconnected' | 'busy'
}

interface InstagramAccountManagerProps {
  devices: Device[]
}

export function InstagramAccountManager({ devices }: InstagramAccountManagerProps) {
  const [accountsByDevice, setAccountsByDevice] = useState<Record<string, InstagramAccount[]>>({})
  const [loading, setLoading] = useState(false)
  const [selectedAccounts, setSelectedAccounts] = useState<Record<string, string>>({})
  const [manualUsername, setManualUsername] = useState('')
  const [addingManually, setAddingManually] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentDeviceId, setCurrentDeviceId] = useState('')
  const [autoRotationEnabled, setAutoRotationEnabled] = useState<Record<string, boolean>>({})
  const [rotationIntervals, setRotationIntervals] = useState<Record<string, number>>({})
  const [rotationTimers, setRotationTimers] = useState<Record<string, NodeJS.Timeout>>({})
  
  // Bulk account management
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [bulkDeviceId, setBulkDeviceId] = useState('')
  const [bulkAccountsText, setBulkAccountsText] = useState('')
  const [isAddingBulk, setIsAddingBulk] = useState(false)
  const [importMethod, setImportMethod] = useState<'manual' | 'csv' | 'json'>('manual')

  const fetchInstagramAccounts = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/devices/instagram-accounts?deviceId=${deviceId}`)
      const data = await response.json()
      
      if (data.success) {
        // Get existing manual accounts from current state
        const existingAccounts = accountsByDevice[deviceId] || []
        const manualAccounts = existingAccounts.filter(acc => 
          acc.displayName.includes('(Manual)') || 
          acc.displayName.includes('(Bulk Import)') || 
          acc.displayName.includes('(CSV Import)') || 
          acc.displayName.includes('(JSON Import)')
        )
        
        // Get API detected accounts
        const apiAccounts = data.accounts || []
        
        // Merge accounts, avoiding duplicates
        const existingUsernames = manualAccounts.map(acc => acc.username.toLowerCase())
        const newApiAccounts = apiAccounts.filter(acc => 
          !existingUsernames.includes(acc.username.toLowerCase())
        )
        
        const mergedAccounts = [...manualAccounts, ...newApiAccounts]
        
        setAccountsByDevice(prev => ({
          ...prev,
          [deviceId]: mergedAccounts
        }))
        
        // Set first account as selected if none selected
        if (mergedAccounts.length > 0 && !selectedAccounts[deviceId]) {
          setSelectedAccounts(prev => ({
            ...prev,
            [deviceId]: mergedAccounts[0].username
          }))
        }
      } else {
        console.error('Failed to fetch Instagram accounts:', data.error)
      }
    } catch (error) {
      console.error('Error fetching Instagram accounts:', error)
    }
  }

  const refreshAllAccounts = async () => {
    setLoading(true)
    try {
      const promises = devices
        .filter(device => device.status === 'connected')
        .map(device => fetchInstagramAccounts(device.id))
      
      await Promise.all(promises)
      
      toast.success("Accounts Refreshed", {
        description: "Instagram accounts updated for all connected devices",
      })
    } catch (error) {
      toast.error("Refresh Failed", {
        description: "Could not refresh Instagram accounts",
      })
    } finally {
      setLoading(false)
    }
  }

  const switchAccount = async (deviceId: string, username: string) => {
    try {
      const response = await fetch('/api/devices/instagram-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId,
          action: 'switch_account',
          username
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSelectedAccounts(prev => ({
          ...prev,
          [deviceId]: username
        }))
        
        toast.success("Account Switched", {
          description: `Switched to @${username}`,
        })
      } else {
        toast.error("Switch Failed", {
          description: data.error || "Could not switch Instagram account",
        })
      }
    } catch (error) {
      toast.error("Switch Failed", {
        description: "Network error while switching account",
      })
    }
  }

  const toggleAccountForAutomation = (deviceId: string, username: string, enabled: boolean) => {
    // Update account automation status
    setAccountsByDevice(prev => ({
      ...prev,
      [deviceId]: prev[deviceId]?.map(account => 
        account.username === username 
          ? { ...account, isActive: enabled }
          : account
      ) || []
    }))

    if (enabled) {
      toast.success("Automation Enabled", {
        description: `@${username} enabled for automation`,
      })
    } else {
      toast.info("Automation Disabled", {
        description: `@${username} disabled for automation`,
      })
    }
  }

  const addManualAccount = async () => {
    if (!manualUsername.trim() || !currentDeviceId) return

    setAddingManually(true)
    
    try {
      // Clean username (remove @ if present)
      const cleanUsername = manualUsername.replace('@', '').trim()
      
      // Create new manual account
      const newAccount: InstagramAccount = {
        username: cleanUsername,
        displayName: `@${cleanUsername} (Manual)`,
        isActive: true,
        lastUsed: new Date(),
        deviceId: currentDeviceId
      }

      // Add to accounts list
      setAccountsByDevice(prev => ({
        ...prev,
        [currentDeviceId]: [...(prev[currentDeviceId] || []), newAccount]
      }))

      // Set as selected account
      setSelectedAccounts(prev => ({
        ...prev,
        [currentDeviceId]: cleanUsername
      }))

      // Save to localStorage for persistence
      const savedAccounts = JSON.parse(localStorage.getItem('manual-instagram-accounts') || '{}')
      savedAccounts[currentDeviceId] = [...(savedAccounts[currentDeviceId] || []), newAccount]
      localStorage.setItem('manual-instagram-accounts', JSON.stringify(savedAccounts))

      toast.success("Account Added", {
        description: `@${cleanUsername} added manually and confirmed active`,
      })

      // Reset form
      setManualUsername('')
      setDialogOpen(false)
      setCurrentDeviceId('')
      
    } catch (error) {
      toast.error("Failed to Add Account", {
        description: "Could not add manual Instagram account",
      })
    } finally {
      setAddingManually(false)
    }
  }

  const openManualDialog = (deviceId: string) => {
    setCurrentDeviceId(deviceId)
    setDialogOpen(true)
  }

  const openBulkDialog = (deviceId: string) => {
    setBulkDeviceId(deviceId)
    setBulkDialogOpen(true)
  }

  const getImportTemplate = () => {
    switch (importMethod) {
      case 'manual':
        return `username1
username2
@username3
username4
businessaccount
personalaccount`
      case 'csv':
        return `username1,Display Name 1,Business account
username2,Display Name 2,Personal account
@username3,Display Name 3,Influencer account
username4,Display Name 4,Brand account`
      case 'json':
        return `[
  {"username": "username1", "displayName": "Display Name 1", "notes": "Business account"},
  {"username": "username2", "displayName": "Display Name 2", "notes": "Personal account"},
  {"username": "@username3", "displayName": "Display Name 3", "notes": "Influencer account"},
  {"username": "username4", "displayName": "Display Name 4", "notes": "Brand account"}
]`
      default:
        return ''
    }
  }

  const handleBulkAdd = async () => {
    if (!bulkDeviceId || !bulkAccountsText.trim()) return
    
    setIsAddingBulk(true)
    let accounts: any[] = []
    
    try {
      if (importMethod === 'manual') {
        accounts = bulkAccountsText
          .split('\n')
          .map(line => line.trim())
          .filter(line => line)
          .map(username => ({
            username: username.startsWith('@') ? username.slice(1) : username,
            displayName: `@${username.startsWith('@') ? username.slice(1) : username} (Bulk Import)`,
            isActive: true,
            lastUsed: new Date(),
            deviceId: bulkDeviceId
          }))
      } else if (importMethod === 'csv') {
        // Parse CSV format: username,displayName,notes
        const lines = bulkAccountsText.split('\n').filter(line => line.trim())
        accounts = lines.map(line => {
          const [username, displayName, notes] = line.split(',').map(s => s.trim())
          return {
            username: username.startsWith('@') ? username.slice(1) : username,
            displayName: displayName || `@${username.startsWith('@') ? username.slice(1) : username} (CSV Import)`,
            notes: notes || '',
            isActive: true,
            lastUsed: new Date(),
            deviceId: bulkDeviceId
          }
        })
      } else if (importMethod === 'json') {
        // Parse JSON array
        const parsed = JSON.parse(bulkAccountsText)
        accounts = parsed.map((acc: any) => ({
          username: acc.username.startsWith('@') ? acc.username.slice(1) : acc.username,
          displayName: acc.displayName || `@${acc.username.startsWith('@') ? acc.username.slice(1) : acc.username} (JSON Import)`,
          notes: acc.notes || '',
          isActive: true,
          lastUsed: new Date(),
          deviceId: bulkDeviceId
        }))
      }

      // Remove duplicates
      const existingAccounts = accountsByDevice[bulkDeviceId] || []
      const existingUsernames = existingAccounts.map(acc => acc.username.toLowerCase())
      const newAccounts = accounts.filter(acc => 
        !existingUsernames.includes(acc.username.toLowerCase())
      )

      if (newAccounts.length === 0) {
        toast.warning('No New Accounts', {
          description: 'All accounts already exist (duplicates skipped)',
        })
        setIsAddingBulk(false)
        return
      }

      // Add accounts to the list
      const updatedAccounts = [...existingAccounts, ...newAccounts]
      setAccountsByDevice(prev => ({
        ...prev,
        [bulkDeviceId]: updatedAccounts
      }))
      
      // Save to localStorage
      const savedAccounts = JSON.parse(localStorage.getItem('manual-instagram-accounts') || '{}')
      savedAccounts[bulkDeviceId] = updatedAccounts
      localStorage.setItem('manual-instagram-accounts', JSON.stringify(savedAccounts))
      
      setBulkAccountsText('')
      setIsAddingBulk(false)
      setBulkDialogOpen(false)
      
      toast.success('Bulk Import Complete', {
        description: `Added ${newAccounts.length} new accounts successfully! ${accounts.length - newAccounts.length > 0 ? `(${accounts.length - newAccounts.length} duplicates skipped)` : ''}`,
      })
      
    } catch (error) {
      toast.error('Import Failed', {
        description: `Error parsing ${importMethod.toUpperCase()} format: ${error}`,
      })
      setIsAddingBulk(false)
    }
  }

  const handleExportAccounts = (deviceId: string) => {
    const accounts = accountsByDevice[deviceId] || []
    if (accounts.length === 0) return
    
    const device = devices.find(d => d.id === deviceId)
    const exportData = {
      deviceId: deviceId,
      deviceName: device?.name || 'Unknown Device',
      exportDate: new Date().toISOString(),
      totalAccounts: accounts.length,
      accounts: accounts.map(acc => ({
        username: acc.username,
        displayName: acc.displayName,
        isActive: acc.isActive,
        lastUsed: acc.lastUsed
      }))
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `instagram_accounts_${deviceId}_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Export Complete', {
      description: `Exported ${accounts.length} accounts to JSON file`,
    })
  }

  const handleClearAllAccounts = (deviceId: string) => {
    const accounts = accountsByDevice[deviceId] || []
    if (accounts.length === 0) return
    
    if (confirm(`Are you sure you want to clear all ${accounts.length} accounts for this device? This cannot be undone.`)) {
      setAccountsByDevice(prev => ({
        ...prev,
        [deviceId]: []
      }))
      
      // Clear from localStorage
      const savedAccounts = JSON.parse(localStorage.getItem('manual-instagram-accounts') || '{}')
      delete savedAccounts[deviceId]
      localStorage.setItem('manual-instagram-accounts', JSON.stringify(savedAccounts))
      
      // Clear selection
      setSelectedAccounts(prev => ({
        ...prev,
        [deviceId]: ''
      }))
      
      toast.success('All Accounts Cleared', {
        description: `Removed all ${accounts.length} accounts from device`,
      })
    }
  }

  const removeAccount = (deviceId: string, username: string) => {
    // Validate username before removal
    if (!username || username.trim() === '') {
      toast.error("Cannot Remove Account", {
        description: "Invalid username provided",
      })
      return
    }

    // Confirm removal for important accounts
    const accounts = accountsByDevice[deviceId] || []
    const accountToRemove = accounts.find(acc => acc.username === username)
    
    if (!accountToRemove) {
      toast.error("Account Not Found", {
        description: `@${username} not found in device accounts`,
      })
      return
    }

    // Extra confirmation for API-detected accounts
    const isApiDetected = !accountToRemove.displayName.includes('(Manual)') && 
                         !accountToRemove.displayName.includes('(Bulk Import)') &&
                         !accountToRemove.displayName.includes('(CSV Import)') &&
                         !accountToRemove.displayName.includes('(JSON Import)')
    
    if (isApiDetected) {
      const confirmRemoval = confirm(
        `Are you sure you want to remove @${username}?\n\n` +
        `This appears to be an auto-detected account. It may reappear when you refresh accounts.\n\n` +
        `Consider using manual account management instead.`
      )
      
      if (!confirmRemoval) {
        return
      }
    }

    // Remove from state
    setAccountsByDevice(prev => ({
      ...prev,
      [deviceId]: prev[deviceId]?.filter(account => account.username !== username) || []
    }))

    // Update localStorage (only remove manual accounts from storage)
    const savedAccounts = JSON.parse(localStorage.getItem('manual-instagram-accounts') || '{}')
    if (savedAccounts[deviceId]) {
      savedAccounts[deviceId] = savedAccounts[deviceId].filter((acc: InstagramAccount) => acc.username !== username)
      localStorage.setItem('manual-instagram-accounts', JSON.stringify(savedAccounts))
    }

    // Clear selection if this was the selected account, but set a new one if available
    if (selectedAccounts[deviceId] === username) {
      const remainingAccounts = accounts.filter(acc => acc.username !== username)
      const newSelectedAccount = remainingAccounts.length > 0 ? remainingAccounts[0].username : ''
      
      setSelectedAccounts(prev => ({
        ...prev,
        [deviceId]: newSelectedAccount
      }))
    }

    toast.success("Account Removed", {
      description: `@${username} removed from device`,
    })
  }

  // Random username rotation functionality
  const rotateToRandomUsername = (deviceId: string) => {
    const accounts = accountsByDevice[deviceId] || []
    const activeAccounts = accounts.filter(acc => acc.isActive)
    
    if (activeAccounts.length <= 1) return // Need at least 2 accounts to rotate
    
    const currentUsername = selectedAccounts[deviceId]
    const availableAccounts = activeAccounts.filter(acc => acc.username !== currentUsername)
    
    if (availableAccounts.length === 0) return
    
    // Select random account from available ones
    const randomIndex = Math.floor(Math.random() * availableAccounts.length)
    const newUsername = availableAccounts[randomIndex].username
    
    // Switch to the new username
    setSelectedAccounts(prev => ({
      ...prev,
      [deviceId]: newUsername
    }))
    
    // Update last used time
    setAccountsByDevice(prev => ({
      ...prev,
      [deviceId]: prev[deviceId]?.map(account => 
        account.username === newUsername 
          ? { ...account, lastUsed: new Date() }
          : account
      ) || []
    }))
    
    toast.info("Auto-Rotation", {
      description: `Automatically switched to @${newUsername}`,
    })
  }

  const toggleAutoRotation = (deviceId: string, enabled: boolean) => {
    setAutoRotationEnabled(prev => ({
      ...prev,
      [deviceId]: enabled
    }))
    
    if (enabled) {
      // Set default interval if not set (15-45 minutes)
      if (!rotationIntervals[deviceId]) {
        const randomInterval = Math.floor(Math.random() * (45 - 15 + 1)) + 15 // 15-45 minutes
        setRotationIntervals(prev => ({
          ...prev,
          [deviceId]: randomInterval
        }))
      }
      
      startRotationTimer(deviceId)
      toast.success("Auto-Rotation Enabled", {
        description: `Username rotation started for ${devices.find(d => d.id === deviceId)?.name}`,
      })
    } else {
      stopRotationTimer(deviceId)
      toast.info("Auto-Rotation Disabled", {
        description: `Username rotation stopped for ${devices.find(d => d.id === deviceId)?.name}`,
      })
    }
  }

  const startRotationTimer = (deviceId: string) => {
    // Clear existing timer
    if (rotationTimers[deviceId]) {
      clearInterval(rotationTimers[deviceId])
    }
    
    const interval = rotationIntervals[deviceId] || 30 // Default 30 minutes
    const randomizedInterval = (interval * 60 * 1000) + (Math.random() * 10 * 60 * 1000) // Add 0-10 min randomness
    
    const timer = setInterval(() => {
      rotateToRandomUsername(deviceId)
    }, randomizedInterval)
    
    setRotationTimers(prev => ({
      ...prev,
      [deviceId]: timer
    }))
  }

  const stopRotationTimer = (deviceId: string) => {
    if (rotationTimers[deviceId]) {
      clearInterval(rotationTimers[deviceId])
      setRotationTimers(prev => {
        const updated = { ...prev }
        delete updated[deviceId]
        return updated
      })
    }
  }

  const updateRotationInterval = (deviceId: string, minutes: number) => {
    setRotationIntervals(prev => ({
      ...prev,
      [deviceId]: minutes
    }))
    
    // Restart timer with new interval if rotation is enabled
    if (autoRotationEnabled[deviceId]) {
      startRotationTimer(deviceId)
    }
  }

  // Load manual accounts from localStorage on mount
  useEffect(() => {
    const loadManualAccounts = () => {
      try {
        const savedAccounts = JSON.parse(localStorage.getItem('manual-instagram-accounts') || '{}')
        
        // Merge manual accounts with existing accounts
        setAccountsByDevice(prev => {
          const updated = { ...prev }
          
          Object.keys(savedAccounts).forEach(deviceId => {
            const manualAccounts = savedAccounts[deviceId] || []
            const existingAccounts = prev[deviceId] || []
            
            // Avoid duplicates by checking usernames
            const existingUsernames = existingAccounts.map(acc => acc.username)
            const newManualAccounts = manualAccounts.filter(
              (acc: InstagramAccount) => !existingUsernames.includes(acc.username)
            )
            
            updated[deviceId] = [...existingAccounts, ...newManualAccounts]
          })
          
          return updated
        })
      } catch (error) {
        console.error('Error loading manual accounts:', error)
      }
    }

    // Load manual accounts first
    loadManualAccounts()
    
    // Then fetch accounts for all connected devices
    devices
      .filter(device => device.status === 'connected')
      .forEach(device => fetchInstagramAccounts(device.id))
  }, [devices])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(rotationTimers).forEach(timer => {
        if (timer) clearInterval(timer)
      })
    }
  }, [rotationTimers])

  // Enhanced method to get active username for a device
  const getActiveUsername = (deviceId: string): string | null => {
    const accounts = accountsByDevice[deviceId] || []
    const selectedUsername = selectedAccounts[deviceId]
    
    // Priority 1: User-selected account
    if (selectedUsername && accounts.find(acc => acc.username === selectedUsername)) {
      return selectedUsername
    }
    
    // Priority 2: First active account
    const activeAccount = accounts.find(acc => acc.isActive)
    if (activeAccount) {
      return activeAccount.username
    }
    
    // Priority 3: First available account
    if (accounts.length > 0) {
      return accounts[0].username
    }
    
    return null
  }

  // Method to get account source/method for display
  const getAccountSource = (deviceId: string, username: string): string => {
    const accounts = accountsByDevice[deviceId] || []
    const account = accounts.find(acc => acc.username === username)
    
    if (!account) return 'Unknown'
    
    if (account.displayName.includes('(Manual)')) {
      return 'Manual Input'
    }
    
    // Check if it came from API detection
    return 'Auto-Detected'
  }

  const connectedDevices = devices.filter(device => device.status === 'connected')

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Instagram Account Manager
            </CardTitle>
            <CardDescription>
              Manage Instagram accounts across all connected devices
            </CardDescription>
          </div>
          <Button 
            onClick={refreshAllAccounts} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {connectedDevices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No devices connected</p>
            <p className="text-sm">Connect your iOS or Android device to manage Instagram accounts</p>
          </div>
        ) : (
          connectedDevices.map((device) => {
            const accounts = accountsByDevice[device.id] || []
            const selectedAccount = selectedAccounts[device.id]
            
            return (
              <div key={device.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span className="font-medium">{device.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {device.type.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Active Username:</span>
                    {getActiveUsername(device.id) ? (
                      <Badge variant="default" className="text-xs">
                        @{getActiveUsername(device.id)}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        None Set
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      ({getAccountSource(device.id, getActiveUsername(device.id) || '')})
                    </span>
                  </div>
                </div>

                {accounts.length === 0 ? (
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      No Instagram accounts detected
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Make sure Instagram is installed and you're logged in
                    </p>
                    <div className="flex gap-2 justify-center mt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => fetchInstagramAccounts(device.id)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Check Again
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => openManualDialog(device.id)}
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Add Manually
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Instagram Accounts ({accounts.length})</span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openBulkDialog(device.id)}
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          Bulk Import
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleExportAccounts(device.id)}
                          disabled={accounts.length === 0}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Export
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleClearAllAccounts(device.id)}
                          disabled={accounts.length === 0}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Clear All
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openManualDialog(device.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Single
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {accounts.map((account) => (
                        <div 
                          key={`${device.id}-${account.username}`}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            selectedAccount === account.username 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={`https://unavatar.io/instagram/${account.username}`} />
                              <AvatarFallback>
                                {account.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">@{account.username}</span>
                                {selectedAccount === account.username && (
                                  <Badge variant="default" className="text-xs">
                                    <UserCheck className="h-3 w-3 mr-1" />
                                    Active
                                  </Badge>
                                )}
                                {account.displayName.includes('(Manual)') && (
                                  <Badge variant="secondary" className="text-xs">
                                    Manual
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Last used: {new Date(account.lastUsed).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Automation</span>
                              <Switch
                                checked={account.isActive}
                                onCheckedChange={(checked) => 
                                  toggleAccountForAutomation(device.id, account.username, checked)
                                }
                              />
                            </div>
                            
                            <Separator orientation="vertical" className="h-6" />
                            
                            {selectedAccount !== account.username ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => switchAccount(device.id, account.username)}
                              >
                                <Settings className="h-3 w-3 mr-1" />
                                Set as Primary
                              </Button>
                            ) : (
                              <Badge variant="default" className="text-xs">
                                <UserCheck className="h-3 w-3 mr-1" />
                                Primary Account
                              </Badge>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => removeAccount(device.id, account.username)}
                            >
                              <LogOut className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {device.id !== connectedDevices[connectedDevices.length - 1].id && (
                  <Separator />
                )}
              </div>
            )
          })
        )}

        {connectedDevices.length > 0 && (
          <div className="bg-muted/30 rounded-lg p-4 space-y-4">
            <div>
              <h4 className="font-medium mb-2">Automation Settings</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Enable automation for accounts you want to include in campaigns</p>
                <p>• Switch between accounts to manage different profiles</p>
                <p>• Active account will be used for manual device actions</p>
              </div>
            </div>

            {/* Auto-Rotation Settings */}
            <div className="space-y-3">
              <h4 className="font-medium">Auto Username Rotation</h4>
              {connectedDevices.map((device) => {
                const accounts = accountsByDevice[device.id] || []
                const activeAccounts = accounts.filter(acc => acc.isActive)
                const canRotate = activeAccounts.length >= 2
                
                return (
                  <div key={device.id} className="bg-background/50 rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        <span className="font-medium text-sm">{device.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {activeAccounts.length} accounts
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Auto-Rotation</span>
                        <Switch
                          checked={autoRotationEnabled[device.id] || false}
                          onCheckedChange={(checked) => toggleAutoRotation(device.id, checked)}
                          disabled={!canRotate}
                        />
                      </div>
                    </div>
                    
                    {autoRotationEnabled[device.id] && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Rotation Interval (minutes)</Label>
                          <Input
                            type="number"
                            min="5"
                            max="120"
                            value={rotationIntervals[device.id] || 30}
                            onChange={(e) => updateRotationInterval(device.id, parseInt(e.target.value) || 30)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => rotateToRandomUsername(device.id)}
                            disabled={!canRotate}
                            className="h-8 text-xs"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Rotate Now
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {!canRotate && (
                      <p className="text-xs text-muted-foreground">
                        Need at least 2 active accounts for rotation
                      </p>
                    )}
                  </div>
                )
              })}
              <div className="text-xs text-muted-foreground">
                <p>• Auto-rotation randomly switches between active accounts</p>
                <p>• Helps avoid detection patterns and distributes activity</p>
                <p>• Interval includes random 0-10 minute variance for natural behavior</p>
              </div>
            </div>
          </div>
        )}

        {/* Manual Account Addition Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Instagram Account Manually</DialogTitle>
              <DialogDescription>
                Enter the Instagram username for this device. This will be marked as confirmed and active.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Instagram Username</Label>
                <Input
                  id="username"
                  placeholder="Enter username (without @)"
                  value={manualUsername}
                  onChange={(e) => setManualUsername(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addManualAccount()
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Don't include the @ symbol. Example: johndoe
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false)
                  setManualUsername('')
                  setCurrentDeviceId('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={addManualAccount}
                disabled={addingManually || !manualUsername.trim()}
              >
                {addingManually ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3 w-3 mr-1" />
                    Add Account
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Account Import Dialog */}
        <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Bulk Import Instagram Accounts</DialogTitle>
              <DialogDescription>
                Import multiple Instagram accounts at once using different formats. Perfect for setting up accounts in bulk.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Import Method Selection */}
              <div>
                <Label className="text-sm font-medium">Import Method</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={importMethod === 'manual' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImportMethod('manual')}
                  >
                    Manual List
                  </Button>
                  <Button
                    variant={importMethod === 'csv' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImportMethod('csv')}
                  >
                    CSV Format
                  </Button>
                  <Button
                    variant={importMethod === 'json' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImportMethod('json')}
                  >
                    JSON Format
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose the format that matches your data source
                </p>
              </div>

              {/* Template Display */}
              <div>
                <Label className="text-sm font-medium">Template for {importMethod.toUpperCase()} format:</Label>
                <pre className="text-xs bg-muted p-3 rounded border mt-2 overflow-x-auto whitespace-pre-wrap">
                  {getImportTemplate()}
                </pre>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBulkAccountsText(getImportTemplate())}
                  >
                    Load Template
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBulkAccountsText('')}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Import Text Area */}
              <div>
                <Label htmlFor="bulk-accounts" className="text-sm font-medium">
                  Paste Your Accounts ({importMethod.toUpperCase()} format)
                </Label>
                <Textarea
                  id="bulk-accounts"
                  value={bulkAccountsText}
                  onChange={(e) => setBulkAccountsText(e.target.value)}
                  placeholder={getImportTemplate()}
                  className="mt-2 h-48 font-mono text-sm"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    {importMethod === 'manual' && 'Enter usernames one per line. @ symbol is optional.'}
                    {importMethod === 'csv' && 'Format: username,displayName,notes (one per line)'}
                    {importMethod === 'json' && 'Valid JSON array with username, displayName, and notes fields'}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {bulkAccountsText.split('\n').filter(line => line.trim()).length} lines
                  </Badge>
                </div>
              </div>

              {/* Import Options */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-medium">Import Options</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-medium text-green-600">✓ Automatic Features:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Duplicate detection & removal</li>
                      <li>@ symbol handling</li>
                      <li>Auto-enable for automation</li>
                      <li>localStorage persistence</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-blue-600">ℹ️ Supported Formats:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Manual: Simple username list</li>
                      <li>CSV: Comma-separated values</li>
                      <li>JSON: Structured data format</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setBulkDialogOpen(false)
                  setBulkAccountsText('')
                  setBulkDeviceId('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkAdd}
                disabled={isAddingBulk || !bulkAccountsText.trim()}
              >
                {isAddingBulk ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-3 w-3 mr-1" />
                    Import {bulkAccountsText.split('\n').filter(line => line.trim()).length} Accounts
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
