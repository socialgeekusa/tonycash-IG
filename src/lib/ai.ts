interface AIResponse {
  success: boolean
  data?: string
  error?: string
}

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

class AIService {
  private openaiKey: string = ''
  private claudeKey: string = ''
  private baseUrl: string = 'https://api.openai.com/v1'

  constructor() {
    // Load API keys from localStorage
    if (typeof window !== 'undefined') {
      const settings = localStorage.getItem('tonycash_settings')
      if (settings) {
        const parsed = JSON.parse(settings)
        this.openaiKey = parsed.openaiKey || ''
        this.claudeKey = parsed.claudeKey || ''
      }
    }
  }

  private async makeOpenAIRequest(messages: OpenAIMessage[], model: string = 'gpt-4'): Promise<AIResponse> {
    if (!this.openaiKey) {
      return { success: false, error: 'OpenAI API key not configured' }
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 500,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      return {
        success: true,
        data: data.choices[0]?.message?.content || ''
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async generateCaption(prompt: string, style: string = 'engaging', niche: string = 'business'): Promise<AIResponse> {
    const systemPrompt = `You are an expert Instagram content creator specializing in ${niche}. Create ${style} captions that drive engagement and align with current social media trends. Include relevant emojis and a clear call-to-action.`

    const userPrompt = `Create an Instagram caption for: ${prompt}

Requirements:
- Style: ${style}
- Include 3-5 relevant emojis
- Add a compelling call-to-action
- Keep it engaging and authentic
- Length: 2-4 sentences`

    return this.makeOpenAIRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ])
  }

  async updateBio(currentBio: string, niche: string = 'entrepreneur', tone: string = 'professional'): Promise<AIResponse> {
    const systemPrompt = `You are an expert at creating compelling Instagram bios. Create bios that are memorable, clear about value proposition, and optimized for the ${niche} niche with a ${tone} tone.`

    const userPrompt = `Update this Instagram bio to be more engaging and effective:

Current bio: "${currentBio}"

Requirements:
- Niche: ${niche}
- Tone: ${tone}
- Include relevant emojis (2-4)
- Clear value proposition
- Call-to-action or contact info
- Maximum 150 characters
- Make it memorable and professional`

    return this.makeOpenAIRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ])
  }

  async smartReply(commentContext: string, replyTone: string = 'friendly'): Promise<AIResponse> {
    const systemPrompt = `You are a social media manager creating authentic, ${replyTone} replies to Instagram comments. Keep responses natural, engaging, and brand-appropriate.`

    const userPrompt = `Create a ${replyTone} reply to this Instagram comment:

Comment: "${commentContext}"

Requirements:
- Tone: ${replyTone}
- Keep it brief (1-2 sentences)
- Include 1-2 relevant emojis
- Sound natural and authentic
- Show appreciation when appropriate`

    return this.makeOpenAIRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ])
  }

  async optimizeHashtags(currentHashtags: string, niche: string = 'business', targetSize: string = 'mixed'): Promise<AIResponse> {
    const systemPrompt = `You are a hashtag optimization expert. Create strategic hashtag sets that maximize reach and engagement for ${niche} content.`

    const userPrompt = `Optimize these hashtags for better Instagram reach:

Current hashtags: ${currentHashtags}

Requirements:
- Niche: ${niche}
- Target size: ${targetSize}
- Provide exactly 30 hashtags
- Mix of popular, medium, and niche hashtags
- Remove banned or low-performing hashtags
- Include trending hashtags when relevant
- Format as space-separated list`

    return this.makeOpenAIRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ])
  }

  async generateCommentTemplates(niche: string = 'business', count: number = 10): Promise<AIResponse> {
    const systemPrompt = `You are an expert at creating authentic Instagram comment templates for ${niche} accounts. Create comments that feel genuine and encourage engagement.`

    const userPrompt = `Create ${count} authentic comment templates for ${niche} Instagram posts.

Requirements:
- Sound natural and genuine
- Include relevant emojis
- Vary in length and style
- Encourage further engagement
- Avoid spam-like language
- Include spintax variations where appropriate
- Format: one comment per line`

    return this.makeOpenAIRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ])
  }

  async generateDMTemplate(purpose: string, niche: string = 'business', tone: string = 'professional'): Promise<AIResponse> {
    const systemPrompt = `You are an expert at creating effective Instagram DM templates for ${niche} outreach with a ${tone} tone.`

    const userPrompt = `Create a DM template for: ${purpose}

Requirements:
- Purpose: ${purpose}
- Niche: ${niche}
- Tone: ${tone}
- Include personalization variables like {name}, {niche}, {followers}
- Keep it concise but compelling
- Include a clear call-to-action
- Sound authentic, not salesy
- Add spintax for variation`

    return this.makeOpenAIRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ])
  }

  async analyzeContent(content: string): Promise<AIResponse> {
    const systemPrompt = `You are a social media analytics expert. Analyze Instagram content and provide actionable insights for improvement.`

    const userPrompt = `Analyze this Instagram content and provide improvement suggestions:

Content: "${content}"

Provide analysis on:
- Engagement potential (1-10 score)
- Tone and voice
- Call-to-action effectiveness
- Hashtag relevance
- Improvement suggestions
- Target audience alignment`

    return this.makeOpenAIRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ])
  }

  async testConnection(): Promise<AIResponse> {
    try {
      const response = await this.makeOpenAIRequest([
        { role: 'user', content: 'Test connection - respond with "Connection successful"' }
      ])
      
      if (response.success && response.data?.includes('Connection successful')) {
        return { success: true, data: 'AI service connection successful' }
      } else {
        return { success: false, error: 'Connection test failed' }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      }
    }
  }

  // Utility method to process spintax
  processSpintax(text: string): string {
    return text.replace(/\{([^}]+)\}/g, (match, options) => {
      const choices = options.split('|')
      return choices[Math.floor(Math.random() * choices.length)]
    })
  }

  // Update API keys
  updateApiKeys(openaiKey: string, claudeKey: string = '') {
    this.openaiKey = openaiKey
    this.claudeKey = claudeKey
  }
}

// Export singleton instance
export const aiService = new AIService()

// Export types
export type { AIResponse, OpenAIMessage }
