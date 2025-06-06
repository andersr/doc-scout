import { test as setup } from "@playwright/test";
import "dotenv/config";
import { $path as appRoutes } from "safe-routes";
// import { z } from "zod";
import { TEST_ENV } from "~/.server/TEST_ENV";

const user1TestAuthStorage = "playwright/.auth/user1.json";
// const testEnvSchema = z.object({
//   TEST_PWD: z.string().min(3),
//   TEST_USERS: z.string().min(3),
// });

// const env = process.env;

// if (!env.TEST_PWD || !env.TEST_USERS) {
//   throw new Error(
//     "Missing required environment variables: TEST_PWD and/or TEST_USERS",
//   );
// }

// const TEST_ENV = testEnvSchema.parse(env);

setup("authenticate user", async ({ request }) => {
  const testUser = TEST_ENV.TEST_USERS.split(",")[0];
  if (!testUser) {
    throw new Error("no test user found");
  }

  const emailPwd = testUser.split("|");

  if (emailPwd.length !== 2) {
    throw new Error("Invalid test credentials");
  }

  const [email, password] = emailPwd;

  const loginRoute = appRoutes("/e2e/login", {
    email,
    password,
  });

  await request.post(
    `http://localhost:${process.env.PORT || "3000"}${loginRoute}`,
  );

  await request.storageState({ path: user1TestAuthStorage });
});
