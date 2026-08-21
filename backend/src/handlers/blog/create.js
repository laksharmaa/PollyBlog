const { v4: uuidv4 } = require('uuid');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../../shared/dynamo');
const { verifyRequest } = require('../../shared/auth');
const { success, error } = require('../../shared/response');

const TABLE = process.env.BLOGS_TABLE;

exports.handler = async (event) => {
  try {
    const user = verifyRequest(event);
    const { blogTitle, blogContent, isPublic } = JSON.parse(event.body || '{}');

    if (!blogTitle || !blogContent) {
      return error(400, 'Blog title and content are required.');
    }

    const blogId = uuidv4();
    const item = {
      blogId,
      username: user.username,
      blogTitle,
      blogContent,
      isPublic: isPublic ? 'true' : 'false',
      createdAt: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({ TableName: TABLE, Item: item }));
    return success(200, { message: 'Blog created successfully', blogId });
  } catch (err) {
    if (err.statusCode) return error(err.statusCode, err.message);
    console.error('create-blog error:', err);
    return error(500, 'Could not create blog');
  }
};
