import { z } from "zod";

const keySchema = z.string().min(3);

const envSchema = z.object({
  ADOBE_PDF_SERVICES_CLIENT_ID: keySchema,
  ADOBE_PDF_SERVICES_CLIENT_SECRET: keySchema,
  ALLOWED_USERS: keySchema,
  AUTH_SESSION_SECRET: keySchema,
  AWS_ACCESS_KEY_ID: keySchema,
  AWS_CDN_HOST: z.string().url(),
  AWS_CDN_PRIVATE_KEY_NAME: keySchema,
  AWS_CDN_PUBLIC_KEY_ID: keySchema,
  AWS_REGION: keySchema,
  AWS_S3_BUCKET_NAME: keySchema,
  AWS_SECRET_ACCESS_KEY: keySchema,
  FIRECRAWL_API_KEY: keySchema,
  GOOGLE_APP_ID: keySchema,
  GOOGLE_CLIENT_ID: keySchema,
  GOOGLE_DRIVE_API_KEY: keySchema,
  OPENAI_API_KEY: keySchema,
  PINECONE_API_KEY: keySchema,
  PINECONE_HOST: keySchema,
  PINECONE_INDEX_NAME: keySchema,
  STYTCH_PROJECT_ID: keySchema,
  STYTCH_PUBLIC_TOKEN: keySchema,
  STYTCH_SECRET: keySchema,
});

export const ENV = envSchema.parse(process.env);
