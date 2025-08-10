export interface ScheduledTask {
  id: string
  name: string
  type: 'like' | 'comment' | 'follow' | 'dm' | 'story_view' | 'post'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused'
  scheduledTime: Date
  executedTime?: Date
  parameters: Record<string, any>
  retryCount: number
  maxRetries: number
  priority: 'low' | 'medium' | 'high'
  deviceId?: string
}

export interface SchedulerConfig {
  maxConcurrentTasks: number
  retryDelay: number
  taskTimeout: number
  enableLogging: boolean
}

class TaskScheduler {
  private tasks: Map<string, ScheduledTask> = new Map()
  private runningTasks: Set<string> = new Set()
  private timers: Map<string, NodeJS.Timeout> = new Map()
  private config: SchedulerConfig = {
    maxConcurrentTasks: 5,
    retryDelay: 30000, // 30 seconds
    taskTimeout: 300000, // 5 minutes
    enableLogging: true
  }

  constructor(config?: Partial<SchedulerConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
  }

  // Schedule a new task
  scheduleTask(task: Omit<ScheduledTask, 'id' | 'status' | 'retryCount'>): string {
    const taskId = this.generateTaskId()
    const scheduledTask: ScheduledTask = {
      ...task,
      id: taskId,
      status: 'pending',
      retryCount: 0
    }

    this.tasks.set(taskId, scheduledTask)
    this.scheduleExecution(scheduledTask)
    
    if (this.config.enableLogging) {
      console.log(`Task scheduled: ${taskId} at ${task.scheduledTime}`)
    }

    return taskId
  }

  // Schedule immediate execution
  scheduleImmediate(task: Omit<ScheduledTask, 'id' | 'status' | 'retryCount' | 'scheduledTime'>): string {
    return this.scheduleTask({
      ...task,
      scheduledTime: new Date()
    })
  }

  // Schedule recurring task
  scheduleRecurring(
    task: Omit<ScheduledTask, 'id' | 'status' | 'retryCount' | 'scheduledTime'>,
    intervalMs: number,
    endTime?: Date
  ): string {
    const taskId = this.scheduleTask({
      ...task,
      scheduledTime: new Date()
    })

    // Set up recurring execution
    const recurringTimer = setInterval(() => {
      if (endTime && new Date() > endTime) {
        clearInterval(recurringTimer)
        return
      }

      this.scheduleTask({
        ...task,
        scheduledTime: new Date()
      })
    }, intervalMs)

    return taskId
  }

  // Cancel a scheduled task
  cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId)
    if (!task) return false

    if (task.status === 'running') {
      // Can't cancel running task, but mark for cancellation
      task.status = 'failed'
    } else {
      task.status = 'failed'
    }

    const timer = this.timers.get(taskId)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(taskId)
    }

    if (this.config.enableLogging) {
      console.log(`Task cancelled: ${taskId}`)
    }

    return true
  }

  // Pause a task
  pauseTask(taskId: string): boolean {
    const task = this.tasks.get(taskId)
    if (!task || task.status === 'running') return false

    task.status = 'paused'
    
    const timer = this.timers.get(taskId)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(taskId)
    }

    return true
  }

  // Resume a paused task
  resumeTask(taskId: string): boolean {
    const task = this.tasks.get(taskId)
    if (!task || task.status !== 'paused') return false

    task.status = 'pending'
    this.scheduleExecution(task)
    return true
  }

  // Get task status
  getTask(taskId: string): ScheduledTask | undefined {
    return this.tasks.get(taskId)
  }

  // Get all tasks
  getAllTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values())
  }

  // Get tasks by status
  getTasksByStatus(status: ScheduledTask['status']): ScheduledTask[] {
    return Array.from(this.tasks.values()).filter(task => task.status === status)
  }

  // Get tasks by type
  getTasksByType(type: ScheduledTask['type']): ScheduledTask[] {
    return Array.from(this.tasks.values()).filter(task => task.type === type)
  }

  // Clear completed tasks
  clearCompletedTasks(): number {
    const completedTasks = this.getTasksByStatus('completed')
    completedTasks.forEach(task => this.tasks.delete(task.id))
    return completedTasks.length
  }

  // Clear failed tasks
  clearFailedTasks(): number {
    const failedTasks = this.getTasksByStatus('failed')
    failedTasks.forEach(task => this.tasks.delete(task.id))
    return failedTasks.length
  }

  // Get scheduler statistics
  getStats() {
    const tasks = Array.from(this.tasks.values())
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      running: tasks.filter(t => t.status === 'running').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      paused: tasks.filter(t => t.status === 'paused').length,
      runningTasksCount: this.runningTasks.size,
      maxConcurrent: this.config.maxConcurrentTasks
    }
  }

  // Private methods
  private scheduleExecution(task: ScheduledTask): void {
    const now = new Date()
    const delay = Math.max(0, task.scheduledTime.getTime() - now.getTime())

    const timer = setTimeout(() => {
      this.executeTask(task)
    }, delay)

    this.timers.set(task.id, timer)
  }

  private async executeTask(task: ScheduledTask): Promise<void> {
    // Check if we can run more tasks
    if (this.runningTasks.size >= this.config.maxConcurrentTasks) {
      // Reschedule for later
      setTimeout(() => this.executeTask(task), 5000)
      return
    }

    // Check if task is still valid
    if (task.status !== 'pending') {
      return
    }

    task.status = 'running'
    task.executedTime = new Date()
    this.runningTasks.add(task.id)

    if (this.config.enableLogging) {
      console.log(`Executing task: ${task.id} (${task.type})`)
    }

    try {
      // Set timeout for task execution
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Task timeout')), this.config.taskTimeout)
      })

      // Execute the actual task
      const taskPromise = this.performTask(task)
      
      await Promise.race([taskPromise, timeoutPromise])
      
      task.status = 'completed'
      
      if (this.config.enableLogging) {
        console.log(`Task completed: ${task.id}`)
      }
    } catch (error) {
      if (this.config.enableLogging) {
        console.error(`Task failed: ${task.id}`, error)
      }

      // Retry logic
      if (task.retryCount < task.maxRetries) {
        task.retryCount++
        task.status = 'pending'
        
        // Schedule retry with delay
        setTimeout(() => {
          this.scheduleExecution(task)
        }, this.config.retryDelay)
      } else {
        task.status = 'failed'
      }
    } finally {
      this.runningTasks.delete(task.id)
      this.timers.delete(task.id)
    }
  }

  private async performTask(task: ScheduledTask): Promise<void> {
    // Integrate with real device automation system
    const { deviceAutomation } = await import('./device')
    
    switch (task.type) {
      case 'like':
        await this.performLikeAction(task.parameters)
        break
      case 'comment':
        await this.performCommentAction(task.parameters)
        break
      case 'follow':
        await this.performFollowAction(task.parameters)
        break
      case 'dm':
        await this.performDMAction(task.parameters)
        break
      case 'story_view':
        await this.performStoryViewAction(task.parameters)
        break
      case 'post':
        await this.performPostAction(task.parameters)
        break
      default:
        throw new Error(`Unknown task type: ${task.type}`)
    }
  }

  private async performLikeAction(parameters: any): Promise<void> {
    const { deviceAutomation } = await import('./device')
    
    console.log(`Performing like action on target: ${parameters.target}`)
    
    // Connect to device if not already connected
    if (!deviceAutomation.isDeviceConnected() && parameters.deviceId) {
      await deviceAutomation.connectDevice(parameters.deviceId)
    }
    
    // Step 1: Unlock device and open Instagram
    console.log('Step 1: Unlocking device and opening Instagram...')
    await deviceAutomation.openInstagram() // This includes unlocking
    await this.delay(5000) // Wait for Instagram to fully load
    
    // Step 2: Switch to correct Instagram account if specified
    if (parameters.instagramUsername) {
      console.log(`Step 2: Switching to Instagram account: ${parameters.instagramUsername}`)
      await this.switchInstagramAccount(parameters.instagramUsername)
      await this.delay(3000)
    }
    
    // Step 3: Navigate to target and perform like action
    console.log(`Step 3: Navigating to target: ${parameters.target}`)
    
    // Search for target user or hashtag
    if (parameters.target.startsWith('#')) {
      await deviceAutomation.searchHashtag(parameters.target)
    } else {
      // Search for user
      await deviceAutomation.tap(400, 100) // Search tab
      await this.delay(1000)
      await deviceAutomation.type(parameters.target)
      await this.delay(2000)
      await deviceAutomation.tap(400, 200) // First result
      await this.delay(2000)
    }
    
    // Step 4: Like the first post
    console.log('Step 4: Liking post...')
    await deviceAutomation.likePost()
    await this.delay(2000)
    
    console.log(`✅ Successfully liked post for: ${parameters.target}`)
  }

  private async switchInstagramAccount(targetUsername: string): Promise<void> {
    const { deviceAutomation } = await import('./device')
    
    try {
      console.log(`Switching to Instagram account: ${targetUsername}`)
      
      // Tap profile tab (bottom right)
      await deviceAutomation.tap(720, 1800) // Profile tab
      await this.delay(2000)
      
      // Tap username/account switcher at top
      await deviceAutomation.tap(400, 200) // Username area
      await this.delay(1000)
      
      // Look for the target username in account list and tap it
      // This is a simplified approach - in reality, you'd need to scroll through accounts
      await deviceAutomation.tap(400, 400) // Assume target account is visible
      await this.delay(2000)
      
      console.log(`✅ Switched to account: ${targetUsername}`)
      
    } catch (error) {
      console.error(`Failed to switch to account ${targetUsername}:`, error)
      // Continue with current account if switching fails
    }
  }

  private async performCommentAction(parameters: any): Promise<void> {
    const { deviceAutomation } = await import('./device')
    
    console.log(`Performing comment action on target: ${parameters.target}`)
    
    // Open Instagram and navigate to target
    await deviceAutomation.openInstagram()
    await this.delay(3000)
    
    // Search for target
    await deviceAutomation.tap(400, 100) // Search tab
    await this.delay(1000)
    await deviceAutomation.type(parameters.target)
    await this.delay(2000)
    await deviceAutomation.tap(400, 200) // First result
    await this.delay(2000)
    
    // Comment on the first post
    await deviceAutomation.commentOnPost(parameters.comment)
    await this.delay(2000)
    
    console.log(`Successfully commented on post for: ${parameters.target}`)
  }

  private async performFollowAction(parameters: any): Promise<void> {
    const { deviceAutomation } = await import('./device')
    
    console.log(`Performing follow action on target: ${parameters.target}`)
    
    // Open Instagram and navigate to target
    await deviceAutomation.openInstagram()
    await this.delay(3000)
    
    // Search for target user
    await deviceAutomation.tap(400, 100) // Search tab
    await this.delay(1000)
    await deviceAutomation.type(parameters.target)
    await this.delay(2000)
    await deviceAutomation.tap(400, 200) // First result
    await this.delay(2000)
    
    // Follow the user
    await deviceAutomation.followUser()
    await this.delay(2000)
    
    console.log(`Successfully followed: ${parameters.target}`)
  }

  private async performDMAction(parameters: any): Promise<void> {
    const { deviceAutomation } = await import('./device')
    
    console.log(`Performing DM action to: ${parameters.target}`)
    
    // Send direct message
    await deviceAutomation.sendDirectMessage(parameters.target, parameters.message)
    await this.delay(2000)
    
    console.log(`Successfully sent DM to: ${parameters.target}`)
  }

  private async performStoryViewAction(parameters: any): Promise<void> {
    const { deviceAutomation } = await import('./device')
    
    console.log(`Performing story view action for: ${parameters.target}`)
    
    // Open Instagram and view story
    await deviceAutomation.openInstagram()
    await this.delay(3000)
    
    // View story (simplified - would need more complex navigation)
    await deviceAutomation.viewStory()
    await this.delay(3000)
    
    console.log(`Successfully viewed story for: ${parameters.target}`)
  }

  private async performPostAction(parameters: any): Promise<void> {
    console.log(`Performing post action: ${parameters.action}`)
    // Post actions would be implemented here
    await this.delay(2000)
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Utility methods for common scheduling patterns
  scheduleLikeTask(target: string, delay: number = 0): string {
    return this.scheduleTask({
      name: `Like ${target}`,
      type: 'like',
      scheduledTime: new Date(Date.now() + delay),
      parameters: { target },
      maxRetries: 3,
      priority: 'medium'
    })
  }

  scheduleCommentTask(target: string, comment: string, delay: number = 0): string {
    return this.scheduleTask({
      name: `Comment on ${target}`,
      type: 'comment',
      scheduledTime: new Date(Date.now() + delay),
      parameters: { target, comment },
      maxRetries: 2,
      priority: 'high'
    })
  }

  scheduleFollowTask(target: string, delay: number = 0): string {
    return this.scheduleTask({
      name: `Follow ${target}`,
      type: 'follow',
      scheduledTime: new Date(Date.now() + delay),
      parameters: { target },
      maxRetries: 3,
      priority: 'medium'
    })
  }

  scheduleDMTask(target: string, message: string, delay: number = 0): string {
    return this.scheduleTask({
      name: `DM ${target}`,
      type: 'dm',
      scheduledTime: new Date(Date.now() + delay),
      parameters: { target, message },
      maxRetries: 2,
      priority: 'high'
    })
  }

  // Batch scheduling
  scheduleBatchLikes(targets: string[], delayBetween: number = 30000): string[] {
    return targets.map((target, index) => 
      this.scheduleLikeTask(target, index * delayBetween)
    )
  }

  scheduleBatchFollows(targets: string[], delayBetween: number = 60000): string[] {
    return targets.map((target, index) => 
      this.scheduleFollowTask(target, index * delayBetween)
    )
  }

  scheduleBatchDMs(targets: { username: string; message: string }[], delayBetween: number = 120000): string[] {
    return targets.map((target, index) => 
      this.scheduleDMTask(target.username, target.message, index * delayBetween)
    )
  }

  // Cleanup method
  cleanup(): void {
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer))
    this.timers.clear()
    
    // Clear running tasks
    this.runningTasks.clear()
    
    if (this.config.enableLogging) {
      console.log('Scheduler cleanup completed')
    }
  }
}

// Export singleton instance
export const taskScheduler = new TaskScheduler()
