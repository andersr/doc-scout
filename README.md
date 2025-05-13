# Muni Admin

## Development Setup

### Environment Variables

1. Create a copy of the `.env.example` file:

   ```bash
   cp .env.example .env
   ```

2. Fill in the required environment variables:

   #### AWS

   - `AWS_DATA_BUCKET_NAME`: Name of your AWS S3 bucket
   - `AWS_S3_ACCESS_KEY`: Your AWS access key
   - `AWS_S3_SECRET`: Your AWS secret key
   - `AWS_REGION`: AWS region (e.g., us-east-1)

   #### Clerk

   - `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key (from Clerk dashboard)
   - `CLERK_SECRET_KEY`: Your Clerk secret key (from Clerk dashboard)
   - `CLERK_WEBHOOK_SIGNING_SECRET`: Your Clerk webhook signing secret (from Clerk dashboard)

   #### Development

   - `DEV_HOST`: Your ngrok domain (e.g., your-tunnel-id.ngrok.io)

   #### Database

   - `DATABASE_URL`: Your PostgreSQL connection string
   - `DIRECT_URL`: Direct URL to your PostgreSQL database

   #### Firecrawl

   - `FIRECRAWL_API_KEY`: Your Firecrawl API key

   #### OpenAI

   - `OPENAI_API_KEY`: Your OpenAI API key

   #### Pinecone

   - `PINECONE_API_KEY`: Your Pinecone API key
   - `PINECONE_HOST`: Your Pinecone host URL
   - `PINECONE_INDEX_NAME`: Your Pinecone index name

### Running with Ngrok for Clerk Webhooks

To receive webhooks from Clerk when users are created, updated, or deleted, you need to expose your local development server to the internet using ngrok:

1. Install ngrok if you haven't already:

   ```bash
   npm install -g ngrok
   # or
   brew install ngrok
   ```

2. Start your development server:

   ```bash
   npm run dev
   ```

3. In a separate terminal, start ngrok to create a tunnel to your local server:

   ```bash
   ngrok http 3000
   ```

4. Copy the HTTPS URL provided by ngrok (e.g., https://your-tunnel-id.ngrok.io)

5. Add this URL to your `.env` file:

   ```
   DEV_HOST=your-tunnel-id.ngrok.io
   ```

6. Restart your development server to apply the new DEV_HOST value

7. In your Clerk dashboard:
   - Go to Webhooks
   - Add a new webhook endpoint with the URL: `https://your-tunnel-id.ngrok.io/webhooks/clerk`
   - Select the events you want to receive (at minimum: `user.created` and `user.deleted`)
   - Save the webhook endpoint
   - Copy the "Signing Secret" and add it to your `.env` file as `CLERK_WEBHOOK_SIGNING_SECRET`

Now your local development server will receive webhook events from Clerk when users are created, updated, or deleted.

## Deployment

- [Vercel Project](https://vercel.com/starlinghome/research-tool)
