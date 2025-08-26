const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();
const twilioService = require('../services/twilioService');
const { authenticateToken } = require('../middleware/auth');
const { validateTwilioWebhook } = require('../middleware/webhookValidator');

router.post('/recording', 
  express.raw({ type: 'application/x-www-form-urlencoded' }),
  validateTwilioWebhook,
  async (req, res) => {
  try {
    const {
      RecordingSid,
      RecordingUrl,
      RecordingStatus,
      CallSid,
      AccountSid,
      From,
      To,
      CallStatus,
      RecordingDuration
    } = req.body;

    console.log('Recording webhook received:', {
      RecordingSid,
      RecordingStatus,
      CallSid,
      From: From?.replace(/^\+/, ''),
      To: To?.replace(/^\+/, ''),
      Duration: RecordingDuration
    });

    if (RecordingStatus === 'completed') {
      const recordingData = {
        recordingSid: RecordingSid,
        recordingUrl: RecordingUrl,
        callSid: CallSid,
        accountSid: AccountSid,
        from: From,
        to: To,
        duration: RecordingDuration,
        timestamp: new Date().toISOString()
      };

      const io = req.app.get('socketio');
      io.emit('newRecording', recordingData);

      console.log('Recording notification sent to clients');
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing recording webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/recordings', authenticateToken, async (req, res) => {
  try {
    const recordings = await twilioService.getRecordings();
    res.json(recordings);
  } catch (error) {
    console.error('Error fetching recordings:', error);
    res.status(500).json({ error: 'Failed to fetch recordings' });
  }
});

router.get('/recording/:sid', 
  authenticateToken,
  param('sid').isAlphanumeric().isLength({ min: 34, max: 34 }),
  async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid recording SID format' });
    }
    
    const { sid } = req.params;
    const recordingUrl = await twilioService.getRecordingUrl(sid);
    
    if (!recordingUrl) {
      return res.status(404).json({ error: 'Recording not found' });
    }
    
    res.json({ url: recordingUrl });
  } catch (error) {
    console.error('Error fetching recording URL:', error);
    res.status(500).json({ error: 'Failed to fetch recording URL' });
  }
});

module.exports = router;