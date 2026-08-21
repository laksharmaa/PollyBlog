const { GetCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../../shared/dynamo');
const { verifyRequest } = require('../../shared/auth');
const { success, error } = require('../../shared/response');

const TABLE = process.env.SAVED_BLOGS_TABLE;

exports.handler = async (event) => {
  try {
    const user = verifyRequest(event);
    const { blogId } = event.pathParameters || {};

    if (!blogId) return error(400, 'blogId is required');

    const result = await docClient.send(new GetCommand({
      TableName: TABLE,
      Key: { username: user.username, blogId },
    }));

    if (!result.Item) return error(404, 'Blog not found');
    return success(200, result.Item);
  } catch (err) {
    if (err.statusCode) return error(err.statusCode, err.message);
    console.error('get-blog error:', err);
    return error(500, 'Could not retrieve blog');
  }
};
