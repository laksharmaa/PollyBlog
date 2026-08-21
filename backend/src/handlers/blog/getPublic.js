const { QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../../shared/dynamo');
const { success, error } = require('../../shared/response');

const TABLE = process.env.BLOGS_TABLE;

exports.handler = async (event) => {
  try {
    const { blogId } = event.pathParameters || {};
    if (!blogId) return error(400, 'blogId is required');

    const result = await docClient.send(new QueryCommand({
      TableName: TABLE,
      IndexName: 'blogId-index',
      KeyConditionExpression: 'blogId = :blogId',
      ExpressionAttributeValues: { ':blogId': blogId },
      ProjectionExpression: 'blogId, username, blogTitle, blogContent, isPublic, createdAt',
    }));

    if (result.Items.length === 0 || result.Items[0].isPublic !== 'true') {
      return error(404, 'Public blog not found');
    }

    return success(200, result.Items[0]);
  } catch (err) {
    console.error('public-blog error:', err);
    return error(500, 'Could not retrieve public blog');
  }
};
