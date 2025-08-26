# Deployment Guide

## Railway Deployment

### 1. Deploy to Railway

1. **Connect to Railway:**
   - Go to [Railway.app](https://railway.app)
   - Sign up/Login with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select `jakejamesbespoke/TWILIO-CALL-RECORDINGS`

2. **Configure Environment Variables:**
   
   In Railway dashboard, go to Variables tab and add:

   ```env
   # Required - Get from Twilio Console
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here

   # Generated credentials (from scripts/generatePassword.js)
   JWT_SECRET=2781726dca4f54192c11696b975e006b7c0104985661441c62b4fd72e6c12492c1912fc7d730461272ff069d1bad87bf5c42087d9525da55eac80f9ec0454e93
   ADMIN_PASSWORD_HASH=$2b$10$vlrh5hUjTqGXkwyqFmPx0.edB/vZB5Q.udadzayF3knrQa98M8nU6
   ADMIN_USERNAME=admin

   # Production settings
   NODE_ENV=production
   PORT=4000
   ```

   **⚠️ Important:** Replace the Twilio credentials with your actual values from [Twilio Console](https://console.twilio.com).

### 2. Configure Domain & HTTPS

1. **Get Railway Domain:**
   - Railway will provide a domain like `https://your-app-name.up.railway.app`
   - Note this domain for Twilio webhook configuration

2. **Custom Domain (Optional):**
   - In Railway dashboard → Settings → Domains
   - Add your custom domain
   - Configure DNS records as instructed

### 3. Configure Twilio Webhook

1. **Go to Twilio Console:**
   - Navigate to Phone Numbers → Manage → Active numbers
   - Click on your phone number
   - In "Voice Configuration" section:
     - Set webhook URL: `https://your-railway-domain.up.railway.app/webhooks/recording`
     - Method: POST
     - Enable "Primary Handler Fails" if desired

### 4. Update CORS Settings (If using custom domain)

If using a custom domain, update the Railway environment variable:
```env
ALLOWED_ORIGINS=https://yourdomain.com,https://your-railway-domain.up.railway.app
```

### 5. Test Deployment

1. **Health Check:**
   - Visit: `https://your-railway-domain.up.railway.app/health`
   - Should return: `{"status":"healthy","timestamp":"..."}`

2. **Login Test:**
   - Visit: `https://your-railway-domain.up.railway.app/login.html`
   - Username: `admin`
   - Password: `admin123`

3. **Recording Test:**
   - Make a test call to your Twilio number
   - Check the dashboard for real-time notifications

## GitHub Repository

Repository: https://github.com/jakejamesbespoke/TWILIO-CALL-RECORDINGS

## Security Notes

### Default Credentials
- **Username:** `admin`
- **Password:** `admin123`
- **⚠️ Change these immediately after first login**

### Production Security Checklist
- [ ] Changed default admin password
- [ ] Configured HTTPS-only webhook URLs
- [ ] Set restrictive CORS origins
- [ ] Enabled Railway's built-in DDoS protection
- [ ] Regular dependency updates
- [ ] Monitor access logs

## Troubleshooting

### Common Issues

1. **Webhook not receiving calls:**
   - Verify Twilio webhook URL is correct
   - Check Railway logs for errors
   - Ensure webhook URL uses HTTPS

2. **Login not working:**
   - Verify JWT_SECRET and ADMIN_PASSWORD_HASH are set
   - Check Railway environment variables
   - Clear browser cache/localStorage

3. **WebSocket connection fails:**
   - Verify ALLOWED_ORIGINS includes your domain
   - Check for firewall/proxy issues
   - Ensure WSS (secure WebSocket) is used

### Railway Logs
- View logs in Railway dashboard → Deployments → View Logs
- Look for startup errors or webhook failures

### Environment Variables
- Verify all required variables are set in Railway dashboard
- Use Railway CLI for bulk environment variable management

## Monitoring

### Health Checks
Railway automatically monitors the `/health` endpoint for application health.

### Application Logs
Monitor Railway logs for:
- Authentication failures
- Webhook signature validation errors
- Database connection issues
- Rate limiting triggers

## Scaling

Railway automatically handles scaling based on traffic. For high-volume usage:
- Consider upgrading Railway plan
- Monitor resource usage in dashboard
- Implement additional rate limiting if needed