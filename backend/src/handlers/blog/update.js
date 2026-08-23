const { GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../../shared/dynamo');
const { verifyRequest } = require('../../shared/auth');
const { success, error } = require('../../shared/response');

const TABLE = process.env.BLOGS_TABLE;

exports.handler = async (event) => {
  try {
    const user = verifyRequest(event);
    const { blogId } = event.pathParameters || {};
    const { blogTitle, blogContent, isPublic } = JSON.parse(event.body || '{}');

    if (!blogId) return error(400, 'blogId is required');
    if (!blogTitle?.trim() || !blogContent?.trim()) {
      return error(400, 'Blog title and content are required.');
    }

    const existing = await docClient.send(new GetCommand({
      TableName: TABLE,
      Key: { username: user.username, blogId },
    }));
    if (!existing.Item) return error(404, 'Blog not found');

    await docClient.send(new UpdateCommand({
      TableName: TABLE,
      Key: { username: user.username, blogId },
      UpdateExpression: 'SET blogTitle = :title, blogContent = :content, isPublic = :public, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':title': blogTitle.trim(),
        ':content': blogContent,
        ':public': isPublic === true || isPublic === 'true' ? 'true' : 'false',
        ':updatedAt': new Date().toISOString(),
      },
    }));

    return success(200, { message: 'Blog updated successfully', blogId });
  } catch (err) {
    if (err.statusCode) return error(err.statusCode, err.message);
    console.error('update-blog error:', err);
    return error(500, 'Could not update blog');
  }
};