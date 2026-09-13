const test = require('node:test');
const assert = require('node:assert/strict');
const sharp = require('sharp');

process.env.BLOG_IMAGES_BUCKET = 'test-blog-images';

const {
  buildImageUploadKey,
  parseBase64Image,
  optimizeImageBuffer,
} = require('../src/shared/imageUpload');

test('buildImageUploadKey creates a stable blog image key', () => {
  const key = buildImageUploadKey('alice', 'blog-1', 'image/png');
  assert.match(key, /^blog-images\/alice\/blog-1\//);
  assert.match(key, /\.png$/);
});

test('parseBase64Image extracts metadata from a data URL', () => {
  const image = parseBase64Image('data:image/jpeg;base64,/9j/4AAQSkZJRg==');
  assert.equal(image.contentType, 'image/jpeg');
  assert.equal(image.buffer.length > 0, true);
});

test('optimizeImageBuffer compresses JPEG output based on quality', async () => {
  const original = await sharp({ create: { width: 1200, height: 800, channels: 3, background: { r: 255, g: 0, b: 0 } } })
    .jpeg()
    .toBuffer();

  const optimized = await optimizeImageBuffer(original, { mimeType: 'image/jpeg', quality: 40 });
  assert.ok(Buffer.isBuffer(optimized));
  assert.ok(optimized.length > 0);
  assert.ok(optimized.length <= original.length);
});
