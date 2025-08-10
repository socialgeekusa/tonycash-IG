# GitHub Secrets Setup Guide

## Setting up GitHub Actions Secrets

To properly deploy your TonyCash Tool with GitHub Actions, you need to set up repository secrets for your API keys.

### Step 1: Navigate to Repository Secrets

1. Go to your GitHub repository: `https://github.com/socialgeekusa/tonycash-tool-ig`
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**

### Step 2: Add Repository Secrets

Click **"New repository secret"** and add the following secrets:

#### Required Secrets:

**OPENAI_API_KEY**
- Name: `OPENAI_API_KEY`
- Value: `your_actual_openai_api_key_here`

**CLAUDE_API_KEY** (Optional)
- Name: `CLAUDE_API_KEY`
- Value: `your_claude_api_key_here` (if you have one)

### Step 3: Verify Secrets

After adding the secrets, you should see them listed in the "Repository secrets" section. The values will be hidden for security.

### Step 4: Update Local Environment

For local development, update your `.env.local` file:

```env
# Replace with your actual API keys
OPENAI_API_KEY=your_actual_openai_api_key_here
NEXT_PUBLIC_OPENAI_API_KEY=your_actual_openai_api_key_here
CLAUDE_API_KEY=your_claude_api_key_here
```

### Step 5: GitHub Actions Workflow

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically use these secrets during deployment:

```yaml
env:
  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  CLAUDE_API_KEY: ${{ secrets.CLAUDE_API_KEY }}
```

### Step 6: Test Deployment

Once secrets are set up:

1. Push your code to the main branch
2. GitHub Actions will automatically run
3. Check the "Actions" tab to see the deployment progress
4. Your API keys will be securely injected during the build process

## Security Best Practices

✅ **DO:**
- Use GitHub repository secrets for sensitive data
- Keep API keys in environment variables
- Use different keys for development and production
- Regularly rotate your API keys

❌ **DON'T:**
- Commit API keys directly to code
- Share API keys in plain text
- Use production keys in development
- Store secrets in configuration files

## Troubleshooting

**If deployment fails:**
1. Check that all required secrets are added
2. Verify secret names match exactly (case-sensitive)
3. Ensure API keys are valid and active
4. Check GitHub Actions logs for specific errors

**If API calls fail:**
1. Verify the API key has sufficient credits/quota
2. Check if the API key has the required permissions
3. Test the API key locally first
4. Monitor API usage and limits

Your TonyCash Tool is now configured to use GitHub secrets securely! 🚀
