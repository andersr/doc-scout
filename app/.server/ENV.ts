import { z } from "zod";

const envSchema = z.object({
  ALLOWED_USERS: z.string().min(3),
  AWS_DATA_BUCKET_NAME: z.string().min(3),
  AWS_S3_ACCESS_KEY: z.string().min(3),
  AWS_S3_SECRET: z.string().min(3),
  AWS_REGION: z.string().min(3),
  FIRECRAWL_API_KEY: z.string().min(3),
  OPENAI_API_KEY: z.string().min(3),
  VITE_CLERK_PUBLISHABLE_KEY: z.string().min(3),
  CLERK_SECRET_KEY: z.string().min(3),
  CLERK_WEBHOOK_SIGNING_SECRET: z.string().min(3),
  PINECONE_API_KEY: z.string().min(3),
  PINECONE_HOST: z.string().min(3),
  PINECONE_INDEX_NAME: z.string().min(3),
});

export const ENV = envSchema.parse(process.env);
