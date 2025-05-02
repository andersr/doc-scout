import { z } from "zod";

const envSchema = z.object({
  AUTH_SESSION_SECRET: z.string().min(3),
  AWS_DATA_BUCKET_NAME: z.string().min(3),
  AWS_S3_ACCESS_KEY: z.string().min(3),
  AWS_S3_SECRET: z.string().min(3),
  AWS_REGION: z.string().min(3),
  FIRECRAWL_API_KEY: z.string().min(3),
  OPENAI_API_KEY: z.string().min(3),
  QDRANT_API_KEY: z.string().min(3),
  QDRANT_CLUSTER_ID: z.string().min(3),
});

export const ENV = envSchema.parse(process.env);
