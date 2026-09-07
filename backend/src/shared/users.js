const { QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient } = require('./dynamo');

async function findUserByEmail(email) {
  const result = await docClient.send(new QueryCommand({
    TableName: process.env.USERS_TABLE,
    IndexName: 'email-index',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: { ':email': email.trim().toLowerCase() },
    Limit: 1,
  }));
  return result.Items?.[0] || null;
}

module.exports = { findUserByEmail };