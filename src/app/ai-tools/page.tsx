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
import { toast } from 'sonner'

export default function AITools() {
  const [currentBio, setCurrentBio] = useState('')
  const [generatedBio, setGeneratedBio] = useState('')
  const [captionPrompt, setCaptionPrompt] = useState('')
  const [generatedCaption, setGeneratedCaption] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [generatedHashtags, setGeneratedHashtags] = useState('')
  const [replyContext, setReplyContext] = useState('')
  const [generatedReply, setGeneratedReply] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateBio = async () => {
    if (!currentBio.trim()) {
      toast.error('Please enter your current bio')
      return
    }

    setIsGenerating(true)
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const bios = [
        "🚀 Entrepreneur | Building the future one idea at a time | DM for collabs ✨",
        "💡 Innovation enthusiast | Turning dreams into reality | Let's connect! 🌟",
        "🎯 Business strategist | Helping others achieve their goals | Follow for insights 📈"
      ]
      
      setGeneratedBio(bios[Math.floor(Math.random() * bios.length)])
      toast.success('Bio generated successfully!')
    } catch (error) {
      toast.error('Failed to generate bio')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateCaption = async () => {
    if (!captionPrompt.trim()) {
      toast.error('Please describe your content')
      return
    }

    setIsGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const captions = [
        "Just dropped some serious value! 💎 What's your biggest takeaway from this? Let me know in the comments! 👇\n\n#entrepreneur #business #success #motivation",
        "This changed everything for me... 🔥 Save this post if you found it helpful! Double tap if you agree 💯\n\n#mindset #growth #hustle #inspiration",
        "The secret sauce to success? It's simpler than you think... ✨ Tag someone who needs to see this! 🙌\n\n#businesstips #wealth #freedom #lifestyle"
      ]
      
      setGeneratedCaption(captions[Math.floor(Math.random() * captions.length)])
      toast.success('Caption generated successfully!')
    } catch (error) {
      toast.error('Failed to generate caption')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleOptimizeHashtags = async () => {
    if (!hashtags.trim()) {
      toast.error('Please enter some hashtags')
      return
    }

    setIsGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const optimizedHashtags = [
        "#entrepreneur #business #success #motivation #mindset #hustle #wealth #freedom #inspiration #goals #leadership #innovation #startup #businessowner #millionaire #lifestyle #growth #productivity #networking #investing #financialfreedom #businesstips #entrepreneurlife #successmindset #workhard #dreambig #achievemore #buildwealth #createvalue #thinkbig",
        "#fitness #health #workout #gym #fit #healthy #strong #motivation #fitnessmotivation #bodybuilding #training #exercise #wellness #lifestyle #nutrition #muscle #strength #cardio #weightloss #transformation #fitnessjourney #healthylifestyle #fitfam #gymlife #personaltrainer #crossfit #yoga #running #athletics #sports"
      ]
      
      setGeneratedHashtags(optimizedHashtags[0])
      toast.success('Hashtags optimized successfully!')
    } catch (error) {
      toast.error('Failed to optimize hashtags')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateReply = async () => {
    if (!replyContext.trim()) {
      toast.error('Please enter the comment context')
      return
    }

    setIsGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const replies = [
        "Thank you so much! Really appreciate your support 🙏",
        "Absolutely! Glad you found it helpful 💯",
        "Thanks for watching! More content like this coming soon ✨",
        "You're amazing! Thanks for the positive vibes 🔥"
      ]
      
      setGeneratedReply(replies[Math.floor(Math.random() * replies.length)])
      toast.success('Reply generated successfully!')
    } catch (error) {
      toast.error('Failed to generate reply')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Advanced AI Tools</h1>
        <p className="text-muted-foreground">
          AI-powered content creation and optimization tools
        </p>
      </div>

      <Tabs defaultValue="bio-updater" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bio-updater">AI Bio Updater</TabsTrigger>
          <TabsTrigger value="caption-generator">Caption Generator</TabsTrigger>
          <TabsTrigger value="hashtag-optimizer">Hashtag Optimizer</TabsTrigger>
          <TabsTrigger value="smart-reply">Smart Reply Assistant</TabsTrigger>
        </TabsList>

        {/* AI Bio Updater */}
        <TabsContent value="bio-updater">
          <Card>
            <CardHeader>
              <CardTitle>AI Bio Updater</CardTitle>
              <CardDescription>
                Automatically refresh your bio with trendy, niche-focused messaging
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="current-bio">Current Bio</Label>
                  <Textarea
                    id="current-bio"
                    value={currentBio}
                    onChange={(e) => setCurrentBio(e.target.value)}
                    placeholder="Enter your current Instagram bio..."
                    className="mt-1 h-24"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bio-niche">Your Niche</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select your niche" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                        <SelectItem value="fitness">Fitness</SelectItem>
                        <SelectItem value="lifestyle">Lifestyle</SelectItem>
                        <SelectItem value="fashion">Fashion</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="tech">Technology</SelectItem>
                        <SelectItem value="art">Art & Design</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bio-tone">Tone</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="motivational">Motivational</SelectItem>
                        <SelectItem value="funny">Funny</SelectItem>
                        <SelectItem value="inspiring">Inspiring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bio Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="include-emojis" defaultChecked />
                      <Label htmlFor="include-emojis">Include emojis</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="include-cta" defaultChecked />
                      <Label htmlFor="include-cta">Include call-to-action</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="include-contact" />
                      <Label htmlFor="include-contact">Include contact info</Label>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleGenerateBio}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? 'Generating Bio...' : 'Generate New Bio'}
                </Button>

                {generatedBio && (
                  <div className="space-y-2">
                    <Label>Generated Bio</Label>
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <p className="text-sm">{generatedBio}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => navigator.clipboard.writeText(generatedBio)}>
                        Copy Bio
                      </Button>
                      <Button size="sm" variant="outline">
                        Use This Bio
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleGenerateBio}>
                        Generate Another
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Caption Generator */}
        <TabsContent value="caption-generator">
          <Card>
            <CardHeader>
              <CardTitle>Caption Generator</CardTitle>
              <CardDescription>
                AI-powered captions based on your content and niche
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="caption-prompt">Describe Your Content</Label>
                  <Textarea
                    id="caption-prompt"
                    value={captionPrompt}
                    onChange={(e) => setCaptionPrompt(e.target.value)}
                    placeholder="Describe what your post is about, the message you want to convey, or upload an image..."
                    className="mt-1 h-24"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="caption-style">Caption Style</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engaging">Engaging</SelectItem>
                        <SelectItem value="educational">Educational</SelectItem>
                        <SelectItem value="inspirational">Inspirational</SelectItem>
                        <SelectItem value="storytelling">Storytelling</SelectItem>
                        <SelectItem value="question">Question-based</SelectItem>
                        <SelectItem value="listicle">List format</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="caption-length">Length</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short (1-2 lines)</SelectItem>
                        <SelectItem value="medium">Medium (3-5 lines)</SelectItem>
                        <SelectItem value="long">Long (6+ lines)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="caption-cta">Call to Action</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select CTA" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="like">Ask for likes</SelectItem>
                        <SelectItem value="comment">Ask for comments</SelectItem>
                        <SelectItem value="share">Ask for shares</SelectItem>
                        <SelectItem value="follow">Ask for follows</SelectItem>
                        <SelectItem value="save">Ask to save</SelectItem>
                        <SelectItem value="tag">Ask to tag friends</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={handleGenerateCaption}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? 'Generating Caption...' : 'Generate Caption'}
                </Button>

                {generatedCaption && (
                  <div className="space-y-2">
                    <Label>Generated Caption</Label>
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <p className="text-sm whitespace-pre-line">{generatedCaption}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => navigator.clipboard.writeText(generatedCaption)}>
                        Copy Caption
                      </Button>
                      <Button size="sm" variant="outline">
                        Schedule Post
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleGenerateCaption}>
                        Generate Another
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hashtag Optimizer */}
        <TabsContent value="hashtag-optimizer">
          <Card>
            <CardHeader>
              <CardTitle>Hashtag Optimizer</CardTitle>
              <CardDescription>
                Suggest and rotate high-performing hashtags for maximum reach
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="current-hashtags">Current Hashtags</Label>
                  <Textarea
                    id="current-hashtags"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    placeholder="Enter your current hashtags (separated by spaces or commas)..."
                    className="mt-1 h-24"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hashtag-niche">Content Niche</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select niche" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="fitness">Fitness</SelectItem>
                        <SelectItem value="lifestyle">Lifestyle</SelectItem>
                        <SelectItem value="fashion">Fashion</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="tech">Technology</SelectItem>
                        <SelectItem value="art">Art & Design</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="hashtag-size">Hashtag Mix</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select mix" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popular">Popular (1M+ posts)</SelectItem>
                        <SelectItem value="medium">Medium (100K-1M posts)</SelectItem>
                        <SelectItem value="niche">Niche (10K-100K posts)</SelectItem>
                        <SelectItem value="mixed">Mixed (All sizes)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Optimization Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="trending-hashtags" defaultChecked />
                      <Label htmlFor="trending-hashtags">Include trending hashtags</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="location-hashtags" />
                      <Label htmlFor="location-hashtags">Include location-based hashtags</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="branded-hashtags" />
                      <Label htmlFor="branded-hashtags">Include branded hashtags</Label>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleOptimizeHashtags}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? 'Optimizing Hashtags...' : 'Optimize Hashtags'}
                </Button>

                {generatedHashtags && (
                  <div className="space-y-2">
                    <Label>Optimized Hashtags</Label>
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <p className="text-sm">{generatedHashtags}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => navigator.clipboard.writeText(generatedHashtags)}>
                        Copy Hashtags
                      </Button>
                      <Button size="sm" variant="outline">
                        Save Set
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleOptimizeHashtags}>
                        Generate Another Set
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smart Reply Assistant */}
        <TabsContent value="smart-reply">
          <Card>
            <CardHeader>
              <CardTitle>Smart Reply Assistant</CardTitle>
              <CardDescription>
                AI-assisted DM and comment replies in your brand voice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reply-context">Comment/Message Context</Label>
                  <Textarea
                    id="reply-context"
                    value={replyContext}
                    onChange={(e) => setReplyContext(e.target.value)}
                    placeholder="Paste the comment or message you want to reply to..."
                    className="mt-1 h-24"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reply-tone">Reply Tone</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                        <SelectItem value="helpful">Helpful</SelectItem>
                        <SelectItem value="grateful">Grateful</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reply-type">Reply Type</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comment">Comment Reply</SelectItem>
                        <SelectItem value="dm">Direct Message</SelectItem>
                        <SelectItem value="story">Story Reply</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reply Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="include-emoji" defaultChecked />
                      <Label htmlFor="include-emoji">Include emojis</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="ask-question" />
                      <Label htmlFor="ask-question">Ask follow-up question</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="include-cta-reply" />
                      <Label htmlFor="include-cta-reply">Include call-to-action</Label>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleGenerateReply}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? 'Generating Reply...' : 'Generate Smart Reply'}
                </Button>

                {generatedReply && (
                  <div className="space-y-2">
                    <Label>Generated Reply</Label>
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <p className="text-sm">{generatedReply}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => navigator.clipboard.writeText(generatedReply)}>
                        Copy Reply
                      </Button>
                      <Button size="sm" variant="outline">
                        Send Reply
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleGenerateReply}>
                        Generate Another
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Tools Status */}
      <Card>
        <CardHeader>
          <CardTitle>AI Tools Status</CardTitle>
          <CardDescription>
            Current status and usage of AI-powered features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Bio Updates</span>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Caption Gen</span>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Hashtag Opt</span>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Smart Replies</span>
              <Badge variant="default">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
