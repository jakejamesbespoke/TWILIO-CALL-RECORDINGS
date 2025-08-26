const twilio = require('twilio');

const validateTwilioWebhook = (req, res, next) => {
  const twilioSignature = req.headers['x-twilio-signature'];
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!authToken) {
    console.error('TWILIO_AUTH_TOKEN not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!twilioSignature) {
    console.warn('Missing Twilio signature header');
    return res.status(401).json({ error: 'Unauthorized - missing signature' });
  }

  const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  const expectedSignature = twilio.webhooks.getExpectedTwilioSignature(
    authToken,
    url,
    req.body
  );

  const isValid = twilio.validateRequest(
    authToken,
    twilioSignature,
    url,
    req.body
  );

  if (!isValid) {
    console.warn('Invalid Twilio webhook signature');
    return res.status(401).json({ error: 'Unauthorized - invalid signature' });
  }

  next();
};

module.exports = { validateTwilioWebhook };