# Motia Backend Deployment Guide

## GitHub Actions CI/CD Setup

Since Motia CLI cannot run on Windows due to Redis installation issues, we've set up automated deployment via GitHub Actions.

### Setup Instructions

1. **Add GitHub Secrets**
   
   Go to your repository settings → Secrets and variables → Actions, and add these secrets:
   
   - `MOTIA_API_KEY`: `motia-MDc5NTM4NWItYjUxYy00MDAwLWEzNGIt`
   - `DATABASE_URL`: `postgresql://postgres:FIomnuqssqiTlJvGIePMPZZBjZzNbZKS@trolley.proxy.rlwy.net:27731/railway`
   - `GOOGLE_API_KEY`: `AIzaSyB_5n6O8e8PpU7vXyZ1234567890abcdef`

2. **Push to GitHub**
   
   ```bash
   git add .
   git commit -m "Add Motia backend and CI/CD deployment"
   git push origin main
   ```

3. **Monitor Deployment**
   
   - Go to the "Actions" tab in your GitHub repository
   - Watch the "Deploy Motia Backend" workflow run
   - Once complete, check your Motia dashboard for the deployed backend

### Manual Deployment Trigger

You can also manually trigger deployment:
1. Go to Actions tab
2. Select "Deploy Motia Backend" workflow
3. Click "Run workflow"
4. Select branch and click "Run workflow"

### What Gets Deployed

The workflow deploys everything in the `motia-backend/` directory:
- **3 Steps** (Motia handlers):
  - `ai-scoring.step.ts` - API endpoint for AI scoring
  - `batch-scoring.step.ts` - Cron job (every 5 minutes)
  - `save-scores.step.ts` - Event handler for saving scores
- **Database schema** for speaking attempts
- **Environment variables** from GitHub secrets

### After Deployment

Once deployed, you'll get a URL from Motia Cloud. Update your main app to use this URL:

```typescript
// In your main app
const MOTIA_BACKEND_URL = 'https://your-motia-backend-url.motia.cloud';

// Call the AI scoring endpoint
const response = await fetch(`${MOTIA_BACKEND_URL}/api/score/speaking`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    audioUrl: attempt.audioUrl,
    transcript: attempt.transcript,
    questionType: attempt.questionType,
    referenceText: question.referenceText,
    attemptId: attempt.id
  })
});
```

### Troubleshooting

If deployment fails:
1. Check the Actions logs for error messages
2. Verify all secrets are set correctly
3. Ensure the Motia API key is valid
4. Check that the project name matches your Motia Cloud project
