const { randomUUID } = require('node:crypto');
const { verifyRequest } = require('../../shared/auth');
const { success, error } = require('../../shared/response');
const { uploadBlogImage } = require('../../shared/imageUpload');

exports.handler = async (event) => {
  try {
    const user = verifyRequest(event);
    const { imageDataUrl } = JSON.parse(event.body || '{}');

    if (!imageDataUrl) return error(400, 'Image data is required.');

    const uploaded = await uploadBlogImage({
      username: user.username,
      blogId: `inline-${randomUUID()}`,
      imageDataUrl,
    });

    return success(200, { url: uploaded.url, key: uploaded.key });
  } catch (err) {
    if (err.statusCode) return error(err.statusCode, err.message);
    console.error('upload-image error:', err);
    return error(400, err.message || 'Could not upload image');
  }
};