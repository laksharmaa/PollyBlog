/**
 * Copies every item from one DynamoDB table into another, in place.
 * Item-level copy (Scan + BatchWrite), so it doesn't care about the old
 * table's actual key schema — it just needs the source items to already
 * contain whatever attributes the destination table's key schema needs
 * (which they do, since the Lambda handlers write those same attributes).
 *
 * Usage:
 *   node scripts/migrate-data.js --from Users --to blog-platform-backend-Users
 *   node scripts/migrate-data.js --from Blogs --to blog-platform-backend-Blogs
 *   node scripts/migrate-data.js --from SavedBlogs --to blog-platform-backend-SavedBlogs
 *
 * Optional flags:
 *   --region <region>   defaults to AWS_REGION env var or ap-south-1
 *   --dry-run           scan and report counts only, writes nothing
 */
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { region: process.env.AWS_REGION || 'ap-south-1', dryRun: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--from') opts.from = args[++i];
    else if (args[i] === '--to') opts.to = args[++i];
    else if (args[i] === '--region') opts.region = args[++i];
    else if (args[i] === '--dry-run') opts.dryRun = true;
  }
  if (!opts.from || !opts.to) {
    console.error('Usage: node migrate-data.js --from <oldTable> --to <newTable> [--region <region>] [--dry-run]');
    process.exit(1);
  }
  return opts;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function scanAll(docClient, tableName) {
  const items = [];
  let ExclusiveStartKey;
  do {
    const page = await docClient.send(new ScanCommand({ TableName: tableName, ExclusiveStartKey }));
    items.push(...(page.Items || []));
    ExclusiveStartKey = page.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return items;
}

async function batchWriteAll(docClient, tableName, items) {
  let written = 0;
  for (const batch of chunk(items, 25)) {
    let request = {
      [tableName]: batch.map((Item) => ({ PutRequest: { Item } })),
    };
    let attempt = 0;
    // Each round trip either succeeds fully or leaves UnprocessedItems to retry.
    while (Object.keys(request).length > 0) {
      const result = await docClient.send(new BatchWriteCommand({ RequestItems: request }));
      const unprocessed = result.UnprocessedItems && Object.keys(result.UnprocessedItems).length > 0
        ? result.UnprocessedItems
        : {};
      const unprocessedCount = Object.values(unprocessed).flat().length;
      const requestedCount = Object.values(request).flat().length;
      written += requestedCount - unprocessedCount;
      request = unprocessed;
      if (Object.keys(request).length > 0) {
        attempt += 1;
        const delay = Math.min(1000 * 2 ** attempt, 8000);
        console.log(`  ${unprocessedCount} unprocessed items, retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  return written;
}

async function main() {
  const { from, to, region, dryRun } = parseArgs();

  const client = new DynamoDBClient({ region });
  const docClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true },
  });

  console.log(`Scanning source table "${from}" in ${region}...`);
  const items = await scanAll(docClient, from);
  console.log(`Found ${items.length} item(s) in "${from}".`);

  if (items.length === 0) {
    console.log('Nothing to migrate.');
    return;
  }

  if (dryRun) {
    console.log(`Dry run: would write ${items.length} item(s) to "${to}". No writes performed.`);
    return;
  }

  console.log(`Writing ${items.length} item(s) to destination table "${to}"...`);
  await batchWriteAll(docClient, to, items);
  console.log(`Done. Migrated ${items.length} item(s) from "${from}" to "${to}".`);
  console.log('Spot-check a few items in the AWS console before deleting the old table.');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
