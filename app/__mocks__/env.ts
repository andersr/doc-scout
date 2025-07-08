import { vi } from "vitest";

/**
 * Shared ENV mock for tests to prevent validation errors
 * Use this in any test file that imports modules depending on ENV
 */
export const mockEnv = () => {
  vi.mock("~/lib/ENV", () => ({
    ENV: {
      ADOBE_PDF_SERVICES_CLIENT_ID: "test",
      ADOBE_PDF_SERVICES_CLIENT_SECRET: "test",
      ALLOWED_USERS: "test@example.com",
      AUTH_SESSION_SECRET: "test-secret",
      AWS_CDN_HOST: "test-cdn.com",
      AWS_DATA_BUCKET_NAME: "test-bucket",
      AWS_REGION: "us-east-1",
      AWS_S3_ACCESS_KEY: "test-key",
      AWS_S3_SECRET: "test-secret",
      FIRECRAWL_API_KEY: "test-key",
      OPENAI_API_KEY: "test-key",
      PINECONE_API_KEY: "test-key",
      PINECONE_HOST: "test-host",
      PINECONE_INDEX_NAME: "test-index",
      STYTCH_PROJECT_ID: "test-project",
      STYTCH_SECRET: "test-secret",
    },
  }));
};

/**
 * Alternative mock path for .server modules
 */
export const mockServerEnv = () => {
  vi.mock("../../ENV", () => ({
    ENV: {
      ADOBE_PDF_SERVICES_CLIENT_ID: "test",
      ADOBE_PDF_SERVICES_CLIENT_SECRET: "test",
      ALLOWED_USERS: "test@example.com",
      AUTH_SESSION_SECRET: "test-secret",
      AWS_CDN_HOST: "test-cdn.com",
      AWS_DATA_BUCKET_NAME: "test-bucket",
      AWS_REGION: "us-east-1",
      AWS_S3_ACCESS_KEY: "test-key",
      AWS_S3_SECRET: "test-secret",
      FIRECRAWL_API_KEY: "test-key",
      OPENAI_API_KEY: "test-key",
      PINECONE_API_KEY: "test-key",
      PINECONE_HOST: "test-host",
      PINECONE_INDEX_NAME: "test-index",
      STYTCH_PROJECT_ID: "test-project",
      STYTCH_SECRET: "test-secret",
    },
  }));
};
