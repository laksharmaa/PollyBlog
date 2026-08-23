# PollyBlogs

PollyBlogs is a text-to-speech application that uses AWS Polly to generate voice narration for blog posts. Generated audio files are stored in an S3 bucket and the app avoids re-generating audio for identical text/voice combinations.

## Key features

- 🔊 Text-to-Speech Conversion: Converts blog text into audio using Amazon Polly voices (e.g. Joanna, Matthew, Ivy).
- 📦 S3 Storage: Uploads and stores audio files in Amazon S3 and retrieves existing files to avoid duplication.
- 🔐 Authentication: JWT-based authentication for user registration and protected APIs.
- 📝 Save and Replay Blogs: Users can save blog entries and replay previously generated narration.
- 🚀 Caching: Efficiently reuses existing audio when the same text + voice combination is requested.

## Tech stack

- Frontend: React
- Backend: AWS Lambda (Node.js) using the Serverless Framework
- Cloud: Amazon Polly, S3, DynamoDB
- Authentication: JWT

## Repository layout

```
frontend/
backend/
  ├─ authService/
  ├─ blogService/
  ├─ speechService/
  ├─ layers/
  └─ serverless.yml
```

## Prerequisites

- Node.js v16 or newer
- An AWS account with permissions to create/use Lambda, S3, DynamoDB, and Polly
- Serverless Framework (install globally when deploying): `npm install -g serverless`
- AWS CLI configured with credentials (or other method to provide credentials to Serverless)

## Quickstart — local setup

1. Clone the repository

```bash
git clone https://github.com/laksharmaa/PollyBlog.git
cd PollyBlog
```

2. Install dependencies

- Frontend

```bash
cd frontend
npm install
```

- Backend services (from repo root)

```bash
cd backend/authService && npm install
cd ../blogService && npm install
cd ../speechService && npm install
```

3. Configure environment

- Set the backend API base URL for the frontend. Create a `.env` in `frontend/`:

```env
VITE_API_BASE_URL=https://YOUR-API-GATEWAY-URL
```

- Update environment variables for Serverless in `serverless.yml` or via your CI/deployment system. Example:

```yaml
environment:
  JWT_SECRET: 'your-secret-key'
  S3_BUCKET_NAME: 'your-s3-bucket-name'
```

4. Create required AWS resources

- S3 bucket to store generated audio files
- DynamoDB tables (example names): `Users`, `SavedBlogs`
- Ensure your IAM role(s) allow the Lambda functions to access S3, Polly and DynamoDB

5. Deploy

From the backend directory (or individual service directories) run:

```bash
serverless deploy
```

The deployment output will show API Gateway endpoints and deployed function ARNs.

6. Run frontend locally

```bash
cd frontend
npm run dev
```

## API (verified contract)

- POST /register
- POST /login
- GET /api/public-blogs
- GET /api/public-blog/:blogId
- POST /api/create-blog
- GET /api/get-blogs
- DELETE /api/delete-blog
- POST /api/speech

## Example IAM policy (replace placeholders before use)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:GetObjectAttributes",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-s3-bucket-name/*",
        "arn:aws:s3:::your-s3-bucket-name"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "polly:SynthesizeSpeech"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/Users",
        "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/SavedBlogs"
      ]
    }
  ]
}
```

## Notes & known issues

- Ensure blog IDs (or any key used to generate object names) are generated deterministically to avoid duplicate uploads.
- Make sure IAM roles have the exact permissions required by your functions (least privilege recommended).

## Contributing

Contributions, bug reports and feature requests are welcome. Please open an issue or submit a pull request.

## License

Specify a license file in the repository if you want to make this project open-source.

## Maintainer

_Lakshya Sharma_ – Developer and maintainer
