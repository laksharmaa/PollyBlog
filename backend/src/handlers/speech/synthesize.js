const crypto = require('crypto');
const { PollyClient, SynthesizeSpeechCommand } = require('@aws-sdk/client-polly');
const { verifyRequest } = require('../../shared/auth');
const { fileExistsInS3, uploadToS3, generateSignedUrl } = require('../../shared/s3');
const { success, error } = require('../../shared/response');

const polly = new PollyClient({});

exports.handler = async (event) => {
  try {
    verifyRequest(event);
    const { text, voiceId } = JSON.parse(event.body || '{}');

    if (!text || !voiceId) {
      return error(400, 'Text and VoiceId are required');
    }

    // Deterministic key so identical (text, voiceId) requests reuse the
    // cached mp3 instead of re-calling Polly.
    const hash = crypto.createHash('sha256').update(`${text}-${voiceId}`).digest('hex');
    const s3Key = `audiofiles/${hash}-${voiceId}.mp3`;

    if (await fileExistsInS3(s3Key)) {
      return success(200, { audioUrl: await generateSignedUrl(s3Key) });
    }

    const result = await polly.send(new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: 'mp3',
      VoiceId: voiceId,
    }));

    // result.AudioStream is a readable stream in Node.js runtimes.
    await uploadToS3(s3Key, result.AudioStream);

    return success(200, { audioUrl: await generateSignedUrl(s3Key) });
  } catch (err) {
    if (err.statusCode) return error(err.statusCode, err.message);
    console.error('speech error:', err);
    return error(500, 'Could not synthesize speech or save audio');
  }
};
