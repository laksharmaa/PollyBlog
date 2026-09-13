const { randomUUID } = require('node:crypto');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');

const s3 = new S3Client({});

function getBlogImagesBucket() {
  return process.env.BLOG_IMAGES_BUCKET || process.env.S3_BUCKET_NAME;
}

function parseBase64Image(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') {
    throw new Error('Image data is required.');
  }

  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Unsupported image format. Please upload a PNG, JPG, or WebP image.');
  }

  const [, contentType, encoded] = match;
  const supportedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

  if (!supportedTypes.has(contentType)) {
    throw new Error('Only JPG, PNG, and WebP images are supported.');
  }

  const buffer = Buffer.from(encoded, 'base64');
  if (buffer.length === 0) {
    throw new Error('Uploaded image is empty.');
  }

  return { contentType, buffer };
}

function getExtensionForMimeType(mimeType) {
  switch (mimeType) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'jpg';
  }
}

function buildImageUploadKey(username, blogId, mimeType = 'image/jpeg') {
  const safeUsername = String(username || 'user').replace(/[^a-zA-Z0-9_-]+/g, '-');
  const extension = getExtensionForMimeType(mimeType);
  return `blog-images/${safeUsername}/${blogId}/${Date.now()}-${randomUUID()}.${extension}`;
}

async function optimizeImageBuffer(inputBuffer, options = {}) {
  const {
    mimeType = 'image/jpeg',
    quality = 80,
    maxWidth = 1600,
    maxHeight = 1200,
  } = options;

  const safeQuality = Math.max(20, Math.min(Number(quality) || 80, 95));
  const image = sharp(inputBuffer).rotate().resize({
    width: maxWidth,
    height: maxHeight,
    fit: 'inside',
    withoutEnlargement: true,
  });

  switch (mimeType) {
    case 'image/png':
      return image.png({ quality: safeQuality, compressionLevel: 8, adaptiveFiltering: true }).toBuffer();
    case 'image/webp':
      return image.webp({ quality: safeQuality, effort: 6 }).toBuffer();
    default:
      return image.jpeg({
        quality: safeQuality,
        mozjpeg: true,
        progressive: true,
        chromaSubsampling: '4:2:0',
      }).toBuffer();
  }
}

const DEFAULT_IMAGE_QUALITY = 82;

async function uploadBlogImage({ username, blogId, imageDataUrl }) {
  const bucket = getBlogImagesBucket();
  if (!bucket) {
    throw new Error('BLOG_IMAGES_BUCKET is not configured.');
  }

  const { contentType, buffer } = parseBase64Image(imageDataUrl);
  const optimized = await optimizeImageBuffer(buffer, {
    mimeType: contentType,
    quality: DEFAULT_IMAGE_QUALITY,
    maxWidth: 1600,
    maxHeight: 1200,
  });

  const key = buildImageUploadKey(username, blogId, contentType);
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: optimized,
    ContentType: contentType,
    CacheControl: 'max-age=31536000',
  }));

  const region = process.env.AWS_REGION || 'us-east-1';
  const imageUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  return { key, url: imageUrl };
}

const INLINE_IMAGE_PATTERN = /<img\b[^>]*?\ssrc=(["'])(data:image\/(?:png|jpeg|jpg|webp);base64,[^"']+)\1[^>]*>/gi;

async function sanitizeInlineImages(html, { username, blogId = 'content' } = {}) {
  if (!html || typeof html !== 'string' || !html.includes('base64,')) {
    return html;
  }

  const matches = [...html.matchAll(INLINE_IMAGE_PATTERN)];
  if (matches.length === 0) return html;

  let sanitized = html;

  for (const match of matches) {
    const [fullTag, , dataUrl] = match;
    try {
      const uploaded = await uploadBlogImage({ username, blogId, imageDataUrl: dataUrl });
      const fixedTag = fullTag.replace(dataUrl, uploaded.url);
      sanitized = sanitized.replace(fullTag, fixedTag);
    } catch (err) {
      // If a single embedded image is malformed/too large to process, drop
      // it rather than failing the whole save - losing one bad inline image
      // beats blocking the entire post from being saved.
      console.error('Could not upload inline image found in blogContent:', err.message);
      sanitized = sanitized.replace(fullTag, '');
    }
  }

  return sanitized;
}

module.exports = {
  parseBase64Image,
  buildImageUploadKey,
  optimizeImageBuffer,
  uploadBlogImage,
  sanitizeInlineImages,
};