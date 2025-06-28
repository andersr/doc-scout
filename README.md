# Doc Scout

This app allows for chatting with documents that you can add either via file upload or a URL. For example, you can upload some long regulatory document and then ask questions about specific regulations.

## Development Setup

### Environment Variables

1. Create a copy of the `.env.example` file:

   ```bash
   cp .env.example .env
   ```

2. Fill in the required environment variables:

   #### Authentication

   - `AUTH_SESSION_SECRET`: Generate a secret key (e.g., using `openssl rand -hex 32`)
   - `ALLOWED_USERS`: For production, add comma-separated emails for authorized users. For development, set to "any" to allow access with any email address

   #### Adobe PDF Services

   - `ADOBE_PDF_SERVICES_CLIENT_ID`: Your Adobe PDF Services client ID
   - `ADOBE_PDF_SERVICES_CLIENT_SECRET`: Your Adobe PDF Services client secret

   Set up a PDF services project at: <https://developer.adobe.com/document-services/apis/pdf-services/>

   #### AWS

   - `AWS_DATA_BUCKET_NAME`: Name of your AWS S3 bucket
   - `AWS_S3_ACCESS_KEY`: Your AWS access key (create IAM user with AmazonS3FullAccess and AWSCloudFormationFullAccess)
   - `AWS_S3_SECRET`: Your AWS secret key
   - `AWS_REGION`: AWS region (e.g., us-east-1)
   - `AWS_CDN`: CDN URL for document web links

   #### Database

   - `DATABASE_URL`: Your PostgreSQL connection string (append `?pgbouncer=true` parameter)
   - `DIRECT_URL`: Direct URL to your PostgreSQL database

   #### Firecrawl

   - `FIRECRAWL_API_KEY`: Your Firecrawl API key

   Get an API key at: <https://www.firecrawl.dev/>

   #### OpenAI

   - `OPENAI_API_KEY`: Your OpenAI API key

   Get an API key at: <https://platform.openai.com/>

   #### Pinecone

   - `PINECONE_API_KEY`: Your Pinecone API key
   - `PINECONE_HOST`: Your Pinecone host URL
   - `PINECONE_INDEX_NAME`: Your Pinecone index name

   Get API key and create a vector store at: <https://www.pinecone.io/>

   #### Stytch

   - `STYTCH_PROJECT_ID`: Your Stytch project ID
   - `STYTCH_SECRET`: Your Stytch secret key

   Create a project at: <https://stytch.com/>

## Testing

### Environment Setup for Testing

1. Create a test environment file:

   ```bash
   cp .env.test.example .env.test
   ```

2. Configure test-specific environment variables:

   - Use **separate test databases** and services from your development environment
   - Create a dedicated test database: `research_tool_test`
   - Use Stytch **test credentials** (not production keys)
   - Create a separate **Pinecone test index**
   - Use a separate **AWS S3 bucket** for test documents

### Unit Tests

Run unit tests with Vitest:

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run
```

### End-to-End (E2E) Tests

The project uses Playwright for e2e testing with a dedicated test environment.

#### Setup E2E Testing

1. Install Playwright browsers:

   ```bash
   npx playwright install
   ```

2. Set up test database:

   ```bash
   # Reset and seed the test database
   npm run e2e:db:reset
   ```

#### Running E2E Tests

```bash
# Run all e2e tests (includes db reset and build)
npm run e2e:run

# Run e2e tests with UI (for debugging)
npm run e2e:ui

# Run individual test command
npm run pw:test
```

#### E2E Development Workflow

```bash
# Start development server with test environment
npm run e2e:dev

# Open Playwright codegen for recording tests
npm run e2e:codegen

# View test database
npm run e2e:db:studio
```

#### Test Scripts Reference

| Script                  | Description                                    |
| ----------------------- | ---------------------------------------------- |
| `npm test`              | Run unit tests in watch mode                   |
| `npm run test:run`      | Run unit tests once                            |
| `npm run e2e:run`       | Full e2e test suite (db reset + build + tests) |
| `npm run e2e:dev`       | Start dev server with test environment         |
| `npm run e2e:ui`        | Run e2e tests with Playwright UI               |
| `npm run e2e:codegen`   | Record new e2e tests with Playwright           |
| `npm run e2e:db:reset`  | Reset test database                            |
| `npm run e2e:db:studio` | Open Prisma Studio for test database           |
| `npm run pw:test`       | Run Playwright tests only                      |
