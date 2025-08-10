'use client'

export interface ImportResult<T> {
  success: boolean
  data?: T[]
  errors?: string[]
  totalProcessed: number
  totalValid: number
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'yaml'
  includeHeaders?: boolean
  delimiter?: string
}

// CSV parsing and generation
export class CSVHandler {
  static parse<T>(csvContent: string, headers?: string[]): ImportResult<T> {
    try {
      const lines = csvContent.trim().split('\n')
      if (lines.length === 0) {
        return {
          success: false,
          errors: ['Empty CSV file'],
          totalProcessed: 0,
          totalValid: 0
        }
      }

      // Extract headers
      const csvHeaders = headers || this.parseCSVLine(lines[0])
      const dataLines = headers ? lines : lines.slice(1)
      
      const data: T[] = []
      const errors: string[] = []

      dataLines.forEach((line, index) => {
        try {
          const values = this.parseCSVLine(line)
          if (values.length !== csvHeaders.length) {
            errors.push(`Line ${index + 1}: Column count mismatch`)
            return
          }

          const obj: any = {}
          csvHeaders.forEach((header, i) => {
            obj[header.trim()] = values[i]?.trim() || ''
          })

          data.push(obj as T)
        } catch (error) {
          errors.push(`Line ${index + 1}: ${error instanceof Error ? error.message : 'Parse error'}`)
        }
      })

      return {
        success: errors.length === 0,
        data,
        errors: errors.length > 0 ? errors : undefined,
        totalProcessed: dataLines.length,
        totalValid: data.length
      }
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        totalProcessed: 0,
        totalValid: 0
      }
    }
  }

  static generate<T>(data: T[], options: ExportOptions = { format: 'csv' }): string {
    if (data.length === 0) return ''

    const headers = Object.keys(data[0] as object)
    const delimiter = options.delimiter || ','
    
    let csv = ''
    
    // Add headers if requested
    if (options.includeHeaders !== false) {
      csv += headers.map(h => this.escapeCSVValue(h)).join(delimiter) + '\n'
    }

    // Add data rows
    data.forEach(item => {
      const values = headers.map(header => {
        const value = (item as any)[header]
        return this.escapeCSVValue(String(value || ''))
      })
      csv += values.join(delimiter) + '\n'
    })

    return csv
  }

  private static parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    let i = 0

    while (i < line.length) {
      const char = line[i]
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"'
          i += 2
        } else {
          // Toggle quote state
          inQuotes = !inQuotes
          i++
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current)
        current = ''
        i++
      } else {
        current += char
        i++
      }
    }
    
    result.push(current)
    return result
  }

  private static escapeCSVValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }
}

// JSON handling
export class JSONHandler {
  static parse<T>(jsonContent: string): ImportResult<T> {
    try {
      const parsed = JSON.parse(jsonContent)
      const data = Array.isArray(parsed) ? parsed : [parsed]
      
      return {
        success: true,
        data,
        totalProcessed: data.length,
        totalValid: data.length
      }
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Invalid JSON'],
        totalProcessed: 0,
        totalValid: 0
      }
    }
  }

  static generate<T>(data: T[]): string {
    return JSON.stringify(data, null, 2)
  }
}

// YAML handling (basic implementation)
export class YAMLHandler {
  static parse<T>(yamlContent: string): ImportResult<T> {
    try {
      // Basic YAML parsing - in a real implementation, you'd use a proper YAML library
      const lines = yamlContent.split('\n')
      const data: any[] = []
      let currentItem: any = {}
      
      lines.forEach(line => {
        const trimmed = line.trim()
        if (trimmed === '' || trimmed.startsWith('#')) return
        
        if (trimmed === '-') {
          if (Object.keys(currentItem).length > 0) {
            data.push(currentItem)
            currentItem = {}
          }
        } else if (trimmed.includes(':')) {
          const [key, ...valueParts] = trimmed.split(':')
          const value = valueParts.join(':').trim()
          currentItem[key.trim()] = value
        }
      })
      
      if (Object.keys(currentItem).length > 0) {
        data.push(currentItem)
      }
      
      return {
        success: true,
        data,
        totalProcessed: data.length,
        totalValid: data.length
      }
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Invalid YAML'],
        totalProcessed: 0,
        totalValid: 0
      }
    }
  }

  static generate<T>(data: T[]): string {
    let yaml = ''
    data.forEach(item => {
      yaml += '-\n'
      Object.entries(item as object).forEach(([key, value]) => {
        yaml += `  ${key}: ${value}\n`
      })
    })
    return yaml
  }
}

// Main import/export functions
export async function importFromFile<T>(file: File): Promise<ImportResult<T>> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const content = e.target?.result as string
      const extension = file.name.split('.').pop()?.toLowerCase()
      
      let result: ImportResult<T>
      
      switch (extension) {
        case 'csv':
          result = CSVHandler.parse<T>(content)
          break
        case 'json':
          result = JSONHandler.parse<T>(content)
          break
        case 'yaml':
        case 'yml':
          result = YAMLHandler.parse<T>(content)
          break
        default:
          result = {
            success: false,
            errors: [`Unsupported file format: ${extension}`],
            totalProcessed: 0,
            totalValid: 0
          }
      }
      
      resolve(result)
    }
    
    reader.onerror = () => {
      resolve({
        success: false,
        errors: ['Failed to read file'],
        totalProcessed: 0,
        totalValid: 0
      })
    }
    
    reader.readAsText(file)
  })
}

export function exportToFile<T>(data: T[], filename: string, options: ExportOptions): void {
  let content: string
  let mimeType: string
  
  switch (options.format) {
    case 'csv':
      content = CSVHandler.generate(data, options)
      mimeType = 'text/csv'
      break
    case 'json':
      content = JSONHandler.generate(data)
      mimeType = 'application/json'
      break
    case 'yaml':
      content = YAMLHandler.generate(data)
      mimeType = 'text/yaml'
      break
    default:
      throw new Error(`Unsupported export format: ${options.format}`)
  }
  
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Specialized import/export functions for TonyCash Tool

export interface TargetUser {
  username: string
  fullName?: string
  followers?: number
  following?: number
  posts?: number
  verified?: boolean
  businessAccount?: boolean
  category?: string
  bio?: string
  website?: string
  location?: string
  lastActive?: string
  engagementRate?: number
  tags?: string[]
}

export interface DMTemplate {
  name: string
  subject?: string
  message: string
  variables?: string[]
  category?: string
  language?: string
  tone?: string
  followUpDelay?: number
  maxFollowUps?: number
}

export interface HashtagSet {
  name: string
  hashtags: string[]
  category?: string
  size?: 'small' | 'medium' | 'large' | 'mixed'
  language?: string
  lastUpdated?: string
}

export interface CommentTemplate {
  template: string
  category?: string
  tone?: string
  language?: string
  spintax?: boolean
}

// Import target users from CSV/JSON
export async function importTargetUsers(file: File): Promise<ImportResult<TargetUser>> {
  const result = await importFromFile<TargetUser>(file)
  
  if (result.success && result.data) {
    // Validate and clean data
    result.data = result.data.map(user => ({
      ...user,
      username: user.username?.replace('@', ''), // Remove @ if present
      followers: user.followers ? parseInt(String(user.followers)) : undefined,
      following: user.following ? parseInt(String(user.following)) : undefined,
      posts: user.posts ? parseInt(String(user.posts)) : undefined,
      verified: user.verified === 'true' || user.verified === true,
      businessAccount: user.businessAccount === 'true' || user.businessAccount === true,
      engagementRate: user.engagementRate ? parseFloat(String(user.engagementRate)) : undefined,
      tags: typeof user.tags === 'string' ? user.tags.split(',').map(t => t.trim()) : user.tags
    }))
  }
  
  return result
}

// Export target users
export function exportTargetUsers(users: TargetUser[], format: 'csv' | 'json' = 'csv'): void {
  const filename = `target-users-${new Date().toISOString().split('T')[0]}.${format}`
  exportToFile(users, filename, { format })
}

// Import DM templates
export async function importDMTemplates(file: File): Promise<ImportResult<DMTemplate>> {
  return importFromFile<DMTemplate>(file)
}

// Export DM templates
export function exportDMTemplates(templates: DMTemplate[], format: 'csv' | 'json' = 'json'): void {
  const filename = `dm-templates-${new Date().toISOString().split('T')[0]}.${format}`
  exportToFile(templates, filename, { format })
}

// Import hashtag sets
export async function importHashtagSets(file: File): Promise<ImportResult<HashtagSet>> {
  const result = await importFromFile<HashtagSet>(file)
  
  if (result.success && result.data) {
    // Process hashtags
    result.data = result.data.map(set => ({
      ...set,
      hashtags: typeof set.hashtags === 'string' 
        ? set.hashtags.split(',').map(h => h.trim().replace('#', ''))
        : set.hashtags?.map(h => String(h).replace('#', '')) || []
    }))
  }
  
  return result
}

// Export hashtag sets
export function exportHashtagSets(sets: HashtagSet[], format: 'csv' | 'json' = 'json'): void {
  const filename = `hashtag-sets-${new Date().toISOString().split('T')[0]}.${format}`
  exportToFile(sets, filename, { format })
}

// Import comment templates
export async function importCommentTemplates(file: File): Promise<ImportResult<CommentTemplate>> {
  return importFromFile<CommentTemplate>(file)
}

// Export comment templates
export function exportCommentTemplates(templates: CommentTemplate[], format: 'csv' | 'json' = 'csv'): void {
  const filename = `comment-templates-${new Date().toISOString().split('T')[0]}.${format}`
  exportToFile(templates, filename, { format })
}

// Bulk operations
export function createSampleTargetUsersCSV(): string {
  const sampleData: TargetUser[] = [
    {
      username: 'entrepreneur_mike',
      fullName: 'Mike Johnson',
      followers: 15000,
      following: 1200,
      posts: 450,
      verified: false,
      businessAccount: true,
      category: 'Business',
      bio: 'CEO & Founder | Building the future',
      engagementRate: 4.2,
      tags: ['entrepreneur', 'business', 'startup']
    },
    {
      username: 'fitness_sarah',
      fullName: 'Sarah Wilson',
      followers: 8500,
      following: 800,
      posts: 320,
      verified: false,
      businessAccount: false,
      category: 'Fitness',
      bio: 'Personal Trainer | Fitness Coach',
      engagementRate: 6.1,
      tags: ['fitness', 'health', 'wellness']
    }
  ]
  
  return CSVHandler.generate(sampleData, { format: 'csv', includeHeaders: true })
}

export function createSampleDMTemplatesJSON(): string {
  const sampleData: DMTemplate[] = [
    {
      name: 'Business Networking',
      message: 'Hi {name}! I love your content about {niche}. I\'d love to connect and share some insights that might help your business grow. Are you open to a quick chat?',
      variables: ['name', 'niche'],
      category: 'networking',
      tone: 'professional',
      followUpDelay: 24,
      maxFollowUps: 2
    },
    {
      name: 'Collaboration Outreach',
      message: 'Hey {name}! I noticed we\'re both in the {niche} space. I have an idea for a collaboration that could benefit both our audiences. Interested in hearing more?',
      variables: ['name', 'niche'],
      category: 'collaboration',
      tone: 'friendly',
      followUpDelay: 48,
      maxFollowUps: 1
    }
  ]
  
  return JSONHandler.generate(sampleData)
}
