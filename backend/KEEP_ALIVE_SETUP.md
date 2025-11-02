# Keep-Alive Setup for Render Free Tier

## Problem
Render's free tier spins down backend services after 15 minutes of inactivity, causing slow "cold starts" (30-60 seconds) when the service needs to wake up.

## Solution
We've implemented a **free cron job** that pings the backend every 14 minutes to keep it alive and prevent it from sleeping.

## How It Works

### 1. Cron Job Service
- **File**: `render.yaml` (lines 30-44)
- **Schedule**: Runs every 14 minutes (`*/14 * * * *`)
- **Action**: Executes the keep-alive script
- **Cost**: FREE (Render provides free cron jobs)

### 2. Keep-Alive Script
- **File**: `scripts/keepAlive.js`
- **Function**: Pings `/api/health` endpoint
- **Timeout**: 30 seconds
- **Logging**: Shows timestamp and response status

### 3. Health Check Endpoint
- **Endpoint**: `GET /api/health`
- **Location**: `src/routes/index.js` (lines 14-21)
- **Response**: Lightweight JSON with status and timestamp

## Setup Instructions

### Option A: Using render.yaml (Recommended)

1. **Push to Git**:
   ```bash
   git add .
   git commit -m "Add keep-alive cron job for Render"
   git push
   ```

2. **Render Auto-Deploy**:
   - Render will automatically detect the new cron job configuration
   - The cron job will be created and start running automatically
   - Check Render Dashboard → Your Service → "Cron Jobs" tab

### Option B: Manual Setup on Render Dashboard

If you prefer manual setup or auto-deploy doesn't work:

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Create New Cron Job**:
   - Click "New" → "Cron Job"
   - Name: `keep-alive`
   - Environment: `Node`
   - Build Command: `npm install`
   - Command: `node scripts/keepAlive.js`
   - Schedule: `*/14 * * * *`

3. **Add Environment Variable**:
   - Key: `BACKEND_URL`
   - Value: Your backend URL (e.g., `https://college-erp-backend.onrender.com`)

## Testing

### Test Locally
```bash
# Set the backend URL
export BACKEND_URL=http://localhost:5000
# or on Windows (PowerShell)
$env:BACKEND_URL="http://localhost:5000"

# Run the keep-alive script
npm run keep-alive
```

### Expected Output
```
🔔 Pinging: http://localhost:5000/api/health
⏰ Timestamp: 2025-11-02T10:30:00.000Z
✅ Keep-alive ping successful
📊 Response: {
  success: true,
  message: 'College ERP API is running',
  timestamp: '2025-11-02T10:30:00.123Z',
  environment: 'development'
}
```

### Monitor on Render
1. Go to Render Dashboard
2. Click on the "keep-alive" cron job
3. View "Logs" to see ping history
4. Check "Jobs" tab for execution history

## How to Verify It's Working

1. **Check Cron Job Logs**:
   - Render Dashboard → Cron Job → Logs
   - Should see successful pings every 14 minutes

2. **Monitor Backend Uptime**:
   - Your backend should stay "active" in Render Dashboard
   - No more cold starts when accessing the API

3. **Test Response Time**:
   - API calls should respond quickly (< 1 second)
   - No 30-60 second delays

## Alternative Solutions

If you need additional reliability, you can also use:

### External Monitoring Services (Free)
- **UptimeRobot**: https://uptimerobot.com (Free, checks every 5 min)
- **Cron-job.org**: https://cron-job.org (Free unlimited jobs)
- **Better Uptime**: https://betteruptime.com (Free tier available)

### Setup with UptimeRobot
1. Sign up at https://uptimerobot.com
2. Add New Monitor:
   - Monitor Type: HTTP(s)
   - Friendly Name: College ERP Backend
   - URL: `https://your-backend.onrender.com/api/health`
   - Monitoring Interval: 5 minutes (free tier)

## Troubleshooting

### Cron Job Not Running
- Check Render Dashboard → Cron Jobs for errors
- Verify `BACKEND_URL` environment variable is set correctly
- Check logs for script errors

### Backend Still Sleeping
- Verify cron job is running every 14 minutes
- Check if schedule syntax is correct: `*/14 * * * *`
- Ensure the health endpoint is responding (test manually)

### Script Errors
- Check Node.js version compatibility (requires Node >= 16)
- Verify `scripts/keepAlive.js` file exists
- Check cron job logs for error details

## Benefits

✅ **FREE**: No additional cost
✅ **Automatic**: Runs without manual intervention
✅ **Reliable**: Keeps backend always warm
✅ **Simple**: Minimal setup required
✅ **Native**: Uses Render's own infrastructure

## Cost Comparison

| Solution | Cost | Effort |
|----------|------|--------|
| **Render Cron Job** | FREE | Low (Setup once) |
| External Services | FREE | Low (Sign up + configure) |
| Render Paid Tier | $7/month | None |

## Notes

- The 14-minute interval is optimal (under the 15-minute timeout)
- The health endpoint is lightweight (minimal server resources)
- Cron jobs on Render free tier have no execution time limits
- You can combine this with external monitoring for extra reliability

## Support

If you encounter issues:
1. Check Render status: https://status.render.com
2. Review Render docs: https://render.com/docs/cronjobs
3. Check application logs in Render Dashboard
