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
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'

export default function PrecisionTargeting() {
  const [targetingEnabled, setTargetingEnabled] = useState(false)
  const [competitorAccounts, setCompetitorAccounts] = useState('')
  const [targetHashtags, setTargetHashtags] = useState('')
  const [targetLocations, setTargetLocations] = useState('')
  const [minFollowers, setMinFollowers] = useState([1000])
  const [maxFollowers, setMaxFollowers] = useState([100000])
  const [engagementRate, setEngagementRate] = useState([2])

  const targetingStrategies = [
    {
      name: 'Follow Followers',
      description: 'Target followers of competitor accounts',
      active: true,
      count: 1234
    },
    {
      name: 'Follow Followings',
      description: 'Target accounts that competitors follow',
      active: false,
      count: 567
    },
    {
      name: 'Hashtag Targeting',
      description: 'Target users posting with specific hashtags',
      active: true,
      count: 890
    },
    {
      name: 'Location Targeting',
      description: 'Target users posting from specific locations',
      active: false,
      count: 345
    },
    {
      name: 'Story Viewers',
      description: 'Target users who viewed competitor stories',
      active: true,
      count: 678
    }
  ]

  const handleStartTargeting = (strategy: string) => {
    toast.success(`${strategy} targeting started`)
  }

  const handleBulkDelete = () => {
    toast.success('Bulk delete operation started')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Precision Targeting</h1>
        <p className="text-muted-foreground">
          Advanced audience targeting and account management tools
        </p>
      </div>

      <Tabs defaultValue="follow-targeting" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="follow-targeting">Follow Targeting</TabsTrigger>
          <TabsTrigger value="hashtag-targeting">Hashtag Targeting</TabsTrigger>
          <TabsTrigger value="location-targeting">Location Targeting</TabsTrigger>
          <TabsTrigger value="story-targeting">Story Targeting</TabsTrigger>
          <TabsTrigger value="account-cleanup">Account Cleanup</TabsTrigger>
        </TabsList>

        {/* Follow Targeting */}
        <TabsContent value="follow-targeting">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Follow Followers / Follow Followings</CardTitle>
                <CardDescription>
                  Target followers of competitors or niche influencers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="competitor-accounts">Competitor Accounts</Label>
                  <Textarea
                    id="competitor-accounts"
                    value={competitorAccounts}
                    onChange={(e) => setCompetitorAccounts(e.target.value)}
                    placeholder="@competitor1, @competitor2, @influencer1..."
                    className="mt-1 h-24"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter usernames separated by commas
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Targeting Strategy</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="target-followers" defaultChecked />
                        <Label htmlFor="target-followers">Target their followers</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="target-following" />
                        <Label htmlFor="target-following">Target accounts they follow</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="target-engagers" />
                        <Label htmlFor="target-engagers">Target their recent engagers</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Min followers: {minFollowers[0].toLocaleString()}</Label>
                      <Slider
                        value={minFollowers}
                        onValueChange={setMinFollowers}
                        max={10000}
                        min={0}
                        step={100}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Max followers: {maxFollowers[0].toLocaleString()}</Label>
                      <Slider
                        value={maxFollowers}
                        onValueChange={setMaxFollowers}
                        max={1000000}
                        min={1000}
                        step={1000}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Min engagement rate: {engagementRate[0]}%</Label>
                      <Slider
                        value={engagementRate}
                        onValueChange={setEngagementRate}
                        max={10}
                        min={0.1}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Quality Filters</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="skip-private" defaultChecked />
                        <Label htmlFor="skip-private">Skip private accounts</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="skip-verified" />
                        <Label htmlFor="skip-verified">Skip verified accounts</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="skip-business" />
                        <Label htmlFor="skip-business">Skip business accounts</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="active-only" defaultChecked />
                        <Label htmlFor="active-only">Only active accounts (posted in 30 days)</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleStartTargeting('Follow')} className="flex-1">
                    Start Targeting
                  </Button>
                  <Button variant="outline">Preview Targets</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Targeting Results</CardTitle>
                <CardDescription>
                  Live results from your targeting campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {targetingStrategies.map((strategy, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${strategy.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <div>
                          <div className="font-medium text-sm">{strategy.name}</div>
                          <div className="text-xs text-muted-foreground">{strategy.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{strategy.count}</div>
                        <Badge variant={strategy.active ? "default" : "secondary"} className="text-xs">
                          {strategy.active ? "Active" : "Paused"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Hashtag Targeting */}
        <TabsContent value="hashtag-targeting">
          <Card>
            <CardHeader>
              <CardTitle>Hashtag-Based Targeting</CardTitle>
              <CardDescription>
                Target users posting with specific hashtags and engage with hashtag comments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="target-hashtags">Target Hashtags</Label>
                    <Textarea
                      id="target-hashtags"
                      value={targetHashtags}
                      onChange={(e) => setTargetHashtags(e.target.value)}
                      placeholder="#entrepreneur, #business, #success, #motivation..."
                      className="mt-1 h-24"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter hashtags separated by commas (without #)
                    </p>
                  </div>

                  <div>
                    <Label>Hashtag Strategy</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="like-hashtag-posts" defaultChecked />
                        <Label htmlFor="like-hashtag-posts">Like posts with these hashtags</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="follow-hashtag-users" />
                        <Label htmlFor="follow-hashtag-users">Follow users posting these hashtags</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="comment-hashtag-posts" />
                        <Label htmlFor="comment-hashtag-posts">Comment on hashtag posts</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="like-hashtag-comments" />
                        <Label htmlFor="like-hashtag-comments">Like comments on hashtag posts</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="hashtag-size">Hashtag Size Preference</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select hashtag size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (1K-10K posts)</SelectItem>
                        <SelectItem value="medium">Medium (10K-100K posts)</SelectItem>
                        <SelectItem value="large">Large (100K-1M posts)</SelectItem>
                        <SelectItem value="mega">Mega (1M+ posts)</SelectItem>
                        <SelectItem value="mixed">Mixed sizes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Tag-Based Photo Search</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Find and engage with viral content in your niche
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="search-recent" defaultChecked />
                        <Label htmlFor="search-recent">Search recent posts</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="search-top" />
                        <Label htmlFor="search-top">Search top posts</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="search-stories" />
                        <Label htmlFor="search-stories">Search stories</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Content Filters</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="min-likes" />
                        <Label htmlFor="min-likes">Minimum 100 likes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="recent-posts" defaultChecked />
                        <Label htmlFor="recent-posts">Posted in last 24 hours</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="exclude-reels" />
                        <Label htmlFor="exclude-reels">Exclude reels</Label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="posts-per-hashtag">Posts per hashtag</Label>
                      <Input
                        id="posts-per-hashtag"
                        type="number"
                        placeholder="50"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hashtag-delay">Delay between hashtags (min)</Label>
                      <Input
                        id="hashtag-delay"
                        type="number"
                        placeholder="5"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleStartTargeting('Hashtag')} className="flex-1">
                  Start Hashtag Targeting
                </Button>
                <Button variant="outline">Analyze Hashtags</Button>
                <Button variant="outline">Preview Content</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Targeting */}
        <TabsContent value="location-targeting">
          <Card>
            <CardHeader>
              <CardTitle>Location-Based Targeting</CardTitle>
              <CardDescription>
                Target users posting from specific locations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="target-locations">Target Locations</Label>
                    <Textarea
                      id="target-locations"
                      value={targetLocations}
                      onChange={(e) => setTargetLocations(e.target.value)}
                      placeholder="New York, Los Angeles, Miami, London, Dubai..."
                      className="mt-1 h-24"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter cities, countries, or specific venues
                    </p>
                  </div>

                  <div>
                    <Label>Location Strategy</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="like-location-posts" defaultChecked />
                        <Label htmlFor="like-location-posts">Like posts from these locations</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="follow-location-users" />
                        <Label htmlFor="follow-location-users">Follow users posting from locations</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="comment-location-posts" />
                        <Label htmlFor="comment-location-posts">Comment on location posts</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location-radius">Search Radius</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select radius" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1km">1 km</SelectItem>
                        <SelectItem value="5km">5 km</SelectItem>
                        <SelectItem value="10km">10 km</SelectItem>
                        <SelectItem value="25km">25 km</SelectItem>
                        <SelectItem value="50km">50 km</SelectItem>
                        <SelectItem value="city">Entire city</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Location Types</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="restaurants" />
                        <Label htmlFor="restaurants">Restaurants & Cafes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="gyms" />
                        <Label htmlFor="gyms">Gyms & Fitness Centers</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="hotels" />
                        <Label htmlFor="hotels">Hotels & Resorts</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="events" />
                        <Label htmlFor="events">Events & Venues</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="landmarks" />
                        <Label htmlFor="landmarks">Landmarks & Attractions</Label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="posts-per-location">Posts per location</Label>
                      <Input
                        id="posts-per-location"
                        type="number"
                        placeholder="30"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location-delay">Delay between locations (min)</Label>
                      <Input
                        id="location-delay"
                        type="number"
                        placeholder="10"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleStartTargeting('Location')} className="flex-1">
                  Start Location Targeting
                </Button>
                <Button variant="outline">Find Popular Locations</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Story Targeting */}
        <TabsContent value="story-targeting">
          <Card>
            <CardHeader>
              <CardTitle>Story Viewer Targeting</CardTitle>
              <CardDescription>
                Target users who viewed competitor stories and engage with story content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="story-competitors">Competitor Accounts</Label>
                    <Textarea
                      id="story-competitors"
                      placeholder="@competitor1, @competitor2, @influencer1..."
                      className="mt-1 h-24"
                    />
                  </div>

                  <div>
                    <Label>Story Targeting Strategy</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="target-story-viewers" defaultChecked />
                        <Label htmlFor="target-story-viewers">Target their story viewers</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="view-competitor-stories" />
                        <Label htmlFor="view-competitor-stories">View their stories</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="like-competitor-stories" />
                        <Label htmlFor="like-competitor-stories">Like their stories</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="react-competitor-stories" />
                        <Label htmlFor="react-competitor-stories">React to their stories</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="story-age">Story Age Limit</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select age limit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">Last 1 hour</SelectItem>
                        <SelectItem value="6h">Last 6 hours</SelectItem>
                        <SelectItem value="12h">Last 12 hours</SelectItem>
                        <SelectItem value="24h">Last 24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Story Engagement Options</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="story-emoji-reactions" />
                        <Label htmlFor="story-emoji-reactions">Use emoji reactions</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="story-quick-reactions" defaultChecked />
                        <Label htmlFor="story-quick-reactions">Use quick reactions (fire, heart, etc.)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="story-dm-replies" />
                        <Label htmlFor="story-dm-replies">Send DM replies to stories</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="story-dm-template">Story DM Template</Label>
                    <Textarea
                      id="story-dm-template"
                      placeholder="Love your story! 🔥"
                      className="mt-1 h-20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stories-per-hour">Stories per hour</Label>
                      <Input
                        id="stories-per-hour"
                        type="number"
                        placeholder="20"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="story-delay">Delay between stories (sec)</Label>
                      <Input
                        id="story-delay"
                        type="number"
                        placeholder="30"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleStartTargeting('Story')} className="flex-1">
                  Start Story Targeting
                </Button>
                <Button variant="outline">Preview Stories</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Cleanup */}
        <TabsContent value="account-cleanup">
          <Card>
            <CardHeader>
              <CardTitle>Account Cleanup & Management</CardTitle>
              <CardDescription>
                Bulk delete posts, manage followers, and clean up your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Bulk Delete Posts</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Remove old or low-performing content from your profile
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="delete-old-posts" />
                        <Label htmlFor="delete-old-posts">Delete posts older than 6 months</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="delete-low-engagement" />
                        <Label htmlFor="delete-low-engagement">Delete posts with less than 50 likes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="delete-specific-hashtags" />
                        <Label htmlFor="delete-specific-hashtags">Delete posts with specific hashtags</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="delete-hashtags">Hashtags to Delete</Label>
                    <Input
                      id="delete-hashtags"
                      placeholder="#oldhashtag #outdated #remove"
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min-likes-keep">Min likes to keep</Label>
                      <Input
                        id="min-likes-keep"
                        type="number"
                        placeholder="50"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="posts-to-keep">Posts to keep (latest)</Label>
                      <Input
                        id="posts-to-keep"
                        type="number"
                        placeholder="100"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <Button onClick={handleBulkDelete} variant="destructive" className="w-full">
                    Start Bulk Delete
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Block Low-Quality Followers</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Automatically remove followers who don't meet quality criteria
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="block-no-profile-pic" />
                        <Label htmlFor="block-no-profile-pic">Block accounts with no profile picture</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="block-no-posts" />
                        <Label htmlFor="block-no-posts">Block accounts with no posts</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="block-suspicious" />
                        <Label htmlFor="block-suspicious">Block suspicious/bot accounts</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="block-inactive" />
                        <Label htmlFor="block-inactive">Block inactive accounts (no posts in 6 months)</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Archive/Unarchive Posts</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Temporarily hide or restore content
                    </p>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full">
                        Archive Posts by Date Range
                      </Button>
                      <Button variant="outline" className="w-full">
                        Archive Posts by Hashtag
                      </Button>
                      <Button variant="outline" className="w-full">
                        Unarchive All Posts
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Follower Audit</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Analyze followers for engagement and authenticity
                    </p>
                    <Button variant="outline" className="w-full">
                      Start Follower Audit
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Targeting Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Targeting Status Overview</CardTitle>
          <CardDescription>
            Current status of all targeting campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Follow Targeting</span>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Hashtag Targeting</span>
              <Badge variant="secondary">Paused</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Location Targeting</span>
              <Badge variant="secondary">Paused</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Story Targeting</span>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Account Cleanup</span>
              <Badge variant="secondary">Ready</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
