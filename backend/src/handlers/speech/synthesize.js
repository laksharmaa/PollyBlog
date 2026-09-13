const crypto = require('crypto');
const { PollyClient, SynthesizeSpeechCommand } = require('@aws-sdk/client-polly');
const { verifyRequest } = require('../../shared/auth');
const { fileExistsInS3, uploadToS3, generateSignedUrl } = require('../../shared/s3');
const { success, error } = require('../../shared/response');

const polly = new PollyClient({});
const MAX_SYNCHRONOUS_TEXT_LENGTH = 3000;
const CHUNK_LENGTH = 2800;

function splitText(text, maxLength = CHUNK_LENGTH) {
  const chunks = [];
  let remaining = text.trim();

  while (remaining.length > maxLength) {
    const boundary = remaining.slice(0, maxLength + 1).search(/[.!?]["')\]]?\s[^\s]/g);
    const whitespace = remaining.lastIndexOf(' ', maxLength);
    const splitAt = boundary >= 0 ? boundary + 1 : whitespace;

    if (splitAt <= 0) {
      chunks.push(remaining.slice(0, maxLength));
      remaining = remaining.slice(maxLength).trim();
    } else {
      chunks.push(remaining.slice(0, splitAt).trim());
      remaining = remaining.slice(splitAt).trim();
    }
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}

async function synthesizeChunk(text, voiceId) {
  const hash = crypto.createHash('sha256').update(`${text}-${voiceId}`).digest('hex');
  const s3Key = `audiofiles/${hash}-${voiceId}.mp3`;

  if (!(await fileExistsInS3(s3Key))) {
    const result = await polly.send(new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: 'mp3',
      VoiceId: voiceId,
    }));

    await uploadToS3(s3Key, result.AudioStream);
  }

  return generateSignedUrl(s3Key);
}

exports.handler = async (event) => {
  try {
    verifyRequest(event);
    const { text, voiceId } = JSON.parse(event.body || '{}');

    if (!text || !voiceId) {
      return error(400, 'Text and VoiceId are required');
    }

    const chunks = splitText(text);
    const audioUrls = [];

    for (const chunk of chunks) {
      audioUrls.push(await synthesizeChunk(chunk, voiceId));
    }

    return success(200, { audioUrl: audioUrls[0], audioUrls });
  } catch (err) {
    if (err.statusCode) return error(err.statusCode, err.message);
    if (err.name === 'TextLengthExceededException') {
      return error(400, `Each narration section must be ${MAX_SYNCHRONOUS_TEXT_LENGTH} characters or fewer.`);
    }
    console.error('speech error:', err);
    return error(500, 'Could not synthesize speech or save audio');
  }
};
