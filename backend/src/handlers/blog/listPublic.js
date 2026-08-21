const { QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../../shared/dynamo');
const { success, error } = require('../../shared/response');

const TABLE = process.env.BLOGS_TABLE;

exports.handler = async () => {
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE,
      IndexName: 'isPublic-index',
      KeyConditionExpression: 'isPublic = :isPublic',
      ExpressionAttributeValues: { ':isPublic': 'true' },
    }));

    return success(200, result.Items);
  } catch (err) {
    console.error('public-blogs error:', err);
    return error(500, 'Could not retrieve public blogs');
  }
};
