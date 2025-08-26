const twilio = require('twilio');

class TwilioService {
  constructor() {
    this.client = null;
    this.init();
  }

  init() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      console.warn('Twilio credentials not found. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in your .env file');
      return;
    }

    this.client = twilio(accountSid, authToken);
    console.log('Twilio client initialized');
  }

  async getRecordings(limit = 50) {
    if (!this.client) {
      throw new Error('Twilio client not initialized');
    }

    try {
      const recordings = await this.client.recordings.list({ limit });
      
      return recordings.map(recording => ({
        sid: recording.sid,
        accountSid: recording.accountSid,
        callSid: recording.callSid,
        status: recording.status,
        dateCreated: recording.dateCreated,
        dateUpdated: recording.dateUpdated,
        startTime: recording.startTime,
        duration: recording.duration,
        channels: recording.channels,
        source: recording.source,
        errorCode: recording.errorCode,
        price: recording.price,
        priceUnit: recording.priceUnit,
        uri: recording.uri
      }));
    } catch (error) {
      console.error('Error fetching recordings:', error);
      throw error;
    }
  }

  async getRecordingUrl(recordingSid) {
    if (!this.client) {
      throw new Error('Twilio client not initialized');
    }

    try {
      const recording = await this.client.recordings(recordingSid).fetch();
      const baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${recording.accountSid}`;
      return `${baseUrl}/Recordings/${recording.sid}.mp3`;
    } catch (error) {
      console.error('Error fetching recording URL:', error);
      throw error;
    }
  }

  async downloadRecording(recordingSid) {
    if (!this.client) {
      throw new Error('Twilio client not initialized');
    }

    try {
      const recording = await this.client.recordings(recordingSid).fetch();
      return recording;
    } catch (error) {
      console.error('Error downloading recording:', error);
      throw error;
    }
  }
}

module.exports = new TwilioService();