import { test as setup } from "@playwright/test";
import { $path as appRoutes } from "safe-routes";
import { ENV_TEST } from "~/.server/ENV";

import { E2E_PORT } from "~/config/testing";

const user1TestAuthStorage = "playwright/.auth/user1.json";

setup("authenticate user", async ({ request }) => {
  const testUser = ENV_TEST.TEST_USERS.split(",")[0];
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

  await request.post(`http://localhost:${E2E_PORT}${loginRoute}`);

  await request.storageState({ path: user1TestAuthStorage });
});
