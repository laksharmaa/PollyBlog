const { DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../../shared/dynamo');
const { verifyRequest } = require('../../shared/auth');
const { success, error } = require('../../shared/response');

const TABLE = process.env.BLOGS_TABLE;

exports.handler = async (event) => {
  try {
    const user = verifyRequest(event);
    const { blogId } = event.pathParameters || {};

    if (!blogId) return error(400, 'blogId is required');

    await docClient.send(new DeleteCommand({
      TableName: TABLE,
      Key: { username: user.username, blogId },
    }));

    return success(200, { message: 'Blog deleted successfully', blogId });
  } catch (err) {
    if (err.statusCode) return error(err.statusCode, err.message);
    console.error('delete-blog error:', err);
    return error(500, 'Could not delete blog');
  }
};
