import { z } from "zod";

const testEnvSchema = z.object({
  // TEST_PWD: z.string().min(3),
  TEST_USERS: z.string().min(3),
});

export const TEST_ENV = testEnvSchema.parse(process.env);
