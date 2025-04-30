import { z } from "zod";

const envSchema = z.object({
  AUTH_SESSION_SECRET: z.string().min(3),
  AI_API_URL: z.string().min(3),
});

export const ENV = envSchema.parse(process.env);
