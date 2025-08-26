# Twilio Call Recordings Dashboard

A real-time web dashboard for monitoring and playing Twilio call recordings with WebSocket notifications.

## Features

- 🎵 **Real-time Notifications**: Get instantly notified when new recordings are available
- 📞 **Recording Playback**: Stream and play call recordings directly in the browser  
- 🔄 **Auto-refresh**: Automatically updates the recordings list when new ones arrive
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **WebSocket Integration**: Real-time updates without page refreshing

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Twilio Credentials
Edit the `.env` file and add your Twilio credentials:

```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
PORT=4000
```

Get these credentials from your [Twilio Console](https://console.twilio.com).

### 3. Configure Twilio Webhook
In your Twilio Console, configure the recording webhook URL:

**Webhook URL:** `http://your-domain.com/webhooks/recording`

For local development, use a tool like [ngrok](https://ngrok.com/):
```bash
# In a separate terminal
ngrok http 4000

# Use the ngrok URL in your Twilio webhook configuration
# Example: https://abc123.ngrok.io/webhooks/recording
```

### 4. Start the Server
```bash
npm start
```

Visit `http://localhost:4000` to view the dashboard.

## How It Works

1. **Recording Creation**: When a call ends and Twilio creates a recording, it sends a webhook to your server
2. **Real-time Notification**: The server broadcasts the new recording information to all connected clients via WebSockets
3. **Recording Display**: The dashboard automatically updates and shows the new recording
4. **Audio Playback**: Users can click play to stream the recording directly from Twilio

## API Endpoints

- `GET /` - Main dashboard interface
- `POST /webhooks/recording` - Twilio webhook endpoint for recording notifications
- `GET /webhooks/recordings` - Fetch all recordings from Twilio
- `GET /webhooks/recording/:sid` - Get specific recording URL

## Project Structure

```
src/
├── server.js              # Express server and Socket.IO setup
├── routes/
│   └── webhooks.js         # Webhook routes for Twilio callbacks
└── services/
    └── twilioService.js    # Twilio API integration

public/
├── index.html             # Main dashboard interface
├── css/
│   └── style.css          # Dashboard styling
└── js/
    └── app.js             # Client-side JavaScript for real-time updates
```

## Development

The server runs on port 4000 by default. You can change this by setting the `PORT` environment variable.

## Security

This application implements comprehensive security measures suitable for production deployment. See [SECURITY.md](./SECURITY.md) for detailed security information.

### Quick Security Setup

1. **Generate secure credentials:**
```bash
node scripts/generatePassword.js your_admin_password
```

2. **Update .env with generated values**

3. **Set production environment variables:**
```env
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com
```

For production deployment, make sure to:
1. Set your production Twilio webhook URL (HTTPS required)
2. Configure environment variables securely
3. Use proper HTTPS certificates
4. Review the security documentation