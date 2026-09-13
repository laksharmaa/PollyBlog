const { randomUUID } = require('node:crypto');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../../shared/dynamo');
const { verifyRequest } = require('../../shared/auth');
const { success, error } = require('../../shared/response');
const { uploadBlogImage, sanitizeInlineImages } = require('../../shared/imageUpload');

const TABLE = process.env.BLOGS_TABLE;

exports.handler = async (event) => {
  try {
    const user = verifyRequest(event);
    const { blogTitle, blogContent, isPublic, imageDataUrl } = JSON.parse(event.body || '{}');

    if (!blogTitle || !blogContent) {
      return error(400, 'Blog title and content are required.');
    }

    const blogId = randomUUID();
    const safeContent = await sanitizeInlineImages(blogContent, { username: user.username });
    const item = {
      blogId,
      username: user.username,
      blogTitle,
      blogContent: safeContent,
      isPublic: isPublic ? 'true' : 'false',
      createdAt: new Date().toISOString(),
    };

    if (imageDataUrl) {
      const uploaded = await uploadBlogImage({
        username: user.username,
        blogId,
        imageDataUrl,
      });
      item.imageUrl = uploaded.url;
      item.imageKey = uploaded.key;
    }

    await docClient.send(new PutCommand({ TableName: TABLE, Item: item }));
    return success(200, { message: 'Blog created successfully', blogId, imageUrl: item.imageUrl || null });
  } catch (err) {
    if (err.statusCode) return error(err.statusCode, err.message);
    console.error('create-blog error:', err);
    return error(500, err.message || 'Could not create blog');
  }
};
