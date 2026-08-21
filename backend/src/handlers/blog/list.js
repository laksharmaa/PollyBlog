const { QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('../../shared/dynamo');
const { verifyRequest } = require('../../shared/auth');
const { success, error } = require('../../shared/response');

const TABLE = process.env.SAVED_BLOGS_TABLE;

exports.handler = async (event) => {
  try {
    const user = verifyRequest(event);

    const result = await docClient.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'username = :username',
      ExpressionAttributeValues: { ':username': user.username },
    }));

    return success(200, result.Items);
  } catch (err) {
    if (err.statusCode) return error(err.statusCode, err.message);
    console.error('get-blogs error:', err);
    return error(500, 'Could not retrieve blogs');
  }
};
