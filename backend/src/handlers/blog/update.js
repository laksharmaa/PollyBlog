const { GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../../shared/dynamo');
const { verifyRequest } = require('../../shared/auth');
const { success, error } = require('../../shared/response');
const { uploadBlogImage, sanitizeInlineImages } = require('../../shared/imageUpload');

const TABLE = process.env.BLOGS_TABLE;

exports.handler = async (event) => {
  try {
    const user = verifyRequest(event);
    const { blogId } = event.pathParameters || {};
    const { blogTitle, blogContent, isPublic, imageDataUrl, removeImage } = JSON.parse(event.body || '{}');

    if (!blogId) return error(400, 'blogId is required');
    if (!blogTitle?.trim() || !blogContent?.trim()) {
      return error(400, 'Blog title and content are required.');
    }

    const existing = await docClient.send(new GetCommand({
      TableName: TABLE,
      Key: { username: user.username, blogId },
    }));
    if (!existing.Item) return error(404, 'Blog not found');

    const safeContent = await sanitizeInlineImages(blogContent, { username: user.username, blogId });

    let updateExpression = 'SET blogTitle = :title, blogContent = :content, isPublic = :public, updatedAt = :updatedAt';
    const expressionAttributeValues = {
      ':title': blogTitle.trim(),
      ':content': safeContent,
      ':public': isPublic === true || isPublic === 'true' ? 'true' : 'false',
      ':updatedAt': new Date().toISOString(),
    };

    if (imageDataUrl) {
      const uploaded = await uploadBlogImage({
        username: user.username,
        blogId,
        imageDataUrl,
      });
      updateExpression += ', imageUrl = :imageUrl, imageKey = :imageKey';
      expressionAttributeValues[':imageUrl'] = uploaded.url;
      expressionAttributeValues[':imageKey'] = uploaded.key;
    } else if (removeImage) {
      updateExpression += ', imageUrl = :imageUrl, imageKey = :imageKey';
      expressionAttributeValues[':imageUrl'] = null;
      expressionAttributeValues[':imageKey'] = null;
    }

    await docClient.send(new UpdateCommand({
      TableName: TABLE,
      Key: { username: user.username, blogId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    }));

    return success(200, { message: 'Blog updated successfully', blogId });
  } catch (err) {
    if (err.statusCode) return error(err.statusCode, err.message);
    console.error('update-blog error:', err);
    return error(500, err.message || 'Could not update blog');
  }
};
