const { DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../../shared/dynamo');
const { verifyRequest } = require('../../shared/auth');
const { success, error } = require('../../shared/response');

const TABLE = process.env.SAVED_BLOGS_TABLE;

exports.handler = async (event) => {
  try {
    const user = verifyRequest(event);
    // NOTE: kept as body payload (not a path param) to match the existing
    // frontend contract. Consider moving to DELETE /blogs/saved/{blogId}
    // in a future pass — see README.
    const { blogId } = JSON.parse(event.body || '{}');

    if (!blogId) return error(400, 'blogId is required');

    await docClient.send(new DeleteCommand({
      TableName: TABLE,
      Key: { username: user.username, blogId },
    }));

    return success(200, { message: 'Blog deleted successfully' });
  } catch (err) {
    if (err.statusCode) return error(err.statusCode, err.message);
    console.error('delete-blog error:', err);
    return error(500, 'Could not delete blog');
  }
};
