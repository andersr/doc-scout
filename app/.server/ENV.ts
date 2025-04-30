import { z } from "zod";

const envSchema = z.object({
  AUTH_SESSION_SECRET: z.string().min(3),
  FIRECRAWL_API_KEY: z.string().min(3),
});

export const ENV = envSchema.parse(process.env);
