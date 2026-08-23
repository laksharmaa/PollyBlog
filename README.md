# PollyBlog

PollyBlog is a React blog application with JWT authentication, public and private stories, and text-to-speech narration powered by Amazon Polly. Audio is stored in Amazon S3 and reused for identical text and voice requests.

## Features

- Create, edit, publish, unpublish, and delete blog posts.
- Browse public stories and manage your own library.
- Convert blog text to speech with Amazon Polly voices.
- Cache generated audio files in S3.
- Protect account and writing actions with JWT authentication.

## Stack

- Frontend: React, Vite, React Router
- Backend: AWS Lambda, Node.js 22, AWS SAM
- Data and services: DynamoDB, S3, Amazon Polly
- Authentication: JSON Web Tokens

## Project layout

```text
frontend/        React application
backend/         AWS SAM application
  src/           Lambda handlers and shared modules
  template.yaml  API, functions, tables, and bucket definition
  samconfig.toml Deployment configuration
```

## Architecture

![PollyBlog architecture](Architectural-design.png)

## Prerequisites

- Node.js 18 or newer
- AWS CLI configured with credentials
- AWS SAM CLI
- An AWS account with permissions for Lambda, API Gateway, DynamoDB, S3, and Polly

## Local setup

Install frontend dependencies and configure the deployed API URL:

```bash
cd frontend
npm install
printf 'VITE_API_BASE_URL=https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod\n' > .env
npm run dev
```

The frontend is available at `http://localhost:5173` by default.

For backend development, install dependencies and start the SAM API locally:

```bash
cd backend
npm install
npm run local
```

The local API requires the AWS resources and environment values expected by the handlers. For normal development, point the frontend at the deployed API URL.

## Deploy the backend

The SAM template creates the HTTP API, Lambda functions, DynamoDB tables, and S3 bucket. Set a strong `JwtSecret` during deployment and never commit secrets to the repository.

```bash
cd backend
npm install
npm run build
npm run deploy:guided
```

For later deployments, use `npm run deploy`. The deployment output includes the API URL. Put that URL in `frontend/.env` as `VITE_API_BASE_URL`.

## Frontend commands

Run these from `frontend/`:

```bash
npm run dev       # start Vite development server
npm run build     # create a production build
npm run lint      # run ESLint
npm run preview   # preview the production build
```

## API

The deployed base URL is the value of the SAM `ApiUrl` output. Requests that modify or access a user's content require an `Authorization: Bearer <token>` header.

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/register` | No |
| POST | `/login` | No |
| GET | `/api/public-blogs` | No |
| GET | `/api/public-blog/{blogId}` | No |
| POST | `/api/create-blog` | Yes |
| GET | `/api/my-blogs` | Yes |
| PUT | `/api/blogs/{blogId}` | Yes |
| DELETE | `/api/blogs/{blogId}` | Yes |
| POST | `/api/speech` | Yes |

Blog create and update requests use JSON with `blogTitle`, `blogContent`, and `isPublic` fields. `isPublic` may be sent as a boolean; the backend stores it as a string for DynamoDB indexing.

## Security

- Keep `JwtSecret` and AWS credentials out of source control.
- Restrict CORS origins before using the application in production.
- Grant Lambda only the IAM permissions required by each handler.

## Contributing

Open an issue or pull request with a clear description of the change and the validation performed.
