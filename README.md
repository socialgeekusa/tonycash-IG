# TonyCash Tool - Instagram Growth Automation

A comprehensive Instagram automation tool built with Next.js, TypeScript, and device automation capabilities. TonyCash Tool provides smart engagement, AI-powered content generation, precision targeting, and advanced analytics for Instagram growth.

## 🚀 Features

### 🔄 Smart Engagement Engine
- **Auto Like** - Like posts, stories, and reels automatically to increase visibility
- **Auto Comment** - Leave custom, thoughtful comments on target audience's posts
- **Auto Follow/Unfollow** - Follow niche-relevant users and unfollow non-engagers
- **Follow Back** - Automatically follow anyone who follows you
- **Repost & DM Blaster** - Repost content and send mass DMs to curated lists
- **Story Viewer + Liker** - View and like targeted users' stories
- **Comment Replier** - Reply to comments instantly with custom templates
- **Block Low-Quality Followers** - Remove followers who don't meet quality criteria

### 🧠 Advanced AI Tools
- **AI Bio Updater** - Refresh profile bio with trendy, niche-focused messaging
- **Post Scheduler** - Plan and schedule posts, reels, and stories in advance
- **Caption Generator** - AI-powered captions based on media content and niche
- **Hashtag Optimizer** - Suggest and rotate high-performing hashtags
- **Smart Reply Assistant** - AI-assisted DM and comment replies in your brand voice

### 🎯 Precision Targeting Features
- **Follow Followers/Followings** - Target followers of competitors or influencers
- **Like Comments by Hashtag** - Engage with users commenting under niche hashtags
- **Tag-Based Photo Search** - Find and engage with viral content in your niche
- **Target by Location** - Engage with users posting from specific locations
- **Target by Story Viewers** - Interact with users who viewed competitor stories

### 🧹 Account Management Tools
- **Bulk Delete Posts** - Remove old or low-performing content
- **Archive/Unarchive Posts** - Temporarily hide or restore content
- **Profile Cleaner** - Remove spammy tags, mentions, or posts
- **Follower Audit** - Analyze followers for engagement and authenticity

### 📤 Direct Messaging Suite
- **DM Target Lists** - Import CSV/YAML lists of usernames for outbound DMs
- **DM Campaigns** - Run multi-message campaigns with personalization
- **DM Templates & Spintax** - Pre-built templates with variable support
- **Auto Follow-Up DMs** - Send follow-up messages after configurable delays
- **Media Attachments in DMs** - Send photos/videos directly via device automation

### 📈 Analytics & Insights
- **Engagement Reports** - Track likes, comments, follows, unfollows
- **Growth Tracking** - Visualize follower growth over time
- **Content Performance** - Identify top-performing posts/reels/stories
- **Hashtag Performance** - Measure reach and engagement per hashtag

### 🛠 Operational Features
- **Multi-Device Control** - Manage multiple iPhones and Androids from macOS/Windows
- **Queue & Scheduler** - Centralized job queue with posting windows and pacing
- **Custom Selectors & Vision Layer** - Resilient UI interaction using device automation
- **Logs & Screenshots** - Record every action for review and troubleshooting
- **CSV/YAML Import & Export** - Bulk import/export targets, hashtags, and settings

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **State Management**: Zustand
- **Device Automation**: Custom device automation layer
- **AI Integration**: OpenAI API, Claude API support
- **Data Management**: CSV/JSON/YAML import/export
- **Styling**: Tailwind CSS with custom design system

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Connected iOS/Android device (for device automation)
- OpenAI API key (for AI features)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tonycash-tool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   CLAUDE_API_KEY=your_claude_api_key_here (optional)
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8000`

## 🔧 Configuration

### API Keys Setup
1. Go to **Settings** → **API Keys**
2. Enter your OpenAI API key
3. Optionally add Claude API key for alternative AI provider
4. Test the connection to ensure keys are working

### Device Setup
1. Connect your iOS or Android device via USB
2. Enable USB debugging (Android) or trust the computer (iOS)
3. Go to **Settings** → **Device Settings**
4. Configure automation preferences

### Safety Limits
Configure safe automation limits to protect your Instagram account:
- **Likes per hour**: 30-60 (recommended)
- **Comments per hour**: 5-15 (recommended)
- **Follows per hour**: 15-25 (recommended)
- **DMs per hour**: 10-20 (recommended)

## 🚀 Usage

### Quick Start Guide

1. **Connect Your Device**
   - Navigate to Dashboard
   - Connect your iOS/Android device
   - Verify connection status

2. **Set Up Targeting**
   - Go to **Targeting** section
   - Add competitor accounts or hashtags
   - Configure quality filters

3. **Create DM Campaign**
   - Navigate to **DM Campaigns**
   - Import target list (CSV/JSON)
   - Create message template with variables
   - Schedule campaign

4. **Enable Smart Engagement**
   - Go to **Smart Engagement**
   - Configure auto-like, comment, follow settings
   - Set appropriate delays and limits
   - Start automation

5. **Use AI Tools**
   - Navigate to **AI Tools**
   - Generate captions, optimize hashtags
   - Update bio with AI assistance
   - Create smart replies

### API Usage

The tool provides a REST API for programmatic access:

```bash
# Start a like campaign
curl -X POST http://localhost:8000/api/automation \
  -H "Content-Type: application/json" \
  -d '{
    "feature": "like",
    "action": "start",
    "parameters": {
      "targets": ["@user1", "@user2"],
      "delay": 30000
    }
  }'

# Generate AI caption
curl -X POST http://localhost:8000/api/automation \
  -H "Content-Type: application/json" \
  -d '{
    "feature": "ai_caption",
    "action": "start",
    "parameters": {
      "prompt": "A motivational business post about success",
      "style": "engaging",
      "niche": "entrepreneur"
    }
  }'

# Check automation status
curl -X GET http://localhost:8000/api/automation
```

## 📊 Analytics & Monitoring

### Dashboard Metrics
- **Total Followers**: Current follower count with growth tracking
- **Engagement Rate**: Average engagement across all posts
- **DMs Sent**: Daily and total DM statistics
- **Auto Actions**: Likes, comments, follows performed

### Activity Logs
- Real-time activity feed
- Success/failure tracking
- Device action logs
- API call monitoring

### Performance Reports
- Follower growth charts
- Engagement rate trends
- Content performance analysis
- Hashtag effectiveness metrics

## 🔒 Safety & Best Practices

### Account Safety
- **Rate Limiting**: Built-in limits to prevent Instagram restrictions
- **Human-like Behavior**: Random delays and natural interaction patterns
- **Quality Filters**: Target only high-quality, relevant accounts
- **Monitoring**: Real-time monitoring for unusual activity

### Recommended Limits
- **New Accounts** (< 3 months): 50% of standard limits
- **Established Accounts** (> 6 months): Standard limits
- **High-Activity Accounts**: Can handle higher limits with caution

### Best Practices
1. **Start Slow**: Begin with lower limits and gradually increase
2. **Quality over Quantity**: Focus on relevant, engaged audiences
3. **Diversify Actions**: Don't rely on just one type of automation
4. **Monitor Regularly**: Check logs and analytics daily
5. **Stay Updated**: Keep the tool updated for latest safety features

## 🛠️ Development

### Project Structure
```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── engagement/        # Smart engagement features
│   ├── ai-tools/          # AI-powered tools
│   ├── dm-campaigns/      # DM campaign management
│   ├── targeting/         # Precision targeting
│   ├── analytics/         # Analytics and reports
│   └── settings/          # Configuration
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   ├── dashboard/        # Dashboard-specific components
│   └── automation/       # Automation components
├── lib/                  # Utility libraries
│   ├── ai.ts            # AI service integration
│   ├── device.ts        # Device automation
│   ├── scheduler.ts     # Task scheduling
│   ├── logger.ts        # Logging system
│   └── importExport.ts  # Data import/export
└── hooks/               # Custom React hooks
```

### Adding New Features

1. **Create Component**
   ```typescript
   // src/components/features/NewFeature.tsx
   export function NewFeature() {
     // Component implementation
   }
   ```

2. **Add API Endpoint**
   ```typescript
   // src/app/api/new-feature/route.ts
   export async function POST(request: NextRequest) {
     // API implementation
   }
   ```

3. **Update Navigation**
   ```typescript
   // src/components/layout/Sidebar.tsx
   // Add new navigation item
   ```

### Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is for educational and legitimate business purposes only. Users are responsible for complying with Instagram's Terms of Service and applicable laws. The developers are not responsible for any account restrictions or violations that may result from misuse of this tool.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Community**: Join our community discussions

## 🔄 Updates

### Version 1.0.0
- Initial release with core automation features
- AI-powered content generation
- Multi-device support
- Comprehensive analytics
- Safety and rate limiting features

---

**Built with ❤️ for Instagram growth automation**
