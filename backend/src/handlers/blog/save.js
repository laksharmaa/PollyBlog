const { v4: uuidv4 } = require('uuid');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../../shared/dynamo');
const { verifyRequest } = require('../../shared/auth');
const { success, error } = require('../../shared/response');

const TABLE = process.env.SAVED_BLOGS_TABLE;

exports.handler = async (event) => {
  try {
    const user = verifyRequest(event);
    const { blogContent } = JSON.parse(event.body || '{}');

    if (!blogContent) {
      return error(400, 'blogContent is required');
    }

    const blogId = uuidv4();
    const item = {
      blogId,
      username: user.username,
      blogContent,
      createdAt: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({ TableName: TABLE, Item: item }));
    return success(200, { message: 'Blog saved successfully', blogId });
  } catch (err) {
    if (err.statusCode) return error(err.statusCode, err.message);
    console.error('save-blog error:', err);
    return error(500, 'Could not save blog');
  }
};
