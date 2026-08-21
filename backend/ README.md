# Blog Platform Backend — AWS SAM

Migrated from Serverless Framework. Same API routes your frontend already
calls, rebuilt as plain Lambda handlers (no Express/`serverless-http`),
AWS SDK v3, and all infrastructure defined in `template.yaml` instead of
being created by hand in the console.

## What changed vs. the old `serverless.yml` project

| Old | New |
|---|---|
| Express app + `serverless-http` per service | Native Lambda handler per route |
| `aws-sdk` v2 | `@aws-sdk/*` v3 (modular, smaller) |
| `nodejs18.x` | `nodejs22.x` (current LTS — `nodejs20.x` is already past its deprecation date) |
| Auth middleware copy-pasted 3x | `src/shared/auth.js`, shared by every handler |
| Tables/bucket created by hand, only referenced by ARN | `UsersTable`, `BlogsTable`, `SavedBlogsTable`, `AudioBucket` all defined as CloudFormation resources in `template.yaml` |
| `JWT_SECRET: abcd1234` committed in `serverless.yml` | Passed as a deploy-time parameter, never committed |
| 15MB `node_modules.zip` Lambda Layer | esbuild bundles only what each function needs |
| `register` silently overwrote an existing user | Now returns `409 Conflict` if the username exists |

**Routes are unchanged** — `/register`, `/login`, `/api/create-blog`,
`/api/save-blog`, `/api/get-blogs`, `/api/get-blog/{blogId}`,
`/api/delete-blog`, `/api/public-blogs`, `/api/public-blog/{blogId}`,
`/api/speech` — same methods, same request/response bodies. Your existing
frontend only needs its base API URL updated after deploy.

## Data model note (please sanity-check this)

Your old table ARNs referenced `Blogs` (with `isPublic-index` and
`blogId-index` GSIs) and `SavedBlogs`, but neither table's actual key
schema was defined anywhere in the repo — they were created by hand. I
reconstructed the schema from how the code queries them:

- **BlogsTable**: PK `username`, SK `blogId`, GSI `isPublic-index` (PK
  `isPublic`), GSI `blogId-index` (PK `blogId`) — public/community posts.
- **SavedBlogsTable**: PK `username`, SK `blogId` — private drafts.
- **UsersTable**: PK `username`.

Since you're deploying fresh (empty) tables, this doesn't need to match
any existing data — just flagging it so you know it's a reconstruction,
not a copy of settings from your AWS console. If you still have the old
stack running and want to migrate existing rows, tell me and we'll add an
export/import step before you tear it down.

## Prerequisites

1. **Node.js 20+** and npm.
2. **AWS CLI**, configured with credentials that can create Lambda, API
   Gateway, DynamoDB, S3, and IAM resources:
   ```bash
   aws configure
   ```
3. **AWS SAM CLI**:
   ```bash
   # macOS
   brew install aws-sam-cli
   # or see https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
   sam --version
   ```

## One-time setup

```bash
cd sam-backend
npm install          # installs esbuild + the runtime deps sam build bundles per function

# Generate a real secret - don't use the old "abcd1234"
openssl rand -base64 48
```

Copy `samconfig.toml.example` to `samconfig.toml` and paste that secret
into `parameter_overrides`. `samconfig.toml` is gitignored — don't commit
your real secret.

```bash
cp samconfig.toml.example samconfig.toml
# edit samconfig.toml, set JwtSecret and region if needed
```

## Deploy

```bash
sam build
sam deploy
```

First time only, you can run `sam deploy --guided` instead and answer the
prompts interactively (it writes `samconfig.toml` for you) — but since
`JwtSecret` has `NoEcho: true`, it's cleaner to just set it directly in
`samconfig.toml` as shown above.

When it finishes, grab the API URL:

```bash
aws cloudformation describe-stacks \
  --stack-name blog-platform-backend \
  --query "Stacks[0].Outputs"
```

Update your frontend's API base URL to the `ApiUrl` output, redeploy the
frontend, and you're done.

## Local testing before you deploy

```bash
sam build
sam local start-api
# API now listening on http://127.0.0.1:3000, same routes as above
```

`sam local` runs Lambda in Docker, so Docker must be running. It reads
DynamoDB/S3 credentials from your AWS CLI profile, so local runs hit your
real (or a separate dev) AWS account — there's no local DynamoDB
configured here. If you want fully offline testing, say so and I'll wire
up `dynamodb-local` via a `docker-compose.yml`.

## Migrating your existing data

Your old tables are named `Users`, `Blogs`, `SavedBlogs` (confirmed from
the old code). The new stack creates tables named
`<stack-name>-Users`, `<stack-name>-Blogs`, `<stack-name>-SavedBlogs` —
with `stack_name = "blog-platform-backend"` in `samconfig.toml.example`,
that's `blog-platform-backend-Users`, etc.

**Do this in order:**

1. **Verify the old tables' real key schema first**, since it was never in
   code — only clicked together in the console:
   ```bash
   aws dynamodb describe-table --table-name Users --query "Table.KeySchema"
   aws dynamodb describe-table --table-name Blogs --query "Table.KeySchema"
   aws dynamodb describe-table --table-name SavedBlogs --query "Table.KeySchema"
   ```
   Compare against what's in `template.yaml` (`UsersTable`, `BlogsTable`,
   `SavedBlogsTable` resources). The migration script itself doesn't
   actually care about the old table's key schema — it copies whole items,
   not key-by-key — but if your old `Blogs` table's schema is wildly
   different from what I reconstructed (e.g. it has extra GSIs your
   frontend depends on), tell me and I'll adjust `template.yaml` before
   you deploy.

2. **Deploy the new stack** (creates new, empty tables — doesn't touch the
   old ones):
   ```bash
   sam build
   sam deploy
   ```

3. **Migrate the data.** The migration script scans each old table and
   batch-writes every item into the corresponding new table:
   ```bash
   npm install   # if you haven't already
   npm run migrate -- blog-platform-backend ap-south-1
   ```
   Add `--dry-run` on the end first if you just want item counts without
   writing anything:
   ```bash
   npm run migrate -- blog-platform-backend ap-south-1 --dry-run
   ```
   Or migrate one table at a time:
   ```bash
   node scripts/migrate-data.js --from Users --to blog-platform-backend-Users
   node scripts/migrate-data.js --from Blogs --to blog-platform-backend-Blogs
   node scripts/migrate-data.js --from SavedBlogs --to blog-platform-backend-SavedBlogs
   ```

4. **Verify.** Spot-check row counts and a few sample items in each new
   table via the AWS console or:
   ```bash
   aws dynamodb scan --table-name blog-platform-backend-Users --select COUNT
   ```
   Also test `/login` with an existing username/password against the new
   API — this confirms the bcrypt hashes carried over correctly (they're
   just copied as-is, so old passwords keep working).

5. **Point your frontend at the new API URL** and test end-to-end before
   deleting anything old.

6. Only after you're confident the new stack is good, move on to
   retiring the old one below.

## Retiring the old Serverless Framework stack

Once you've confirmed the new stack works end-to-end:

```bash
# in your OLD serverless project directory
serverless remove
```

This deletes the old Lambdas, API Gateway, and the Lambda Layer — but
**not** the DynamoDB tables or S3 bucket, since those were created outside
Serverless Framework's management. Delete those manually from the console
once you've confirmed you don't need the data, or migrated it into the
new tables.

## Known trade-offs I kept as-is (didn't fix, but flagging)

- `DELETE /api/delete-blog` takes `blogId` in the request body instead of
  the URL path. Not proper REST, but changing it means updating the
  frontend call too. Say the word and I'll switch it to
  `DELETE /api/delete-blog/{blogId}`.
- CORS is currently wide open (`AllowOrigins: ["*"]`) in `template.yaml`,
  matching your old `origin: "*"` config. Restrict it to your actual
  frontend domain before this is genuinely production-facing.
- The `BlogsTable` vs `SavedBlogsTable` split (public posts vs private
  drafts) is preserved as-is. It works, but a single table with a
  `status: draft | published` attribute would be simpler long-term if you
  ever want to revisit the data model.

## Suggested next steps (not done here, ask if you want them)

- Move `JwtSecret` into AWS Secrets Manager with rotation instead of a
  plain CloudFormation parameter.
- Add a GitHub Actions workflow (`sam build && sam deploy`) for CI/CD.
- Add a custom domain + ACM cert to the HTTP API.
- Add request validation (JSON schema) at the API Gateway level so bad
  payloads never reach Lambda.
