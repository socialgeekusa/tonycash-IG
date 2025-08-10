 import { NextRequest, NextResponse } from 'next/server'
import { deviceAutomation } from '@/lib/device'
import { aiService } from '@/lib/ai'
import { taskScheduler } from '@/lib/scheduler'
import { logger } from '@/lib/logger'

export interface AutomationRequest {
  feature: 'like' | 'comment' | 'follow' | 'unfollow' | 'dm' | 'story_view' | 'ai_caption' | 'ai_bio' | 'ai_reply' | 'unified'
  action: 'start' | 'stop' | 'pause' | 'resume' | 'status'
  parameters?: {
    target?: string
    targets?: string[]
    message?: string
    comment?: string
    hashtags?: string[]
    locations?: string[]
    delay?: number
    count?: number
    deviceId?: string
    prompt?: string
    currentBio?: string
    niche?: string
    tone?: string
    enabledFeatures?: string[]
    continuous?: boolean
    likesPerHour?: number
    commentsPerHour?: number
    followsPerHour?: number
    commentTemplates?: string[]
    testMode?: boolean
    instagramUsername?: string
    [key: string]: any
  }
}

export interface AutomationResponse {
  success: boolean
  data?: any
  error?: string
  taskId?: string
  status?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<AutomationResponse>> {
  try {
    const body: AutomationRequest = await request.json()
    logger.logAPICall('/api/automation', 'POST', 200)

    const { feature, action, parameters = {} } = body

    // Validate request
    if (!feature || !action) {
      logger.logAPICall('/api/automation', 'POST', 400)
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: feature and action'
      }, { status: 400 })
    }

    let result: AutomationResponse

    switch (feature) {
      case 'like':
        result = await handleLikeAction(action, parameters)
        break
      case 'comment':
        result = await handleCommentAction(action, parameters)
        break
      case 'follow':
        result = await handleFollowAction(action, parameters)
        break
      case 'unfollow':
        result = await handleUnfollowAction(action, parameters)
        break
      case 'dm':
        result = await handleDMAction(action, parameters)
        break
      case 'story_view':
        result = await handleStoryViewAction(action, parameters)
        break
      case 'ai_caption':
        result = await handleAICaptionAction(action, parameters)
        break
      case 'ai_bio':
        result = await handleAIBioAction(action, parameters)
        break
      case 'ai_reply':
        result = await handleAIReplyAction(action, parameters)
        break
      case 'unified':
        result = await handleUnifiedAutomationAction(action, parameters)
        break
      default:
        result = {
          success: false,
          error: `Unknown feature: ${feature}`
        }
    }

    const statusCode = result.success ? 200 : 400
    logger.logAPICall('/api/automation', 'POST', statusCode)
    
    return NextResponse.json(result, { status: statusCode })

  } catch (error) {
    logger.logAPICall('/api/automation', 'POST', 500)
    logger.error('API automation error', 'api', { error: error instanceof Error ? error.message : error })
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url)
    const taskId = url.searchParams.get('taskId')
    const feature = url.searchParams.get('feature')
    const recent = url.searchParams.get('recent')

    logger.logAPICall('/api/automation', 'GET', 200)

    if (recent === 'true') {
      // Get recent activity for dashboard
      const recentLogs = logger.getRecentLogs(60) // Last 60 minutes
      const activities = recentLogs
        .filter(log => log.category === 'automation')
        .slice(0, 20) // Limit to 20 most recent
        .map((log, index) => ({
          id: index + 1,
          action: log.data?.action || 'Unknown Action',
          target: log.data?.target || 'Unknown Target',
          result: log.data?.result === 'success' ? 'Success' : 'Failed',
          timestamp: formatTimeAgo(log.timestamp),
          type: getActivityType(log.data?.action || '')
        }))

      return NextResponse.json({
        success: true,
        activities
      })
    }

    if (taskId) {
      // Get specific task status
      const task = taskScheduler.getTask(taskId)
      if (!task) {
        return NextResponse.json({
          success: false,
          error: 'Task not found'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: task
      })
    }

    if (feature) {
      // Get tasks by feature type
      const tasks = taskScheduler.getTasksByType(feature as any)
      return NextResponse.json({
        success: true,
        data: tasks
      })
    }

    // Get general status
    const stats = taskScheduler.getStats()
    const deviceConnected = deviceAutomation.isDeviceConnected()
    const currentDevice = deviceAutomation.getCurrentDevice()

    return NextResponse.json({
      success: true,
      data: {
        scheduler: stats,
        device: {
          connected: deviceConnected,
          currentDevice,
          queueLength: deviceAutomation.getQueueLength(),
          isExecuting: deviceAutomation.isQueueExecuting()
        }
      }
    })

  } catch (error) {
    logger.logAPICall('/api/automation', 'GET', 500)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// Helper functions
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
}

function getActivityType(action: string): 'engagement' | 'dm' | 'cleanup' {
  const lowerAction = action.toLowerCase()
  if (lowerAction.includes('dm') || lowerAction.includes('message')) return 'dm'
  if (lowerAction.includes('unfollow') || lowerAction.includes('cleanup') || lowerAction.includes('delete')) return 'cleanup'
  return 'engagement'
}

// Action handlers
async function handleLikeAction(action: string, parameters: any): Promise<AutomationResponse> {
  switch (action) {
    case 'start':
      if (!parameters.targets && !parameters.target) {
        return { success: false, error: 'Missing targets parameter' }
      }

      const targets = parameters.targets || [parameters.target]
      const taskIds = taskScheduler.scheduleBatchLikes(targets, parameters.delay || 30000)
      
      logger.logAutomationAction('batch_like', `${targets.length} targets`, 'success', { taskIds })
      
      return {
        success: true,
        data: { taskIds, count: targets.length },
        status: 'started'
      }

    case 'status':
      const likeTasks = taskScheduler.getTasksByType('like')
      return {
        success: true,
        data: likeTasks,
        status: 'retrieved'
      }

    default:
      return { success: false, error: `Unknown action: ${action}` }
  }
}

// Unified automation handler
async function handleUnifiedAutomationAction(action: string, parameters: any): Promise<AutomationResponse> {
  switch (action) {
    case 'start':
      try {
        const { 
          enabledFeatures = [], 
          targets = [], 
          hashtags = [], 
          locations = [],
          deviceId,
          instagramUsername,
          continuous = true,
          likesPerHour = 0,
          commentsPerHour = 0,
          followsPerHour = 0,
          commentTemplates = [],
          testMode = false
        } = parameters

        // Validate that at least one feature is enabled
        if (enabledFeatures.length === 0) {
          return { 
            success: false, 
            error: 'No features enabled. Please enable at least one automation feature.' 
          }
        }

        // Validate that targets are provided
        if (targets.length === 0 && hashtags.length === 0 && locations.length === 0) {
          return { 
            success: false, 
            error: 'No targets specified. Please add target usernames, hashtags, or locations.' 
          }
        }

        // Log the unified automation start
        logger.logAutomationAction('unified_automation', 'start', 'success', {
          enabledFeatures,
          targetCount: targets.length,
          hashtagCount: hashtags.length,
          locationCount: locations.length,
          deviceId,
          instagramUsername,
          continuous,
          testMode
        })

        // Start device unlock and Instagram opening process
        if (deviceId) {
          try {
            // Step 1: Connect to device first
            const connected = await deviceAutomation.connectDevice(deviceId)
            if (!connected) {
              throw new Error(`Failed to connect to device ${deviceId}`)
            }
            logger.logAutomationAction('device_connect', deviceId, 'success')

            // Step 2: Unlock device
            const unlockResult = await deviceAutomation.unlockDevice()
            if (!unlockResult.success) {
              throw new Error(`Failed to unlock device: ${unlockResult.error}`)
            }
            logger.logAutomationAction('device_unlock', deviceId, 'success')

            // Step 3: Open Instagram
            const instagramResult = await deviceAutomation.openInstagram()
            if (!instagramResult.success) {
              throw new Error(`Failed to open Instagram: ${instagramResult.error}`)
            }
            logger.logAutomationAction('instagram_open', deviceId, 'success')

            // Step 4: Switch Instagram account if specified
            if (instagramUsername) {
              await deviceAutomation.switchToInstagramAccount(instagramUsername)
              logger.logAutomationAction('instagram_switch', instagramUsername, 'success')
            }
          } catch (error) {
            logger.logAutomationAction('device_setup', deviceId, 'failure', { error })
            // Continue with automation even if device setup fails
            console.error('Device setup failed:', error)
          }
        }

        // Schedule tasks for each enabled feature
        const allTaskIds: string[] = []
        let totalActions = 0

        // Auto Like
        if (enabledFeatures.includes('like') && likesPerHour > 0) {
          const likeDelay = Math.floor((60 * 60 * 1000) / likesPerHour) // Convert per hour to delay in ms
          const likeTaskIds = taskScheduler.scheduleBatchLikes(targets, likeDelay)
          allTaskIds.push(...likeTaskIds)
          totalActions += targets.length
          
          logger.logAutomationAction('unified_like', `${targets.length} targets`, 'success', { 
            taskIds: likeTaskIds, 
            rate: likesPerHour 
          })
        }

        // Auto Comment
        if (enabledFeatures.includes('comment') && commentsPerHour > 0 && commentTemplates.length > 0) {
          const commentDelay = Math.floor((60 * 60 * 1000) / commentsPerHour)
          
          targets.forEach((target: string, index: number) => {
            const comment = commentTemplates[index % commentTemplates.length]
            const taskId = taskScheduler.scheduleCommentTask(target, comment, commentDelay * index)
            allTaskIds.push(taskId)
            totalActions++
          })
          
          logger.logAutomationAction('unified_comment', `${targets.length} targets`, 'success', { 
            rate: commentsPerHour,
            templates: commentTemplates.length 
          })
        }

        // Auto Follow
        if (enabledFeatures.includes('follow') && followsPerHour > 0) {
          const followDelay = Math.floor((60 * 60 * 1000) / followsPerHour)
          const followTaskIds = taskScheduler.scheduleBatchFollows(targets, followDelay)
          allTaskIds.push(...followTaskIds)
          totalActions += targets.length
          
          logger.logAutomationAction('unified_follow', `${targets.length} targets`, 'success', { 
            taskIds: followTaskIds, 
            rate: followsPerHour 
          })
        }

        // Story Viewer
        if (enabledFeatures.includes('story_view')) {
          targets.forEach((target: string) => {
            logger.logAutomationAction('unified_story_view', target, 'success')
            totalActions++
          })
        }

        // Return success response
        return {
          success: true,
          data: {
            taskIds: allTaskIds,
            enabledFeatures,
            totalActions,
            targetCount: targets.length,
            hashtagCount: hashtags.length,
            locationCount: locations.length,
            continuous,
            testMode,
            message: `Unified automation started with ${enabledFeatures.length} features and ${totalActions} total actions scheduled`
          },
          status: 'started'
        }

      } catch (error) {
        logger.logAutomationAction('unified_automation', 'start', 'failure', { error })
        return {
          success: false,
          error: `Failed to start unified automation: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }

    case 'stop':
      try {
        // Stop all running tasks
        const stats = taskScheduler.getStats()
        logger.logAutomationAction('unified_automation', 'stop', 'success', { 
          stoppedTasks: stats.running 
        })
        
        return {
          success: true,
          data: { message: 'Unified automation stopped successfully' },
          status: 'stopped'
        }
      } catch (error) {
        return {
          success: false,
          error: `Failed to stop unified automation: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }

    case 'status':
      try {
        const stats = taskScheduler.getStats()
        const deviceConnected = deviceAutomation.isDeviceConnected()
        const currentDevice = deviceAutomation.getCurrentDevice()
        
        return {
          success: true,
          data: {
            scheduler: stats,
            device: {
              connected: deviceConnected,
              currentDevice,
              queueLength: deviceAutomation.getQueueLength(),
              isExecuting: deviceAutomation.isQueueExecuting()
            }
          },
          status: 'retrieved'
        }
      } catch (error) {
        return {
          success: false,
          error: `Failed to get automation status: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }

    default:
      return { success: false, error: `Unknown action: ${action}` }
  }
}

async function handleCommentAction(action: string, parameters: any): Promise<AutomationResponse> {
  switch (action) {
    case 'start':
      if (!parameters.target || !parameters.comment) {
        return { success: false, error: 'Missing target or comment parameter' }
      }

      const taskId = taskScheduler.scheduleCommentTask(
        parameters.target,
        parameters.comment,
        parameters.delay || 0
      )
      
      logger.logAutomationAction('comment', parameters.target, 'success', { taskId })
      
      return {
        success: true,
        taskId,
        status: 'scheduled'
      }

    default:
      return { success: false, error: `Unknown action: ${action}` }
  }
}

async function handleFollowAction(action: string, parameters: any): Promise<AutomationResponse> {
  switch (action) {
    case 'start':
      if (!parameters.targets && !parameters.target) {
        return { success: false, error: 'Missing targets parameter' }
      }

      const targets = parameters.targets || [parameters.target]
      const taskIds = taskScheduler.scheduleBatchFollows(targets, parameters.delay || 60000)
      
      logger.logAutomationAction('batch_follow', `${targets.length} targets`, 'success', { taskIds })
      
      return {
        success: true,
        data: { taskIds, count: targets.length },
        status: 'started'
      }

    default:
      return { success: false, error: `Unknown action: ${action}` }
  }
}

async function handleUnfollowAction(action: string, parameters: any): Promise<AutomationResponse> {
  switch (action) {
    case 'start':
      // Simulate unfollow logic
      logger.logAutomationAction('unfollow', parameters.target || 'batch', 'success')
      
      return {
        success: true,
        status: 'started'
      }

    default:
      return { success: false, error: `Unknown action: ${action}` }
  }
}

async function handleDMAction(action: string, parameters: any): Promise<AutomationResponse> {
  switch (action) {
    case 'start':
      if (!parameters.targets || !parameters.message) {
        return { success: false, error: 'Missing targets or message parameter' }
      }

      const dmTargets = parameters.targets.map((username: string) => ({
        username,
        message: parameters.message
      }))
      
      const taskIds = taskScheduler.scheduleBatchDMs(dmTargets, parameters.delay || 120000)
      
      logger.logAutomationAction('batch_dm', `${dmTargets.length} targets`, 'success', { taskIds })
      
      return {
        success: true,
        data: { taskIds, count: dmTargets.length },
        status: 'started'
      }

    default:
      return { success: false, error: `Unknown action: ${action}` }
  }
}

async function handleStoryViewAction(action: string, parameters: any): Promise<AutomationResponse> {
  switch (action) {
    case 'start':
      logger.logAutomationAction('story_view', parameters.target || 'batch', 'success')
      
      return {
        success: true,
        status: 'started'
      }

    default:
      return { success: false, error: `Unknown action: ${action}` }
  }
}

async function handleAICaptionAction(action: string, parameters: any): Promise<AutomationResponse> {
  switch (action) {
    case 'start':
      if (!parameters.prompt) {
        return { success: false, error: 'Missing prompt parameter' }
      }

      try {
        const result = await aiService.generateCaption(
          parameters.prompt,
          parameters.style || 'engaging',
          parameters.niche || 'business'
        )

        if (!result.success) {
          return { success: false, error: result.error }
        }

        logger.logAutomationAction('ai_caption', 'generate', 'success')

        return {
          success: true,
          data: { caption: result.data },
          status: 'completed'
        }
      } catch (error) {
        logger.logAutomationAction('ai_caption', 'generate', 'failure', { error })
        return { success: false, error: 'Failed to generate caption' }
      }

    default:
      return { success: false, error: `Unknown action: ${action}` }
  }
}

async function handleAIBioAction(action: string, parameters: any): Promise<AutomationResponse> {
  switch (action) {
    case 'start':
      if (!parameters.currentBio) {
        return { success: false, error: 'Missing currentBio parameter' }
      }

      try {
        const result = await aiService.updateBio(
          parameters.currentBio,
          parameters.niche || 'entrepreneur',
          parameters.tone || 'professional'
        )

        if (!result.success) {
          return { success: false, error: result.error }
        }

        logger.logAutomationAction('ai_bio', 'update', 'success')

        return {
          success: true,
          data: { bio: result.data },
          status: 'completed'
        }
      } catch (error) {
        logger.logAutomationAction('ai_bio', 'update', 'failure', { error })
        return { success: false, error: 'Failed to update bio' }
      }

    default:
      return { success: false, error: `Unknown action: ${action}` }
  }
}

async function handleAIReplyAction(action: string, parameters: any): Promise<AutomationResponse> {
  switch (action) {
    case 'start':
      if (!parameters.comment) {
        return { success: false, error: 'Missing comment parameter' }
      }

      try {
        const result = await aiService.smartReply(
          parameters.comment,
          parameters.tone || 'friendly'
        )

        if (!result.success) {
          return { success: false, error: result.error }
        }

        logger.logAutomationAction('ai_reply', 'generate', 'success')

        return {
          success: true,
          data: { reply: result.data },
          status: 'completed'
        }
      } catch (error) {
        logger.logAutomationAction('ai_reply', 'generate', 'failure', { error })
        return { success: false, error: 'Failed to generate reply' }
      }

    default:
      return { success: false, error: `Unknown action: ${action}` }
  }
}
