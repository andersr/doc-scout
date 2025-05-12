import { z } from "zod";

const envSchema = z.object({
  AUTH_SESSION_SECRET: z.string().min(3),
  AWS_DATA_BUCKET_NAME: z.string().min(3),
  AWS_S3_ACCESS_KEY: z.string().min(3),
  AWS_S3_SECRET: z.string().min(3),
  AWS_REGION: z.string().min(3),
  SMTP_KEY: z.string().min(3),
  SMTP_PORT: z.string().min(3),
  SMTP_SERVER: z.string().min(3),
  SMTP_USER: z.string().email(),
  FIRECRAWL_API_KEY: z.string().min(3),
  OPENAI_API_KEY: z.string().min(3),
  // UPSTASH_INDEX_URL: z.string().min(3),
  // UPSTASH_INDEX_TOKEN: z.string().min(3),
  PINECONE_API_KEY: z.string().min(3),
  PINECONE_HOST: z.string().min(3),
  PINECONE_INDEX_NAME: z.string().min(3),
});

export const ENV = envSchema.parse(process.env);
